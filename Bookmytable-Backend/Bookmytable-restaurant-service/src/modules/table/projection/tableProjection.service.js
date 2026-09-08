import mongoose from "mongoose";
import Table from "../../../models/table.model.js";
import Restaurant from "../../../models/restaurant.model.js";
import { emitRestaurantPartialUpdate } from "../../../kafka/producers/restaurant.producer.js";
import { createLog } from "../../log/log.service.js";

/**
 * Calculates table statistics for a specific branch and updates the Restaurant model.
 * Triggers a partial update event so read models can sync the new metrics.
 * 
 * @param {String} branchId - The ID of the restaurant branch
 */
export const recalculateTableStats = async (branchId) => {
  try {
    if (!branchId) return;

    const branchObjectId = new mongoose.Types.ObjectId(branchId);

    // Run aggregation to calculate all metrics
    const stats = await Table.aggregate([
      {
        $match: { branch: branchObjectId, isActive: true, isDeleted: { $ne: true } },
      },
      {
        $group: {
          _id: null,
          totalTables: { $sum: 1 },
          availableTables: {
            $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] },
          },
          occupiedTables: {
            $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] },
          },
          reservedTables: {
            $sum: { $cond: [{ $eq: ["$status", "reserved"] }, 1, 0] },
          },
          inactiveTables: {
            $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] },
          },
          floors: { $addToSet: "$floor" },
          sections: { $addToSet: "$section" },
        },
      },
      {
        $project: {
          _id: 0,
          totalTables: 1,
          availableTables: 1,
          occupiedTables: 1,
          reservedTables: 1,
          inactiveTables: 1,
          totalFloors: {
            $size: {
              $filter: {
                input: "$floors",
                as: "floor",
                cond: { $ne: ["$$floor", null] }
              }
            }
          },
          totalSections: {
            $size: {
              $filter: {
                input: "$sections",
                as: "section",
                cond: { $ne: ["$$section", null] }
              }
            }
          },
        },
      },
    ]);

    const metrics = stats.length > 0 ? stats[0] : {
      totalTables: 0,
      availableTables: 0,
      occupiedTables: 0,
      reservedTables: 0,
      inactiveTables: 0,
      totalFloors: 0,
      totalSections: 0,
    };

    const tableStats = {
      ...metrics,
      hasTables: metrics.totalTables > 0,
      lastUpdated: new Date(),
    };

    // Update the Branch
    const updatedBranch = await Restaurant.findByIdAndUpdate(
      branchId,
      {
        $set: { tableStats },
      },
      { new: true }
    );

    if (updatedBranch) {
      // Broadcast the change to Read Models (Admin & Discovery)
      await emitRestaurantPartialUpdate(
        updatedBranch._id,
        updatedBranch.brandId,
        { tableStats }
      );
      
      console.log(`📊 [Projection] Recalculated table stats for branch ${branchId}: ${metrics.totalTables} tables`);
    }

    return tableStats;
  } catch (error) {
    console.error(`❌ [Projection Error] Failed to recalculate table stats for branch ${branchId}:`, error);
    throw error;
  }
};
