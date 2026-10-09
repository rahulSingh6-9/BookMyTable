import { createRestaurant, getAllRestaurants, getMyRestaurantService } from "./restaurant.services.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";
import Restaurant from "../../models/restaurant.model.js";
import Brand from "../../models/brand.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import cloudinary from "../../config/cloudinary.js";
import { syncRestaurantToDiscovery } from "../discovery/discovery.service.js";
import { updateBranchLocation, updateBranchBasicContact, requestBranchPhoneOTP, verifyBranchPhoneOTP, requestBranchEmailUpdate, verifyBranchEmailToken } from "./branchContact.service.js";
import mongoose from "mongoose";

export const updateBasicContact = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { branchId } = req.params;
    const branch = await updateBranchBasicContact(userId, branchId, req.body, req.user?.roles);
    res.status(200).json({ success: true, message: "Contact updated successfully", data: branch });
  } catch (error) { next(error); }
};

export const requestPhoneOTP = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { branchId } = req.params;
    await requestBranchPhoneOTP(userId, branchId, req.body, req.user?.roles);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) { next(error); }
};

export const verifyPhoneOTP = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { branchId } = req.params;
    const branch = await verifyBranchPhoneOTP(userId, branchId, req.body, req.user?.roles);
    res.status(200).json({ success: true, message: "Phone verified successfully", data: branch });
  } catch (error) { next(error); }
};

export const requestEmailUpdate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { branchId } = req.params;
    await requestBranchEmailUpdate(userId, branchId, req.body, req.user?.roles);
    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) { next(error); }
};

export const verifyEmailToken = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { branchId } = req.params;
    const branch = await verifyBranchEmailToken(userId, branchId, req.body, req.user?.roles);
    res.status(200).json({ success: true, message: "Email verified successfully", data: branch });
  } catch (error) { next(error); }
};

export const updateBranchLocationHandler = async (req, res, next) => {
  try {
    const branchId = req.params.id;
    const userId = req.user?.id;
    const branch = await updateBranchLocation(userId, branchId, req.body, req.user?.roles);
    res.status(200).json({ success: true, message: "Branch location updated successfully.", data: branch });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurant = await createRestaurant(req.body, req.user);

    // 📝 Log Action
    createLog({
      action: "RESTAURANT_CREATED",
      performedBy: userId,
      role: ROLES.OWNER, // Initial role
      restaurant: restaurant._id,
      metadata: { branchName: restaurant.branchName, branchCode: restaurant.branchCode },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant branch created successfully",
      data: restaurant,
    });
  } catch (err) {
    res.status(err.status || 400).json({ 
      success: false, 
      message: err.message,
      code: err.code || "BAD_REQUEST" 
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const restaurants = await getAllRestaurants(req.query);
    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyRestaurant = async (req, res) => {
  try {
    const userId = req.user.id;
    const myBranches = await getMyRestaurantService(userId);

    res.status(200).json({
      success: true,
      message: "Branches fetched successfully",
      data: myBranches,
    });
  } catch (err) {
    res.status(err.status || 400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Auto-heal validation discrepancies for seeded database documents
 */
const healBranchDocument = (branch, userId) => {
  const raw = branch._doc || {};

  // 1. Branch Name
  if (!branch.branchName) {
    branch.branchName = branch.name || raw.name || raw.branchName || "Main Branch";
    branch.markModified("branchName");
  }

  // 2. Brand ID
  if (!branch.brandId) {
    branch.brandId = branch.brand || raw.brand || raw.brandId || new mongoose.Types.ObjectId();
    branch.markModified("brandId");
  }

  // 3. Owner ID
  if (!branch.ownerId) {
    branch.ownerId = userId || branch.createdBy || raw.createdBy || raw.ownerId || new mongoose.Types.ObjectId();
    branch.markModified("ownerId");
  }

  // 4. Branch Code
  if (!branch.branchCode) {
    branch.branchCode = branch.branchCode || raw.branchCode || "BR-" + Date.now().toString().slice(-6).toUpperCase();
    branch.markModified("branchCode");
  }

  // 5. Slug
  if (!branch.slug) {
    branch.slug = branch.slug || raw.slug || (branch.branchName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4));
    branch.markModified("slug");
  }

  // 6. Address Schema Healing
  if (!branch.address || !branch.address.country || !branch.address.state || !branch.address.city || !branch.address.addressLine1) {
    const rawLoc = raw.location || branch.location || {};
    const rawAdd = branch.address || raw.address || {};

    branch.address = {
      country: rawAdd.country || rawLoc.country || "India",
      state: rawAdd.state || rawLoc.state || "Delhi",
      city: rawAdd.city || rawLoc.city || "New Delhi",
      addressLine1: rawAdd.addressLine1 || rawLoc.addressLine1 || "Plot 12, Main Sector",
      area: rawAdd.area || rawLoc.area || "",
      addressLine2: rawAdd.addressLine2 || rawLoc.addressLine2 || "",
      postalCode: rawAdd.postalCode || rawLoc.postalCode || "",
      landmark: rawAdd.landmark || rawLoc.landmark || "",
    };
    branch.markModified("address");
  }

  // 7. Coordinates Geo-JSON Schema Healing
  if (!branch.location || !branch.location.coordinates || branch.location.coordinates.length === 0) {
    const rawLoc = raw.location || {};
    branch.location = {
      type: "Point",
      coordinates: rawLoc.coordinates || [77.2090, 28.6139]
    };
    branch.markModified("location");
  }

  // 8. Operating Hours Schema Healing
  if (!branch.openingHours || !branch.openingHours.mon) {
    const rawHours = raw.openingHours || {};
    const defaultDay = { open: 540, close: 1320, isClosed: false, breaks: [] }; // 9:00 AM to 10:00 PM
    branch.openingHours = {
      mon: rawHours.mon || defaultDay,
      tue: rawHours.tue || defaultDay,
      wed: rawHours.wed || defaultDay,
      thu: rawHours.thu || defaultDay,
      fri: rawHours.fri || defaultDay,
      sat: rawHours.sat || defaultDay,
      sun: rawHours.sun || defaultDay,
    };
    branch.markModified("openingHours");
  }
};

/**
 * Upload and update Restaurant Logo
 */
export const updateRestaurantLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo image file provided" });
    }

    const branch = await Restaurant.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Restaurant branch not found" });
    }

    healBranchDocument(branch, userId);

    // Authorization check
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
    const ownerId = branch.ownerId || branch.createdBy;
    const isOwnerDirect = ownerId && ownerId.toString() === userId.toString();

    let hasManagerMembership = false;
    if (!isOwnerDirect && !isPlatformAdmin) {
      const membership = await BranchMembership.findOne({
        user: userId,
        branch: id,
        status: "active",
        role: { $in: ["owner", "co_owner", "manager"] }
      });
      if (membership) {
        hasManagerMembership = true;
      }
    }

    if (!isOwnerDirect && !isPlatformAdmin && !hasManagerMembership) {
      return res.status(403).json({ success: false, message: "Access Denied: You do not have permission to manage this branch." });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "bookmytable/branches/logos" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const logoUrl = uploadResult.secure_url;

    branch.logo = logoUrl;
    branch.updatedBy = userId;
    await branch.save();

    try {
      await syncRestaurantToDiscovery(branch._id);
    } catch (syncError) {
      console.error("⚠️ Discovery sync failure on logo update:", syncError.message);
    }

    res.status(200).json({
      success: true,
      message: "Restaurant logo updated successfully",
      data: logoUrl
    });
  } catch (error) {
    console.error("[RestaurantController] Error in updateRestaurantLogo:", error);
    next(error);
  }
};

/**
 * Upload and update Restaurant Cover Image
 */
export const updateRestaurantCoverImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No cover image file provided" });
    }

    const branch = await Restaurant.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Restaurant branch not found" });
    }

    healBranchDocument(branch, userId);

    // Authorization check: Owner, Co-Owner, Manager or Platform Admin
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
    const ownerId = branch.ownerId || branch.createdBy;
    const isOwnerDirect = ownerId && ownerId.toString() === userId.toString();

    let hasManagerMembership = false;
    if (!isOwnerDirect && !isPlatformAdmin) {
      const membership = await BranchMembership.findOne({
        user: userId,
        branch: id,
        status: "active",
        role: { $in: ["owner", "co_owner", "manager"] }
      });
      if (membership) {
        hasManagerMembership = true;
      }
    }

    if (!isOwnerDirect && !isPlatformAdmin && !hasManagerMembership) {
      return res.status(403).json({ success: false, message: "Access Denied: You do not have permission to manage this branch." });
    }

    // Helper to upload to Cloudinary stream
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "bookmytable/branches/covers" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const coverUrl = uploadResult.secure_url;

    // Update branch cover
    branch.coverImage = coverUrl;
    branch.updatedBy = userId;
    await branch.save();

    // Synchronize to Brand cover image if it exists
    const brandId = branch.brandId || branch.brand;
    if (brandId) {
      const brand = await Brand.findById(brandId);
      if (brand) {
        brand.coverImage = coverUrl;
        await brand.save();
      }
    }

    try {
      await syncRestaurantToDiscovery(branch._id);
    } catch (syncError) {
      console.error("⚠️ Discovery sync failure on cover update:", syncError.message);
    }

    res.status(200).json({
      success: true,
      message: "Restaurant cover image updated successfully",
      data: coverUrl
    });
  } catch (error) {
    console.error("[RestaurantController] Error in updateRestaurantCoverImage:", error);
    next(error);
  }
};

/**
 * Add photo(s) to Restaurant Photo Gallery
 */
export const addRestaurantGalleryImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const files = req.files || (req.file ? [req.file] : []);

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "No image file(s) provided" });
    }

    const branch = await Restaurant.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Restaurant branch not found" });
    }

    healBranchDocument(branch, userId);

    // Authorization check
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
    const ownerId = branch.ownerId || branch.createdBy;
    const isOwnerDirect = ownerId && ownerId.toString() === userId.toString();

    let hasManagerMembership = false;
    if (!isOwnerDirect && !isPlatformAdmin) {
      const membership = await BranchMembership.findOne({
        user: userId,
        branch: id,
        status: "active",
        role: { $in: ["owner", "co_owner", "manager"] }
      });
      if (membership) {
        hasManagerMembership = true;
      }
    }

    if (!isOwnerDirect && !isPlatformAdmin && !hasManagerMembership) {
      return res.status(403).json({ success: false, message: "Access Denied: You do not have permission to manage this branch." });
    }

    // Upload files sequentially or in parallel to Cloudinary
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "bookmytable/branches/gallery" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(file.buffer);
      });
    });

    const newUrls = await Promise.all(uploadPromises);

    if (!branch.images) branch.images = [];
    branch.images.push(...newUrls);
    branch.updatedBy = userId;
    await branch.save();

    try {
      await syncRestaurantToDiscovery(branch._id);
    } catch (syncError) {
      console.error("⚠️ Discovery sync failure on gallery add:", syncError.message);
    }

    res.status(200).json({
      success: true,
      message: "Gallery image(s) added successfully",
      data: newUrls
    });
  } catch (error) {
    console.error("[RestaurantController] Error in addRestaurantGalleryImage:", error);
    next(error);
  }
};

/**
 * Delete a photo from Restaurant Photo Gallery
 */
export const deleteRestaurantGalleryImage = async (req, res, next) => {
  try {
    const { id, imageId } = req.params;
    const userId = req.user?.id;

    const branch = await Restaurant.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Restaurant branch not found" });
    }

    healBranchDocument(branch, userId);

    // Authorization check
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
    const ownerId = branch.ownerId || branch.createdBy;
    const isOwnerDirect = ownerId && ownerId.toString() === userId.toString();

    let hasManagerMembership = false;
    if (!isOwnerDirect && !isPlatformAdmin) {
      const membership = await BranchMembership.findOne({
        user: userId,
        branch: id,
        status: "active",
        role: { $in: ["owner", "co_owner", "manager"] }
      });
      if (membership) {
        hasManagerMembership = true;
      }
    }

    if (!isOwnerDirect && !isPlatformAdmin && !hasManagerMembership) {
      return res.status(403).json({ success: false, message: "Access Denied: You do not have permission to manage this branch." });
    }

    if (!branch.images || branch.images.length === 0) {
      return res.status(400).json({ success: false, message: "Gallery is already empty" });
    }

    const originalLength = branch.images.length;

    // Dual-matching logic: match by index or URL
    const index = parseInt(imageId, 10);
    if (!isNaN(index) && index >= 0 && index < branch.images.length) {
      branch.images.splice(index, 1);
    } else {
      const decodedUrl = decodeURIComponent(imageId);
      branch.images = branch.images.filter(img => img !== decodedUrl && img !== imageId);
    }

    if (branch.images.length === originalLength) {
      return res.status(404).json({ success: false, message: "Image not found in gallery" });
    }

    branch.updatedBy = userId;
    await branch.save();

    try {
      await syncRestaurantToDiscovery(branch._id);
    } catch (syncError) {
      console.error("⚠️ Discovery sync failure on gallery delete:", syncError.message);
    }

    res.status(200).json({
      success: true,
      message: "Gallery image deleted successfully",
      data: branch.images
    });
  } catch (error) {
    console.error("[RestaurantController] Error in deleteRestaurantGalleryImage:", error);
    next(error);
  }
};

// ──────────────────────────────────────────────
// Branch Lifecycle Management
// ──────────────────────────────────────────────

export const deactivateBranch = async (req, res, next) => {
  try {
    const { brandId, branchId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    const branch = await Restaurant.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    healBranchDocument(branch, userId);
    
    if (branch.brandId?.toString() !== brandId) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    branch.isActive = false;
    branch.status = 'suspended';
    branch.deactivateReason = reason || "Deactivated by owner";
    branch.updatedBy = userId;
    
    await branch.save();
    
    try {
      await syncRestaurantToDiscovery(branch._id);
      
      // Log for the Branch
      createLog({
        action: "BRANCH_DEACTIVATED",
        performedBy: userId,
        restaurant: branchId,
        metadata: { branchName: branch.branchName, reason },
        ipAddress: req.ip,
      });

      // Log for the Brand
      createLog({
        action: "BRANCH_DEACTIVATED",
        performedBy: userId,
        entityType: "brand",
        brandId: brandId,
        metadata: { branchId: branchId, branchName: branch.branchName, reason },
        ipAddress: req.ip,
      });
    } catch (e) {
      console.error("Failed to sync/log deactivate", e.message);
    }

    res.status(200).json({ success: true, message: "Branch deactivated successfully", data: branch });
  } catch (error) {
    next(error);
  }
};

export const softDeleteBranch = async (req, res, next) => {
  try {
    const { brandId, branchId } = req.params;
    const userId = req.user?.id;

    const branch = await Restaurant.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    healBranchDocument(branch, userId);
    
    if (branch.brandId?.toString() !== brandId) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    branch.isDeleted = true;
    branch.deletedAt = new Date();
    branch.isActive = false;
    branch.status = 'suspended';
    branch.updatedBy = userId;
    
    await branch.save();
    
    try {
      await syncRestaurantToDiscovery(branch._id);
      
      // Log for the Branch
      createLog({
        action: "BRANCH_SOFT_DELETED",
        performedBy: userId,
        restaurant: branchId,
        metadata: { branchName: branch.branchName },
        ipAddress: req.ip,
      });

      // Log for the Brand
      createLog({
        action: "BRANCH_SOFT_DELETED",
        performedBy: userId,
        entityType: "brand",
        brandId: brandId,
        metadata: { branchId: branchId, branchName: branch.branchName },
        ipAddress: req.ip,
      });
    } catch (e) {
      console.error("Failed to sync/log soft delete", e.message);
    }

    res.status(200).json({ success: true, message: "Branch deleted successfully", data: branch });
  } catch (error) {
    next(error);
  }
};

export const restoreBranch = async (req, res, next) => {
  try {
    const { brandId, branchId } = req.params;
    const userId = req.user?.id;

    const branch = await Restaurant.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    healBranchDocument(branch, userId);
    
    if (branch.brandId?.toString() !== brandId) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    branch.isDeleted = false;
    branch.deletedAt = null;
    branch.isActive = true;
    branch.status = 'approved';
    branch.deactivateReason = null;
    branch.updatedBy = userId;
    
    await branch.save();
    
    try {
      await syncRestaurantToDiscovery(branch._id);
      
      // Log for the Branch
      createLog({
        action: "BRANCH_RESTORED",
        performedBy: userId,
        restaurant: branchId,
        metadata: { branchName: branch.branchName },
        ipAddress: req.ip,
      });

      // Log for the Brand
      createLog({
        action: "BRANCH_RESTORED",
        performedBy: userId,
        entityType: "brand",
        brandId: brandId,
        metadata: { branchId: branchId, branchName: branch.branchName },
        ipAddress: req.ip,
      });
    } catch (e) {
      console.error("Failed to sync/log restore", e.message);
    }

    res.status(200).json({ success: true, message: "Branch restored successfully", data: branch });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteBranch = async (req, res, next) => {
  try {
    const { brandId, branchId } = req.params;
    
    const branch = await Restaurant.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    healBranchDocument(branch, req.user?.id);
    
    if (branch.brandId?.toString() !== brandId) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    await Restaurant.findByIdAndDelete(branchId);
    await BranchMembership.deleteMany({ branch: branchId });
    
    try {
      await syncRestaurantToDiscovery(branch._id);
      
      // Log for the Brand (since branch is deleted)
      createLog({
        action: "BRANCH_PERMANENTLY_DELETED",
        performedBy: req.user?.id,
        entityType: "brand",
        brandId: brandId,
        metadata: { branchId: branchId, branchName: branch.branchName },
        ipAddress: req.ip,
      });
    } catch (e) {
      console.error("Failed to log permanent delete", e.message);
    }

    res.status(200).json({ success: true, message: "Branch permanently deleted" });
  } catch (error) {
    next(error);
  }
};

