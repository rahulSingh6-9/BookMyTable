import { recalculateTableStats } from "../../modules/table/projection/tableProjection.service.js";

export const handleTableProjectionSync = async (topic, eventType, data) => {
  try {
    const { branchId } = data;

    if (!branchId) {
      console.warn(`⚠️ [Table Projection] Missing branchId in event ${eventType}`);
      return;
    }

    // Trigger recalculation
    await recalculateTableStats(branchId);
    
  } catch (error) {
    console.error(`❌ [Table Projection] Error handling event ${eventType}:`, error);
    throw error;
  }
};
