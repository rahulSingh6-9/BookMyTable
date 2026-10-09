import mongoose from "mongoose";
import Restaurant from "../../models/restaurant.model.js";
import Brand from "../../models/brand.model.js";
import { syncRestaurantToDiscovery } from "../discovery/discovery.service.js";

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
      coordinates: [77.2090, 28.6139] // Default standard coordinates
    };
    branch.markModified("location");
    dirty = true;
  }

  // Opening Hours Schema Healing
  if (!branch.openingHours || !branch.openingHours.mon) {
    const defaultDay = { open: 540, close: 1320, isClosed: false, breaks: [] };
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
    await branch.save();
    console.warn(`✨ [BusinessWorkspaceService] Branch ${branch._id} was successfully healed of missing schema requirements.`);
  }
};

/**
 * Get comprehensive business profile and metadata for the active restaurant branch
 */
export const getBusinessProfile = async (branchId, userId) => {
  const branch = await Restaurant.findById(branchId);
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

  return {
    branch: {
      _id: branch._id,
      branchName: branch.branchName,
      slug: branch.slug,
      branchCode: branch.branchCode,
      description: branch.description,
      address: branch.address,
      location: branch.location,
      contact: branch.contact,
      cuisines: branch.cuisines,
      openingHours: branch.openingHours,
      priceForTwo: branch.priceForTwo,
      logo: branch.logo,
      coverImage: branch.coverImage,
      images: branch.images,
      tags: branch.tags,
      isActive: branch.isActive,
      status: branch.status,
      features: branch.features,
      instagram,
      facebook,
    },
    brand: {
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      website: brand.website,
      logo: brand.logo,
      coverImage: brand.coverImage,
      gstNumber: brand.gstNumber,
      panNumber: brand.panNumber,
      fssaiLicenseNumber: brand.fssaiLicenseNumber,
      status: brand.status,
      isActive: brand.isActive,
    }
  };
};

/**
 * Update restaurant and brand profile details
 */
export const updateBusinessProfile = async (branchId, userId, updateData) => {
  const branch = await Restaurant.findById(branchId);
  if (!branch) {
    const error = new Error("Restaurant branch not found");
    error.status = 404;
    throw error;
  }

  const brand = await ensureBrand(branch, userId);
  await healBranchDocument(branch, userId, brand);

  // Update Branch Fields
  if (updateData.branchName !== undefined) branch.branchName = updateData.branchName;
  if (updateData.slug !== undefined) branch.slug = updateData.slug;
  if (updateData.description !== undefined) branch.description = updateData.description;
  if (updateData.cuisines !== undefined) branch.cuisines = updateData.cuisines;
  if (updateData.priceForTwo !== undefined) branch.priceForTwo = updateData.priceForTwo;
  if (updateData.features !== undefined) branch.features = updateData.features;
  if (updateData.logo !== undefined) branch.logo = updateData.logo;
  if (updateData.coverImage !== undefined) branch.coverImage = updateData.coverImage;
  if (updateData.images !== undefined) branch.images = updateData.images;

  // Contact details for Branch
  if (!branch.contact) branch.contact = {};
  if (updateData.supportEmail !== undefined) branch.contact.email = updateData.supportEmail;
  if (updateData.contactNumber !== undefined) {
    if (!branch.contact.primaryPhone) branch.contact.primaryPhone = {};
    branch.contact.primaryPhone.number = updateData.contactNumber;
  }

  // Address details for Branch
  if (updateData.address !== undefined) {
    branch.address = {
      ...branch.address?.toObject(),
      ...updateData.address
    };
  }

  // Opening Hours for Branch
  if (updateData.openingHours !== undefined) {
    branch.openingHours = updateData.openingHours;
  }

  // Handle Social tags (instagram / facebook)
  if (updateData.instagram !== undefined || updateData.facebook !== undefined) {
    let cleanTags = (branch.tags || []).filter(tag => !tag.startsWith("social:"));
    if (updateData.instagram) cleanTags.push(`social:instagram:${updateData.instagram}`);
    if (updateData.facebook) cleanTags.push(`social:facebook:${updateData.facebook}`);
    branch.tags = cleanTags;
  }

  branch.updatedBy = userId;
  await branch.save();

  // Update Brand Fields
  if (updateData.brandName !== undefined) {
    brand.name = updateData.brandName;
    brand.normalizedName = updateData.brandName.toLowerCase().replace(/\s+/g, "");
  }
  if (updateData.brandDescription !== undefined) brand.description = updateData.brandDescription;
  if (updateData.website !== undefined) brand.website = updateData.website;
  if (updateData.logo !== undefined) brand.logo = updateData.logo;
  if (updateData.coverImage !== undefined) brand.coverImage = updateData.coverImage;
  if (updateData.gstNumber !== undefined) brand.gstNumber = updateData.gstNumber;
  if (updateData.panNumber !== undefined) brand.panNumber = updateData.panNumber;
  if (updateData.fssaiLicenseNumber !== undefined) brand.fssaiLicenseNumber = updateData.fssaiLicenseNumber;

  brand.updatedBy = userId;
  await brand.save();

  // Sync to Discovery
  try {
    await syncRestaurantToDiscovery(branch._id);
  } catch (syncError) {
    console.error("⚠️ [BusinessWorkspaceService] Discovery sync failed for branding update:", syncError.message);
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

