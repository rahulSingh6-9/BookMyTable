import { calculateAndUpdateMenuMetrics } from "../../modules/menu/projection/menuProjection.service.js";

export const handleMenuProjectionEvent = async (event) => {
  const { data, topic } = event;
  const branchId = data?.branchId;
  const brandId = data?.brandId;

  if (!branchId) {
    console.error(`❌ [MenuProjectionHandler] Ignored event on [${topic}]: missing branchId`);
    return;
  }

  try {
    console.log(`📡 [MenuProjectionHandler] Received ${topic} for Branch ${branchId}. Initiating projection...`);
    
    // We intentionally ignore the specific item details and recalculate from scratch to maintain CQRS consistency
    await calculateAndUpdateMenuMetrics(branchId, brandId);
    
  } catch (error) {
    console.error(`❌ [MenuProjectionHandler] Error processing ${topic} for Branch ${branchId}:`, error);
  }
};
