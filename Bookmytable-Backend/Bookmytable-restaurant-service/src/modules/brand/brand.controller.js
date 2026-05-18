import Brand from '../../models/brand.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import Restaurant from '../../models/restaurant.model.js';
import cloudinary from '../../config/cloudinary.js';
import { emitBrandUpdated } from '../../kafka/index.js';

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

    // Sync brand read model via Kafka event
    try {
      await emitBrandUpdated(brand);
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

