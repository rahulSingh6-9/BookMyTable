import OnboardingDraft from '../../models/onboarding.model.js';
import cloudinary from '../../config/cloudinary.js';
import Brand from '../../models/brand.model.js';
import Restaurant from '../../models/restaurant.model.js';
import RestaurantSettings from '../../models/restaurantSettings.model.js';
import Table from '../../models/table.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import Log from '../../models/log.model.js';
import mongoose from 'mongoose';
import { ROLES } from "../../config/roles.js";
import { 
  emitRestaurantCreated, 
  emitBrandCreated, 
  emitMembershipCreated, 
  emitTableCreated, 
  emitRestaurantOnboardingCompleted, 
  emitNotificationEmailSend 
} from "../../kafka/index.js";
import crypto from "crypto";


export const saveDraft = async (userId, data) => {
  const { currentStep, formData, completedSteps, skippedSteps, draftData, uploadedMedia } = data;
  
  const updateData = {
    currentStep,
    ...(formData && { formData }),
    ...(completedSteps && { completedSteps }),
    ...(skippedSteps && { skippedSteps }),
    ...(draftData && { draftData }),
    ...(uploadedMedia && { uploadedMedia }),
    lastSavedAt: new Date()
  };

  const draft = await OnboardingDraft.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { upsert: true, new: true }
  );

  return draft;
};

export const getDraft = async (userId) => {
  const draft = await OnboardingDraft.findOne({ userId });
  return draft;
};

export const deleteDraft = async (userId) => {
  return OnboardingDraft.findOneAndDelete({ userId });
};

export const uploadMediaService = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'bookmytable/onboarding' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id, originalName: file.originalname });
        }
      ).end(file.buffer);
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * FINAL ONBOARDING ORCHESTRATION & SUBMISSION FLOW
 */
export const submitOnboarding = async (userId, payload, ipAddress) => {
  const data = payload || {};
  
  // 1. Core validation
  if (!data.restaurantName) throw new Error("Restaurant Name is required.");
  if (!data.addressLine1 || !data.city) throw new Error("Complete location details are required.");
  if (!data.contactInfo?.primaryPhone?.e164) throw new Error("A verified contact phone number is required.");
  const hours = data.hours || data.openingHours;
  if (!hours || Object.keys(hours).length === 0) throw new Error("Business hours must be defined.");
  if (!data.tables || data.tables.length === 0) throw new Error("At least one table must be configured.");

  // Uniqueness check for restaurant slug
  const slug = data.slug || data.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const existingSlug = await Restaurant.findOne({ slug });
  if (existingSlug) {
    throw new Error("A restaurant branch with this slug/URL already exists.");
  }

  const performSave = async (session) => {
    const opt = session ? { session } : {};

    // 2. Brand Orchestration
    let brandId = data.brandId;
    let brandObj;

    if (data.onboardingMode === "create_brand" && data.brandName) {
      const brandSlug = data.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      const newBrand = await Brand.create([{
        name: data.brandName,
        description: data.brandDescription || "",
        logo: data.brandLogo || "",
        coverImage: data.brandCoverImage || data.coverImage || (data.images && data.images.length > 0 ? data.images[0] : "") || "",
        slug: brandSlug,
        normalizedName: data.brandName.toLowerCase().replace(/\s+/g, ""),
        ownerId: userId,
        status: "approved",
        isActive: true
      }], opt);
      brandObj = newBrand[0];
      brandId = newBrand[0]._id;
    } else if (data.onboardingMode === "add_branch" || brandId) {
      if (!brandId) {
        throw new Error("A valid brand selection is required to add a branch to an existing brand.");
      }

      brandObj = await Brand.findOne({ _id: brandId, isDeleted: { $ne: true } }).session(session);
      if (!brandObj) {
        throw new Error("The selected brand could not be found or has been deleted.");
      }

      // Check Brand status and activity
      if (!brandObj.isActive) {
        throw new Error("The selected brand is inactive and cannot accept new branches.");
      }
      if (brandObj.status !== "approved") {
        throw new Error("The selected brand is pending review or suspended.");
      }

      // Security check: Verify that user has permissions to add a branch
      const isOwnerDirect = brandObj.ownerId.toString() === userId.toString();
      let hasManagerMembership = false;

      if (!isOwnerDirect) {
        const membership = await BranchMembership.findOne({
          user: userId,
          brand: brandId,
          status: "active",
          role: { $in: ["owner", "co_owner", "manager"] }
        }).session(session);
        
        if (membership) {
          hasManagerMembership = true;
        }
      }

      if (!isOwnerDirect && !hasManagerMembership) {
        throw new Error("Unauthorized: You do not have permission to add a branch to this brand. Requires Owner, Co-Owner, or Manager privileges.");
      }

      // Increment brand's totalBranches count
      brandObj.totalBranches = (brandObj.totalBranches || 0) + 1;
      await brandObj.save(opt);
    } else {
      // Standalone automatic brand creation
      const internalBrandName = `${data.restaurantName} Brand`;
      const brandSlug = internalBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      const newBrand = await Brand.create([{
        name: internalBrandName,
        slug: brandSlug,
        normalizedName: internalBrandName.toLowerCase().replace(/\s+/g, ""),
        ownerId: userId,
        status: "approved",
        isActive: true
      }], opt);
      brandObj = newBrand[0];
      brandId = newBrand[0]._id;
    }

    // 3. Create Restaurant Branch (Restaurant)
    const branchCode = `BMT-${(data.restaurantName || "RESTAURANT").substring(0, 4).padEnd(4, 'X').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [restaurant] = await Restaurant.create([{
      brandId,
      branchName: data.restaurantName,
      slug,
      branchCode,
      branchType: "branch",
      description: data.description || "",
      ownerId: userId,
      logo: data.logo || data.brandLogo || (brandObj ? brandObj.logo : "") || "",
      coverImage: data.coverImage || data.brandCoverImage || (data.images && data.images.length > 0 ? data.images[0] : "") || "",
      images: data.images || [],
      contact: {
        primaryPhone: {
          countryCode: data.contactInfo?.primaryPhone?.countryCode || "+91",
          number: data.contactInfo?.primaryPhone?.number || "",
          e164: data.contactInfo?.primaryPhone?.e164 || "",
          isVerified: data.contactInfo?.primaryPhone?.isVerified || false,
        },
        email: data.contactInfo?.businessEmail?.value || "",
        supportEmail: data.contactInfo?.businessEmail?.value || "",
      },
      address: {
        country: data.country || "India",
        state: data.state || "",
        city: data.city || "",
        addressLine1: data.addressLine1 || "",
        addressLine2: data.addressLine2 || "",
        postalCode: data.pincode || "",
        landmark: data.landmark || "",
      },
      location: {
        type: "Point",
        coordinates: [parseFloat(data.lng) || 77.5946, parseFloat(data.lat) || 12.9716],
      },
      cuisines: data.cuisines || [],
      tags: data.tags || [],
      openingHours: hours,
      status: "pending", // Initially pending for admin review
      isActive: true,
    }], opt);

    const restaurantId = restaurant._id;

    // 4. Create Settings
    const settingsPayload = {
      brand: brandId,
      branch: restaurantId,
      timeSlotInterval: data.settings?.timeSlotInterval || 30,
      slotDuration: data.settings?.slotDuration || 60,
      advanceBookingDays: data.settings?.advanceBookingDays || 30,
      minGuestsPerBooking: data.settings?.minGuestsPerBooking || 1,
      maxGuestsPerBooking: data.settings?.maxGuestsPerBooking || 10,
      onlineBookingLimitPerSlot: data.settings?.onlineBookingLimitPerSlot || 10,
      autoAcceptBookings: data.settings?.autoAcceptBookings ?? true,
      waitlistEnabled: data.settings?.waitlistEnabled ?? true,
      tableBufferMinutes: data.settings?.tableBufferMinutes ?? 15,
      depositRequired: data.settings?.depositRequired ?? false,
      depositAmount: data.settings?.depositAmount || 0,
      cancellationPolicy: data.settings?.cancellationPolicy || "",
    };
    await RestaurantSettings.create([settingsPayload], opt);

    // 5. Create Tables
    const tableDocs = (data.tables || []).map(t => ({
      branch: restaurantId,
      brand: brandId,
      tableCode: t.tableCode,
      capacity: t.capacity,
      type: t.type || "indoor",
      status: "available",
      isActive: true
    }));
    const createdTables = await Table.create(tableDocs, opt);

    // Update restaurant's total tables count
    restaurant.totalTables = createdTables.length;
    await restaurant.save(opt);

    // 6. Create BranchMembership (Owner Role)
    const employeeId = `EMP-${(data.restaurantName || "EMP").substring(0, 3).padEnd(3, 'X').toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const [membershipObj] = await BranchMembership.create([{
      user: userId,
      branch: restaurantId,
      brand: brandId,
      role: ROLES.OWNER,
      status: "active",
      joinedAt: new Date(),
      isPrimaryOwner: true,
      employeeId,
      designation: "Owner",
      department: "Management",
      permissions: [
        { action: "ALL", scope: "global" }
      ]
    }], opt);

    // 7. System Audit Log
    await Log.create([{
      action: "RESTAURANT_CREATED",
      performedBy: userId,
      role: ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { branchName: data.restaurantName, branchCode },
      ipAddress
    }], opt);

    return { restaurant, brand: brandObj, tables: createdTables, membership: membershipObj };
  };

  // Execute saves using transaction session if supported, otherwise normal saves
  let savedResult;
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    savedResult = await performSave(session);
    await session.commitTransaction();
  } catch (err) {
    if (session) {
      await session.abortTransaction();
    }
    // Fallback if replica sets are not configured locally
    if (
      err && err.message &&
      (err.message.toLowerCase().includes("replica set") || 
       err.message.toLowerCase().includes("transaction"))
    ) {
      console.warn("⚠️ Local MongoDB does not support transactions. Falling back to non-transactional creation...");
      savedResult = await performSave(null);
    } else {
      throw err;
    }
  } finally {
    if (session) session.endSession();
  }

  // 8. Event Emitters (Safe: Emitted only after successful database save/commit)
  try {
    const { restaurant, brand, tables, membership } = savedResult;
    const correlationId = crypto.randomUUID();
    
    // 1. Emit brand.created event ONLY if we created a new brand
    if (brand && data.onboardingMode !== "add_branch") {
      await emitBrandCreated(brand, correlationId);
    }

    // 2. Emit restaurant.created event
    await emitRestaurantCreated(restaurant, userId, correlationId);

    // 3. Emit membership.created event
    if (membership) {
      await emitMembershipCreated(membership, correlationId);
    }

    // 4. Emit table.created event for each table
    if (tables && tables.length > 0) {
      for (const table of tables) {
        await emitTableCreated(table, correlationId);
      }
    }

    // 5. Emit restaurant.onboarding.completed event
    await emitRestaurantOnboardingCompleted({
      branchId: restaurant._id.toString(),
      brandId: restaurant.brandId.toString(),
      ownerId: userId.toString(),
      completionScore: 100
    }, correlationId);

    // 6. Emit notification.email.send event (Welcome Email request)
    await emitNotificationEmailSend({
      template: "restaurant_welcome",
      recipient: data.contactInfo?.businessEmail?.value || "",
      variables: {
        ownerName: "Owner",
        restaurantName: restaurant.branchName,
        status: restaurant.status,
        dashboardUrl: `${process.env.DASHBOARD_URL || "http://localhost:3000"}/owner`
      },
      brandId: restaurant.brandId.toString(),
      branchId: restaurant._id.toString()
    }, correlationId);

    console.log("📡 Standardized Event-Driven Onboarding pipeline completed successfully.");
  } catch (kafkaErr) {
    console.error("❌ Kafka Events emit failure:", kafkaErr.message);
  }

  // 9. Cleanup draft
  await deleteDraft(userId);

  return savedResult.restaurant;
};
