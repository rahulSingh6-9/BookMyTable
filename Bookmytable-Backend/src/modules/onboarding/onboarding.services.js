import OnboardingDraft from '../../models/onboarding.model.js';
import cloudinary from '../../config/cloudinary.js';
import Brand from '../../models/brand.model.js';
import Restaurant from '../../models/restaurant.model.js';
import RestaurantSettings from '../../models/restaurantSettings.model.js';
import Table from '../../models/table.model.js';
import DiningAreaPricing from '../../models/diningAreaPricing.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import Log from '../../models/log.model.js';
import BusinessEmailVerification from '../../models/businessEmailVerification.model.js';
import mongoose from 'mongoose';
import { ROLES } from "../../config/roles.js";
import crypto from "crypto";
import notificationService from "../notification/notification.service.js";
import { syncRestaurantToDiscovery } from "../discovery/discovery.service.js";

const normalizeTableType = (type) => {
  if (!type) return "indoor_dining";
  const map = {
    indoor: "indoor_dining",
    outdoor: "outdoor_dining",
    rooftop: "rooftop_dining",
    private: "private_room",
    vip: "private_room",
    bar: "indoor_dining",
    indoor_dining: "indoor_dining",
    outdoor_dining: "outdoor_dining",
    rooftop_dining: "rooftop_dining",
    private_room: "private_room",
  };
  return map[type] || "indoor_dining";
};

export const saveDraft = async (userId, data) => {
  const { currentStep, formData, completedSteps, skippedSteps, draftData, uploadedMedia } = data;
  
  // Defensive verification auto-reset logic
  const existingDraft = await OnboardingDraft.findOne({ userId });
  if (existingDraft?.formData?.contactInfo && formData?.contactInfo) {
    const prevEmail = existingDraft.formData.contactInfo.businessEmail?.value;
    const currentEmail = formData.contactInfo.businessEmail?.value;
    if (prevEmail && currentEmail && prevEmail.toLowerCase().trim() !== currentEmail.toLowerCase().trim()) {
      if (formData.contactInfo.businessEmail) {
        formData.contactInfo.businessEmail.isVerified = false;
      }
    }

    const prevPhone = existingDraft.formData.contactInfo.primaryPhone?.number;
    const currentPhone = formData.contactInfo.primaryPhone?.number;
    if (prevPhone && currentPhone && prevPhone.trim() !== currentPhone.trim()) {
      if (formData.contactInfo.primaryPhone) {
        formData.contactInfo.primaryPhone.isVerified = false;
      }
    }
  }

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
  if (!data.contactInfo?.primaryPhone?.isVerified) throw new Error("A verified business phone number is required.");
  if (!data.contactInfo?.businessEmail?.isVerified) throw new Error("A verified business email address is required.");
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
    const opt = session ? { session, ordered: true } : {};

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

      // Check SaaS branch limits
      const currentBranches = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true } }).session(session);
      const { checkLimit } = await import("../subscriptions/subscription.service.js");
      await checkLimit(brandId, "maxBranches", currentBranches);

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
        isEmailVerified: data.contactInfo?.businessEmail?.isVerified || false,
        emailVerifiedAt: data.contactInfo?.businessEmail?.isVerified ? new Date() : undefined,
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

    // 5. Create Tables & Seed Pricing Configurations
    const pricingMap = new Map();

    const tableDocs = (data.tables || []).map(t => {
      const floor = t.floor || "ground";
      const floorLabel = t.floorLabel || (
        floor === "ground" ? "Ground Floor" :
        floor === "floor_1" ? "Floor 1" :
        floor === "floor_2" ? "Floor 2" :
        floor === "floor_3" ? "Floor 3" :
        floor === "floor_4" ? "Floor 4" :
        floor === "floor_5" ? "Floor 5" :
        floor === "rooftop" ? "Rooftop" :
        floor === "basement" ? "Basement" :
        floor === "mezzanine" ? "Mezzanine" :
        floor.charAt(0).toUpperCase() + floor.slice(1).replace(/_/g, " ")
      );

      const section = t.section || "couple_zone";
      const sectionLabel = t.sectionLabel || (
        section === "couple_zone" ? "Couple Zone" :
        section === "family_zone" ? "Family Zone" :
        section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, " ")
      );

      const tableType = normalizeTableType(t.type);
      const rawPrice = t.price !== undefined && t.price !== null && t.price !== ""
        ? Number(t.price)
        : (t.resolvedPrice !== undefined && t.resolvedPrice !== null ? Number(t.resolvedPrice) : (t.tablePriceOverride !== undefined ? Number(t.tablePriceOverride) : 0));
      const price = isNaN(rawPrice) ? 0 : rawPrice;

      // Collect unique section pricing config for initial branch seeding
      const pricingKey = `${floor}_${tableType}_${section}`;
      if (!pricingMap.has(pricingKey) && price > 0) {
        pricingMap.set(pricingKey, {
          branch: restaurantId,
          floor,
          diningAreaType: tableType,
          sectionType: section,
          price,
          createdBy: userId,
          updatedBy: userId
        });
      }

      return {
        branch: restaurantId,
        brand: brandId,
        tableCode: t.tableCode,
        capacity: Number(t.capacity) || 2,
        type: tableType,
        floor,
        floorLabel,
        section,
        sectionLabel,
        diningArea: t.diningArea || undefined,
        tablePriceOverride: price > 0 ? price : undefined,
        priceSource: price > 0 ? (t.priceSource || "override") : "none",
        resolvedPrice: price,
        status: "available",
        isActive: true
      };
    });

    const createdTables = await Table.create(tableDocs, opt);

    // Seed DiningAreaPricing records from onboarding tables if price was configured
    if (pricingMap.size > 0) {
      try {
        await DiningAreaPricing.insertMany(Array.from(pricingMap.values()), opt);
      } catch (pricingErr) {
        console.error("⚠️ Failed to seed DiningAreaPricing from onboarding:", pricingErr.message);
      }
    }

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

    // 8. Brand Log
    if (data.onboardingMode === "create_brand" || (!data.onboardingMode && !data.brandId)) {
      await Log.create([{
        entityType: "brand",
        brandId: brandObj._id,
        entityId: brandObj._id,
        action: "BRAND_CREATED",
        performedBy: userId,
        role: ROLES.OWNER,
        metadata: { brandName: brandObj.name, slug: brandObj.slug },
        ipAddress
      }], opt);
    } else if (data.onboardingMode === "add_branch" || data.brandId) {
      await Log.create([{
        entityType: "brand",
        brandId: brandObj._id,
        entityId: restaurantId,
        action: "BRANCH_ADDED",
        performedBy: userId,
        role: ROLES.OWNER,
        metadata: { branchName: data.restaurantName, branchId: restaurantId },
        ipAddress
      }], opt);
    }

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

  // Post-save operations
  try {
    const { restaurant } = savedResult;
    
    // Initialize SaaS Free Trial Subscription & usage limits
    try {
      const { getOrCreateSubscription, recalculateUsage } = await import("../subscriptions/subscription.service.js");
      await getOrCreateSubscription(restaurant.brandId, userId);
      await recalculateUsage(restaurant.brandId);
      console.log(`💳 SaaS Subscription & Usage aggregates initialized for Brand: ${restaurant.brandId}`);
    } catch (subErr) {
      console.error("❌ Post-Onboarding subscription auto-creation failed:", subErr.message);
    }

    // Direct Discovery Sync
    try {
      await syncRestaurantToDiscovery(restaurant._id);
    } catch (syncErr) {
      console.error("❌ Post-Onboarding discovery sync failed:", syncErr.message);
    }

    // Send Welcome Email
    const recipientEmail = data.contactInfo?.businessEmail?.value;
    if (recipientEmail) {
      try {
        await notificationService.sendRawEmail({
          to: recipientEmail,
          subject: `Welcome to BookMyTable - ${restaurant.branchName}!`,
          html: `<h3>Welcome to BookMyTable!</h3><p>Your restaurant <strong>${restaurant.branchName}</strong> has been successfully registered and is currently pending review by our team.</p><p>You can access your partner dashboard at any time to configure menus, tables, and settings.</p>`
        });
      } catch (emailErr) {
        console.error("❌ Post-Onboarding welcome email failed:", emailErr.message);
      }
    }

    console.log("✨ Direct In-Process Onboarding pipeline completed successfully.");
  } catch (err) {
    console.error("❌ Post-onboarding processing error:", err.message);
  }

  // 9. Cleanup draft
  await deleteDraft(userId);

  return {
    ...(savedResult.restaurant.toObject ? savedResult.restaurant.toObject() : savedResult.restaurant),
    brand: savedResult.brand
  };
};

export const requestBusinessEmailVerification = async (userId, email) => {
  if (!email) {
    throw new Error("Email address is required.");
  }

  // 1. Generate secure token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Set expiration to 30 minutes
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // 3. Upsert verification token
  await BusinessEmailVerification.findOneAndUpdate(
    { userId, email: email.toLowerCase().trim() },
    {
      tokenHash,
      expiresAt,
      verified: false,
      usedAt: null,
    },
    { upsert: true, new: true }
  );

  const verificationUrl = `${process.env.WEB_URL || process.env.FRONTEND_URL || "http://localhost:8080"}/verify-business-email?token=${token}&email=${encodeURIComponent(email)}`;
  
  await notificationService.sendRawEmail({
    to: email,
    subject: "Verify your Business Email - BookMyTable",
    html: `<h3>Verify Your Business Email</h3><p>Please verify your restaurant business email address by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link will expire in 30 minutes.</p>`
  });

  console.log(`✉️ Direct email verification sent for ${email}`);
  
  return { success: true, message: "Verification link sent successfully." };
};

export const verifyBusinessEmail = async (token, email) => {
  if (!token || !email) {
    throw new Error("Token and email are required for verification.");
  }

  // 1. Hash the token to compare with DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Find the verification entry
  const verification = await BusinessEmailVerification.findOne({ 
    tokenHash, 
    email: email.toLowerCase().trim() 
  });

  if (!verification) {
    throw new Error("Invalid or expired verification token.");
  }

  if (verification.verified || verification.usedAt) {
    throw new Error("This verification link has already been used.");
  }

  if (new Date() > verification.expiresAt) {
    throw new Error("This verification link has expired.");
  }

  // 3. Mark verification entry as successful
  verification.verified = true;
  verification.usedAt = new Date();
  await verification.save();

  // 4. Update the onboarding draft
  const draft = await OnboardingDraft.findOne({ userId: verification.userId });
  if (draft) {
    if (!draft.formData) draft.formData = {};
    if (!draft.formData.contactInfo) draft.formData.contactInfo = {};
    if (!draft.formData.contactInfo.businessEmail) draft.formData.contactInfo.businessEmail = {};
    
    draft.formData.contactInfo.businessEmail.value = email;
    draft.formData.contactInfo.businessEmail.isVerified = true;
    draft.markModified("formData");
    await draft.save();
    console.log(`✅ Onboarding draft business email updated to verified for userId: ${verification.userId}`);
  }

  return { success: true, message: "Business email verified successfully." };
};

