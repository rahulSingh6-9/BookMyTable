import Restaurant from "../../models/restaurant.model.js";
import { emitRestaurantStatusChanged } from "../producers/restaurant.producer.js";
import { createLog } from "../../modules/log/log.service.js";

/**
 * Handles ADMIN_COMMAND events from the admin-service
 * Topic: restaurant.admin.command
 */
/**
 * Handles professional ADMIN_COMMAND events for Restaurant Service
 */
export const handleAdminRestaurantCommand = async (event) => {
  const { action, data, payload, actor, context, correlationId, id: eventId } = event;
  
  // Support both new "data" and old "payload" naming
  const finalData = data || payload;
  const restaurantId = finalData?.id;

  if (!restaurantId) {
    console.warn(`⚠️ [RestaurantService] Admin command ${eventId} missing restaurant ID`, { event });
    return;
  }

  console.log(`🛠️ [RestaurantService] [Trace: ${correlationId || 'N/A'}] Admin ${actor?.id || 'System'} performing ${action} on Restaurant ${restaurantId}`);

  let update = {};
  switch (action) {
    case "APPROVE_RESTAURANT":
      update = { status: "approved", isActive: true, updatedAt: new Date() };
      break;
    case "SUSPEND_RESTAURANT":
      update = { status: "suspended", isActive: false, updatedAt: new Date() };
      break;
    case "REJECT_RESTAURANT":
      update = { status: "rejected", isActive: false, updatedAt: new Date() };
      break;
    case "FEATURE_RESTAURANT":
      update = { 
        isFeatured: finalData.isFeatured, 
        discoveryRanking: finalData.discoveryRanking, 
        updatedAt: new Date() 
      };
      break;
    case "HIDE_RESTAURANT":
      update = { 
        isHiddenFromDiscovery: finalData.isHiddenFromDiscovery, 
        updatedAt: new Date() 
      };
      break;
    default:
      console.warn(`⚠️ [RestaurantService] Unknown admin action: ${action}`);
      return;
  }

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, update, { new: true })
      .populate("ownerId", "name email");

    if (!restaurant) {
      console.error(`❌ [RestaurantService] Restaurant ${restaurantId} not found for event ${eventId}`);
      return;
    }

    console.log(`✅ [RestaurantService] Restaurant ${restaurantId} updated — status: ${restaurant.status}`);

    // 📡 Emit standardized specific domain event (e.g., restaurant.approved, restaurant.rejected)
    await emitRestaurantStatusChanged({
      ...restaurant.toObject(),
      correlationId,
      actorId: actor?.id,
      tenantContext: context
    }, action);

    // 📡 Also emit restaurant.updated event for read-model sync
    await emitRestaurantStatusChanged({
      ...restaurant.toObject(),
      correlationId,
      actorId: actor?.id,
      tenantContext: context
    }, "UPDATE_RESTAURANT_STATUS"); // Falls back to restaurant.updated

    // Brand Log Insertion for Status Changes
    if (action === "APPROVE_RESTAURANT" || action === "SUSPEND_RESTAURANT" || action === "REJECT_RESTAURANT") {
      await createLog({
        entityType: "brand",
        brandId: restaurant.brandId,
        entityId: restaurant._id,
        action: action,
        performedBy: actor?.id || restaurant.ownerId, // System admin or fallback
        metadata: { status: restaurant.status, isFeature: restaurant.isFeatured }
      });
    }
    
  } catch (error) {
    console.error(`❌ [RestaurantService] Error updating restaurant ${restaurantId}:`, error.message);
  }
};
