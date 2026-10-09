import mongoose from "mongoose";
import MenuItem from "../../../models/menuItem.model.js";
import MenuCategory from "../../../models/menuCategory.model.js";
import RestaurantBranch from "../../../models/restaurant.model.js";


export const calculateAndUpdateMenuMetrics = async (branchId, brandId) => {
  try {
    const branchObjectId = new mongoose.Types.ObjectId(branchId);

    // 1. Calculate active categories
    const categoryCount = await MenuCategory.countDocuments({
      branch: branchObjectId,
      isActive: true,
    });

    // 2. Aggregate menu items stats
    const itemStats = await MenuItem.aggregate([
      { 
        $match: { 
          branch: branchObjectId, 
          isActive: true 
        } 
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          featuredItemsCount: { 
            $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] } 
          },
          vegCount: {
            $sum: { $cond: [{ $in: ["$foodType", ["veg", "vegan", "jain"]] }, 1, 0] }
          },
          nonVegCount: {
            $sum: { $cond: [{ $in: ["$foodType", ["non_veg", "egg"]] }, 1, 0] }
          },
          availableItems: {
            $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] }
          },
        }
      }
    ]);

    const stats = itemStats[0] || {
      totalItems: 0,
      featuredItemsCount: 0,
      vegCount: 0,
      nonVegCount: 0,
      availableItems: 0,
    };

    // 3. Get featured item names
    const featuredItems = await MenuItem.find({
      branch: branchObjectId,
      isActive: true,
      isFeatured: true
    })
      .select("name")
      .limit(5)
      .lean();
    
    const featuredItemNames = featuredItems.map(item => item.name);

    // 4. Get popular categories
    // We can define popular categories by the number of orders on their items.
    const popularCategoriesAgg = await MenuItem.aggregate([
      {
        $match: {
          branch: branchObjectId,
          isActive: true,
        }
      },
      {
        $group: {
          _id: "$category",
          totalOrders: { $sum: "$totalOrders" },
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "menucategories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      { $project: { name: "$categoryDetails.name" } }
    ]);

    const popularCategories = popularCategoriesAgg.map(c => c.name);

    // Assemble the complete menu stats
    const menuStats = {
      totalItems: stats.totalItems,
      totalCategories: categoryCount,
      featuredItems: stats.featuredItemsCount,
      featuredItemNames,
      vegCount: stats.vegCount,
      nonVegCount: stats.nonVegCount,
      availableItems: stats.availableItems,
      hasMenu: stats.totalItems > 0,
      popularCategories,
      lastUpdated: new Date(),
    };

    console.log(`📊 [MenuProjectionService] Calculated stats for branch ${branchId}:`, menuStats);

    // Update the local RestaurantBranch Read Model directly
    const branch = await RestaurantBranch.findByIdAndUpdate(
      branchId,
      { $set: { menuStats } },
      { new: true }
    );

    if (branch) {
      // Directly sync to Discovery projection in-process
      const { syncRestaurantToDiscovery } = await import("../../discovery/discovery.service.js");
      await syncRestaurantToDiscovery(branchId);
      console.log(`✅ [MenuProjectionService] Successfully synced metrics for Branch ${branchId}`);
    }

    return menuStats;
  } catch (error) {
    console.error(`❌ [MenuProjectionService] Failed to calculate metrics for branch ${branchId}:`, error);
    throw error;
  }
};

