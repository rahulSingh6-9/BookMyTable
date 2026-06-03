import Brand from '../../models/brand.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import Restaurant from '../../models/restaurant.model.js';
import cloudinary from '../../config/cloudinary.js';
import { emitBrandUpdated, emitBrandDeactivated, emitBrandArchived, emitBrandRestored, emitBrandPartialUpdate } from '../../kafka/index.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createLog } from '../log/log.service.js';

/**
 * Get all brands owned or managed by the authenticated user.
 */
export const getMyBrands = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User context missing'
      });
    }

    console.log(`[BrandController] 🔍 Fetching brands for user: ${userId}`);

    // 1. Find brands owned directly by the user
    const ownedBrands = await Brand.find({
      ownerId: userId,
      isDeleted: { $ne: true }
    });

    const ownedBrandIds = ownedBrands.map(b => b._id.toString());

    // 2. Find brands where user has a membership (active, and role is owner, co_owner, or manager)
    // We also support general active memberships to make sure managers/co-owners see them.
    const memberships = await BranchMembership.find({
      user: userId,
      status: "active",
      role: { $in: ["owner", "co_owner", "manager"] }
    }).select("brand");

    const membershipBrandIds = memberships
      .map(m => m.brand?.toString())
      .filter(id => id && !ownedBrandIds.includes(id));

    // Combine all unique brand IDs
    const allBrandIds = [...ownedBrandIds, ...membershipBrandIds];

    if (allBrandIds.length === 0) {
      return res.status(200).json({
        success: true,
        brands: []
      });
    }

    // 3. Fetch all brands in the combined list
    const brands = await Brand.find({
      _id: { $in: allBrandIds },
      isDeleted: { $ne: true }
    });

    // 4. Calculate branchCount for each brand
    const branchCounts = await Restaurant.aggregate([
      { 
        $match: { 
          brandId: { $in: brands.map(b => b._id) }, 
          isDeleted: { $ne: true } 
        } 
      },
      { 
        $group: { 
          _id: "$brandId", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const countMap = {};
    branchCounts.forEach(c => {
      countMap[c._id.toString()] = c.count;
    });

    // Format final response
    const formattedBrands = brands.map(brand => ({
      _id: brand._id.toString(),
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
      branchCount: countMap[brand._id.toString()] || 0
    }));

    console.log(`[BrandController] ✅ Found ${formattedBrands.length} brands for user: ${userId}`);

    res.status(200).json({
      success: true,
      brands: formattedBrands
    });
  } catch (error) {
    console.error("[BrandController] ❌ Error in getMyBrands:", error);
    next(error);
  }
};

/**
 * Get all archived brands owned or managed by the authenticated user.
 */
export const getArchivedBrands = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const ownedBrands = await Brand.find({ ownerId: userId, isDeleted: true });
    const ownedBrandIds = ownedBrands.map(b => b._id.toString());

    const memberships = await BranchMembership.find({
      user: userId,
      status: "active",
      role: { $in: ["owner", "co_owner", "manager"] }
    }).select("brand");

    const membershipBrandIds = memberships
      .map(m => m.brand?.toString())
      .filter(id => id && !ownedBrandIds.includes(id));

    const allBrandIds = [...ownedBrandIds, ...membershipBrandIds];

    if (allBrandIds.length === 0) {
      return res.status(200).json({ success: true, brands: [] });
    }

    const brands = await Brand.find({ _id: { $in: allBrandIds }, isDeleted: true });

    const formattedBrands = brands.map(brand => ({
      _id: brand._id.toString(),
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
      deletedAt: brand.deletedAt
    }));

    res.status(200).json({ success: true, brands: formattedBrands });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and update the Brand Logo
 */
export const updateBrandLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo file provided"
      });
    }

    const brand = await Brand.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    // Auto-heal missing ownerId for brand
    if (!brand.ownerId) {
      brand.ownerId = brand.createdBy || userId;
    }

    // Authorization: Must be Platform Admin, Brand Owner, or have manager/co_owner membership in its branches
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
    const ownerId = brand.ownerId || brand.createdBy;
    const isOwnerDirect = ownerId && ownerId.toString() === userId.toString();

    let hasManagerMembership = false;
    if (!isOwnerDirect && !isPlatformAdmin) {
      const membership = await BranchMembership.findOne({
        user: userId,
        brand: id,
        status: "active",
        role: { $in: ["owner", "co_owner", "manager"] }
      });
      if (membership) {
        hasManagerMembership = true;
      }
    }

    if (!isOwnerDirect && !isPlatformAdmin && !hasManagerMembership) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: You do not have permission to manage this brand."
      });
    }

    // Helper to upload to Cloudinary stream
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "bookmytable/brands" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const logoUrl = uploadResult.secure_url;

    // Update Brand logo
    brand.logo = logoUrl;
    brand.updatedBy = userId;
    await brand.save();

    // Dynamically synchronize the logo onto all active branches of this brand for brand identity consistency
    await Restaurant.updateMany(
      { brandId: id, isDeleted: { $ne: true } },
      { $set: { logo: logoUrl } }
    );

    // Insert Brand Log
    await createLog({
      entityType: "brand",
      brandId: brand._id,
      entityId: brand._id,
      action: "BRAND_UPDATED",
      performedBy: userId,
      metadata: { field: "logo" },
    });

    // Sync brand read model via Kafka event
    try {
      await emitBrandPartialUpdate(brand._id, { logo: logoUrl });
    } catch (kafkaError) {
      console.error("⚠️ Kafka event emission failed for brand logo update:", kafkaError.message);
    }

    res.status(200).json({
      success: true,
      message: "Brand logo updated successfully",
      data: logoUrl
    });
  } catch (error) {
    console.error("[BrandController] Error in updateBrandLogo:", error);
    next(error);
  }
};

/**
 * Check if a user is authorized to manage the brand
 */
const isAuthorizedToManageBrand = async (userId, brandId) => {
  const brand = await Brand.findById(brandId);
  if (!brand) return { authorized: false, brand: null };

  const ownerId = brand.ownerId || brand.createdBy;
  if (ownerId && ownerId.toString() === userId.toString()) {
    return { authorized: true, brand };
  }

  const membership = await BranchMembership.findOne({
    user: userId,
    brand: brandId,
    status: "active",
    role: { $in: ["owner", "co_owner", "manager"] }
  });

  if (membership) {
    return { authorized: true, brand };
  }

  return { authorized: false, brand };
};

/**
 * Deactivate a brand (temporarily disable operations)
 */
export const deactivateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Optional: Platform Admins can bypass
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");

    const { authorized, brand } = await isAuthorizedToManageBrand(userId, id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    
    if (!authorized && !isPlatformAdmin) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const { reason, password, notifyMembers = true } = req.body;

    if (!reason || !password) {
      return res.status(400).json({ success: false, message: "Reason and password are required for deactivation" });
    }

    // Verify Password
    try {
      const dbUser = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
      if (!dbUser || !dbUser.password) {
        return res.status(401).json({ success: false, message: "User not found or password not set" });
      }
      
      const isMatch = await bcrypt.compare(password, dbUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }
    } catch (dbErr) {
      console.error("Error verifying password:", dbErr);
      return res.status(500).json({ success: false, message: "Authentication failed during deactivation" });
    }

    if (brand.isDeleted) {
      return res.status(400).json({ success: false, message: "Cannot deactivate an archived brand" });
    }

    brand.isActive = false;
    brand.updatedBy = userId;
    await brand.save();

    // Cascading effect: Also deactivate all active branches underneath it
    await Restaurant.updateMany(
      { brandId: id, isDeleted: { $ne: true }, isActive: true },
      { $set: { isActive: false, deactivatedViaBrand: true } }
    );

    // Audit Log
    await createLog({
      entityType: "brand",
      brandId: brand._id,
      entityId: brand._id,
      action: "BRAND_DEACTIVATED",
      performedBy: userId,
      metadata: { reason },
    });

    try {
      await emitBrandDeactivated(brand, null, { reason, actorId: userId, notifyMembers });
    } catch (kafkaError) {
      console.error("⚠️ Kafka event emission failed for brand deactivation:", kafkaError.message);
    }

    res.status(200).json({ success: true, message: "Brand deactivated successfully", data: brand });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive a brand (soft delete)
 */
export const archiveBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");

    const { authorized, brand } = await isAuthorizedToManageBrand(userId, id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    
    if (!authorized && !isPlatformAdmin) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    brand.isDeleted = true;
    brand.deletedAt = new Date();
    brand.isActive = false; // also mark inactive
    brand.updatedBy = userId;
    await brand.save();

    // Cascading effect: Archive all branches
    await Restaurant.updateMany(
      { brandId: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date(), isActive: false, archivedViaBrand: true } }
    );

    // Audit Log
    await createLog({
      entityType: "brand",
      brandId: brand._id,
      entityId: brand._id,
      action: "BRAND_ARCHIVED",
      performedBy: userId,
      metadata: { reason: req.body.reason || "User requested archive" },
    });

    try {
      await emitBrandArchived(brand);
    } catch (kafkaError) {
      console.error("⚠️ Kafka event emission failed for brand archive:", kafkaError.message);
    }

    res.status(200).json({ success: true, message: "Brand archived successfully", data: brand });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore an archived brand
 */
export const restoreBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");

    const brand = await Brand.findById(id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    const ownerId = brand.ownerId || brand.createdBy;
    const isOwnerDirect = ownerId && ownerId.toString() === userId.toString();
    
    // For restoration, we might not have active memberships easily available if they were archived,
    // but the user wants them preserved. Since memberships are preserved, the user is still an active manager.
    let hasManagerMembership = false;
    if (!isOwnerDirect && !isPlatformAdmin) {
      const membership = await BranchMembership.findOne({
        user: userId,
        brand: id,
        status: "active",
        role: { $in: ["owner", "co_owner", "manager"] }
      });
      if (membership) hasManagerMembership = true;
    }

    if (!isOwnerDirect && !isPlatformAdmin && !hasManagerMembership) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    brand.isDeleted = false;
    brand.deletedAt = null;
    brand.isActive = true;
    brand.updatedBy = userId;
    await brand.save();

    // Restore branches as well (only those that were archived at the exact same time? 
    // It's safer to restore all branches, or leave them for individual restoration.
    // The user rules: "Restore should: Restore Brand, Restore Branch Visibility".
    // Let's restore all branches that were archived.
    // Restore branches that were archived or deactivated via the brand
    await Restaurant.updateMany(
      { brandId: id, $or: [{ archivedViaBrand: true }, { deactivatedViaBrand: true }] },
      { 
        $set: { 
          isDeleted: false, 
          deletedAt: null, 
          isActive: true, 
          archivedViaBrand: false, 
          deactivatedViaBrand: false 
        } 
      }
    );

    // Audit Log
    await createLog({
      entityType: "brand",
      brandId: brand._id,
      entityId: brand._id,
      action: "BRAND_RESTORED",
      performedBy: userId,
      metadata: { reason: "User requested restore" },
    });

    try {
      await emitBrandRestored(brand);
    } catch (kafkaError) {
      console.error("⚠️ Kafka event emission failed for brand restoration:", kafkaError.message);
    }

    res.status(200).json({ success: true, message: "Brand restored successfully", data: brand });
  } catch (error) {
    next(error);
  }
};
