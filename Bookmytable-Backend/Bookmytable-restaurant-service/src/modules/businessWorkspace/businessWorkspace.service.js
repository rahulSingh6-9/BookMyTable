import mongoose from "mongoose";
import Restaurant from "../../models/restaurant.model.js";
import Brand from "../../models/brand.model.js";
import { emitRestaurantStatusChanged, emitBrandUpdated, emitRestaurantPartialUpdate, emitBrandPartialUpdate } from "../../kafka/index.js";

/**
 * Ensures that a Brand document exists for the given branch context, auto-healing legacy/seeded data.
 */
const ensureBrand = async (branch, userId) => {
  let brandId = branch.brandId;
  if (!brandId) {
    brandId = new mongoose.Types.ObjectId();
    branch.brandId = brandId;
    await branch.save();
    console.warn(`⚠️ [BusinessWorkspaceService] Branch did not have a brandId. Assigned new brandId: ${brandId}`);
  }

  let brand = await Brand.findById(brandId);
  if (!brand) {
    console.warn(`⚠️ [BusinessWorkspaceService] Associated brand ${brandId} not found in DB. Auto-healing with a new Brand document...`);
    const brandName = branch.branchName || "Default Brand";
    const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
    
    brand = await Brand.create({
      _id: brandId,
      name: brandName,
      slug: brandSlug,
      normalizedName: brandName.toLowerCase().replace(/\s+/g, ""),
      ownerId: userId || branch.createdBy || new mongoose.Types.ObjectId(),
      status: "approved",
      isActive: true,
    });
  } else {
    // Self-Heal existing Brand document for missing required fields on legacy seed entries
    let brandDirty = false;
    if (!brand.name) {
      brand.name = branch.branchName || "Default Brand";
      brandDirty = true;
    }
    if (!brand.slug) {
      brand.slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
      brandDirty = true;
    }
    if (!brand.normalizedName) {
      brand.normalizedName = brand.name.toLowerCase().replace(/\s+/g, "");
      brandDirty = true;
    }
    if (!brand.ownerId) {
      brand.ownerId = userId || branch.createdBy || new mongoose.Types.ObjectId();
      brandDirty = true;
    }
    if (brandDirty) {
      await brand.save();
      console.warn(`✨ [BusinessWorkspaceService] Brand ${brand._id} was successfully healed of missing schema requirements.`);
    }
  }
  return brand;
};

const healBranchDocument = async (branch, userId, brand) => {
  let dirty = false;

  if (!branch.branchName) {
    branch.branchName = brand?.name || "Default Branch";
    branch.markModified("branchName");
    dirty = true;
  }
  if (!branch.ownerId) {
    branch.ownerId = userId || brand?.ownerId || new mongoose.Types.ObjectId();
    branch.markModified("ownerId");
    dirty = true;
  }
  if (!branch.branchCode) {
    branch.branchCode = `BMT-HEAL-${Math.floor(1000 + Math.random() * 9000)}`;
    branch.markModified("branchCode");
    dirty = true;
  }
  if (!branch.slug) {
    branch.slug = branch.branchName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);
    branch.markModified("slug");
    dirty = true;
  }

  // Address Schema Healing
  if (!branch.address || !branch.address.country || !branch.address.state || !branch.address.city || !branch.address.addressLine1) {
    branch.address = {
      country: branch.address?.country || "India",
      state: branch.address?.state || "Delhi",
      city: branch.address?.city || "New Delhi",
      addressLine1: branch.address?.addressLine1 || "Plot 12, Main Sector",
      area: branch.address?.area || "",
      addressLine2: branch.address?.addressLine2 || "",
      postalCode: branch.address?.postalCode || "",
      landmark: branch.address?.landmark || "",
    };
    branch.markModified("address");
    dirty = true;
  }

  // Coordinates Geo-JSON Schema Healing
  if (!branch.location || !branch.location.coordinates || branch.location.coordinates.length === 0) {
    branch.location = {
      type: "Point",
      coordinates: [77.2090, 28.6139]
    };
    branch.markModified("location");
    dirty = true;
  }

  // Operating Hours Schema Healing (Required fields)
  if (!branch.openingHours || !branch.openingHours.mon) {
    const defaultDay = { open: 540, close: 1320, isClosed: false, breaks: [] }; // 9:00 AM to 10:00 PM
    branch.openingHours = {
      mon: defaultDay,
      tue: defaultDay,
      wed: defaultDay,
      thu: defaultDay,
      fri: defaultDay,
      sat: defaultDay,
      sun: defaultDay,
    };
    branch.markModified("openingHours");
    dirty = true;
  }

  if (dirty) {
    await branch.save({ validateBeforeSave: false });
    console.warn(`✨ [BusinessWorkspaceService] Branch ${branch._id} was successfully healed of missing schema requirements.`);
  }
};

/**
 * Get branding details for the active restaurant branch and brand
 */
export const getBrandingDetails = async (branchId, userId) => {
  const branch = await Restaurant.findById(branchId);
  if (!branch) {
    const error = new Error("Restaurant branch not found");
    error.status = 404;
    throw error;
  }

  const brand = await ensureBrand(branch, userId);
  await healBranchDocument(branch, userId, brand);

  return {
    branch,
    brand,
  };
};

/**
 * Update branding details for the active restaurant branch and brand
 */
export const updateBrandingDetails = async (branchId, updateData, userId) => {
  const branch = await Restaurant.findById(branchId);
  if (!branch) {
    const error = new Error("Restaurant branch not found");
    error.status = 404;
    throw error;
  }

  const brand = await ensureBrand(branch, userId);
  await healBranchDocument(branch, userId, brand);

  // 1. Validate slug uniqueness if slug is updated
  if (updateData.slug && updateData.slug !== branch.slug) {
    const cleanSlug = updateData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existingSlug = await Restaurant.findOne({ slug: cleanSlug, _id: { $ne: branchId } });
    if (existingSlug) {
      const error = new Error("This slug is already in use by another branch. Please select a unique slug.");
      error.status = 400;
      throw error;
    }
    branch.slug = cleanSlug;
  }

  // 2. Update Branch Identity & Media
  if (updateData.branchName) branch.branchName = updateData.branchName;
  if (updateData.description) branch.description = updateData.description;
  if (updateData.cuisines) branch.cuisines = updateData.cuisines;
  if (updateData.logo) branch.logo = updateData.logo;
  if (updateData.coverImage) branch.coverImage = updateData.coverImage;
  if (updateData.images) branch.images = updateData.images;
  branch.updatedBy = userId;

  // 3. Update Contact & Social details on Branch
  if (!branch.contact) branch.contact = {};
  if (updateData.supportEmail) branch.contact.supportEmail = updateData.supportEmail;
  
  if (updateData.contactNumber) {
    if (!branch.contact.primaryPhone) branch.contact.primaryPhone = {};
    branch.contact.primaryPhone.number = updateData.contactNumber;
  }

  // Save Social Medias inside tag strings or description to ensure database compatibility
  if (updateData.instagram || updateData.facebook) {
    const tagsSet = new Set(branch.tags || []);
    if (updateData.instagram) {
      // Remove existing instagram tags
      Array.from(tagsSet).forEach(tag => tag.startsWith("social:instagram:") && tagsSet.delete(tag));
      tagsSet.add(`social:instagram:${updateData.instagram}`);
    }
    if (updateData.facebook) {
      // Remove existing facebook tags
      Array.from(tagsSet).forEach(tag => tag.startsWith("social:facebook:") && tagsSet.delete(tag));
      tagsSet.add(`social:facebook:${updateData.facebook}`);
    }
    branch.tags = Array.from(tagsSet);
  }

  try {
    const fs = await import("fs");
    const logData = {
      _id: branch._id,
      branchName: branch.branchName,
      ownerId: branch.ownerId,
      address: branch.address,
      location: branch.location,
      openingHours: branch.openingHours,
      cuisines: branch.cuisines
    };
    fs.writeFileSync("c:\\Users\\rahul\\OneDrive\\Desktop\\PROJECTS\\Book-My-Table\\debug_backend_save.log", JSON.stringify(logData, null, 2));
  } catch (err) {
    console.error("Debug write failed", err);
  }

  await branch.save();

  // 4. Update Brand details
  if (updateData.brandName) {
    brand.name = updateData.brandName;
    brand.normalizedName = updateData.brandName.toLowerCase().replace(/\s+/g, "");
  }
  if (updateData.brandDescription) brand.description = updateData.brandDescription;
  if (updateData.website) brand.website = updateData.website;
  if (updateData.logo) brand.logo = updateData.logo;
  if (updateData.coverImage) brand.coverImage = updateData.coverImage;
  
  if (updateData.gstNumber) brand.gstNumber = updateData.gstNumber;
  if (updateData.panNumber) brand.panNumber = updateData.panNumber;
  if (updateData.fssaiLicenseNumber) brand.fssaiLicenseNumber = updateData.fssaiLicenseNumber;
  
  brand.updatedBy = userId;
  await brand.save();

  // Enforce CQRS and real-time Read-Model synchronization across Admin / Discovery services
  try {
    console.log(`📡 [BusinessWorkspaceService] Emitting brand and branch updates for brand ID: ${brand._id}, branch ID: ${branch._id}`);
    
    // Build Delta for Branch
    const branchDelta = {};
    if (updateData.branchName !== undefined) branchDelta.branchName = updateData.branchName;
    if (updateData.slug !== undefined) branchDelta.slug = updateData.slug;
    if (updateData.description !== undefined) branchDelta.description = updateData.description;
    if (updateData.cuisines !== undefined) branchDelta.cuisines = updateData.cuisines;
    if (updateData.logo !== undefined) branchDelta.logo = updateData.logo;
    if (updateData.coverImage !== undefined) branchDelta.coverImage = updateData.coverImage;
    if (updateData.images !== undefined) branchDelta.images = updateData.images;
    if (updateData.supportEmail !== undefined || updateData.contactNumber !== undefined) {
      branchDelta.contact = branch.contact;
    }
    if (updateData.instagram !== undefined || updateData.facebook !== undefined) {
      branchDelta.tags = branch.tags;
    }

    // Build Delta for Brand
    const brandDelta = {};
    if (updateData.brandName !== undefined) {
      brandDelta.name = updateData.brandName;
      brandDelta.normalizedName = brand.normalizedName;
    }
    if (updateData.brandDescription !== undefined) brandDelta.description = updateData.brandDescription;
    if (updateData.website !== undefined) brandDelta.website = updateData.website;
    if (updateData.logo !== undefined) brandDelta.logo = updateData.logo;
    if (updateData.coverImage !== undefined) brandDelta.coverImage = updateData.coverImage;
    if (updateData.gstNumber !== undefined) brandDelta.gstNumber = updateData.gstNumber;
    if (updateData.panNumber !== undefined) brandDelta.panNumber = updateData.panNumber;
    if (updateData.fssaiLicenseNumber !== undefined) brandDelta.fssaiLicenseNumber = updateData.fssaiLicenseNumber;

    if (Object.keys(branchDelta).length > 0) {
      await emitRestaurantPartialUpdate(branch._id, branch.brandId, branchDelta, null, userId);
    }
    
    if (Object.keys(brandDelta).length > 0) {
      await emitBrandPartialUpdate(brand._id, brandDelta, null, userId);
    }

  } catch (kafkaError) {
    console.error("⚠️ [BusinessWorkspaceService] Kafka event emission failed for branding update:", kafkaError.message);
  }

  return {
    branch,
    brand,
  };
};

/**
 * Get verification status details and timeline for the active restaurant branch
 */
export const getVerificationDetails = async (branchId, userId) => {
  const branch = await Restaurant.findById(branchId).populate("ownerId");
  if (!branch) {
    const error = new Error("Restaurant branch not found");
    error.status = 404;
    throw error;
  }

  const brand = await ensureBrand(branch, userId);
  await healBranchDocument(branch, userId, brand);

  // Parse Social Media values back from tags
  let instagram = "";
  let facebook = "";
  if (branch.tags && branch.tags.length > 0) {
    const igTag = branch.tags.find(tag => tag.startsWith("social:instagram:"));
    const fbTag = branch.tags.find(tag => tag.startsWith("social:facebook:"));
    if (igTag) instagram = igTag.split(":")[2] || "";
    if (fbTag) facebook = fbTag.split(":")[2] || "";
  }

  const emailVerified = branch.ownerId?.isEmailVerified || false;
  const phoneVerified = branch.contact?.primaryPhone?.isVerified || false;
  const businessApproved = branch.status === "approved";
  const locationVerified = !!(branch.address?.country && branch.address?.city && branch.location?.coordinates?.length);

  const timeline = [
    { event: "Business Created", status: "completed", date: branch.createdAt },
    { event: "Email Verified", status: emailVerified ? "completed" : "pending", date: emailVerified ? branch.createdAt : null },
    { event: "Phone Verified", status: phoneVerified ? "completed" : "pending", date: phoneVerified ? branch.updatedAt : null },
    { event: "Admin Reviewed", status: ["approved", "suspended", "rejected"].includes(branch.status) ? "completed" : "pending", date: branch.approvedAt || branch.rejectedAt || null },
    { event: "Approved", status: businessApproved ? "completed" : "pending", date: branch.approvedAt || null }
  ];

  return {
    verification: {
      email: {
        verified: emailVerified,
        email: branch.ownerId?.email || branch.contact?.email || "",
      },
      phone: {
        verified: phoneVerified,
        phone: branch.contact?.primaryPhone?.number || "",
      },
      business: {
        status: branch.status,
        approvedAt: branch.approvedAt,
        approvedBy: branch.approvedBy,
      },
      location: {
        verified: locationVerified,
        address: branch.address,
      }
    },
    instagram,
    facebook,
    timeline
  };
};
