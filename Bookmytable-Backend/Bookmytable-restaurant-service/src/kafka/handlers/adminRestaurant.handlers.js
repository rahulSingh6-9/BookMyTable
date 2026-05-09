import Restaurant from "../../models/restaurant.model.js";
import { emitRestaurantStatusChanged } from "../producers/restaurant.producer.js";

/**
 * Handles ADMIN_COMMAND events from the admin-service
 * Topic: restaurant.admin.command
 */
export const handleAdminRestaurantCommand = async (event) => {
  const { action, payload, adminId } = event;
  const { id } = payload;

  console.log(`🛠️  [RestaurantService] Processing Admin command: ${action} on Restaurant ${id}`);

  let update = {};
  switch (action) {
    case "APPROVE_RESTAURANT":
      update = { status: "approved", isActive: true };
      break;
    case "SUSPEND_RESTAURANT":
      update = { status: "suspended", isActive: false };
      break;
    case "REJECT_RESTAURANT":
      update = { status: "rejected", isActive: false };
      break;
    default:
      console.warn(`⚠️  [RestaurantService] Unknown admin action: ${action}`);
      return;
  }

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(id, update, { new: true }).populate("owner");

    if (!restaurant) {
      console.error(`❌ [RestaurantService] Restaurant ${id} not found`);
      return;
    }

    console.log(`✅ [RestaurantService] Restaurant ${id} updated — status: ${restaurant.status}`);

    // 📡 Emit standardized restaurant.updated event
    await emitRestaurantStatusChanged(restaurant, adminId);
    
  } catch (error) {
    console.error(`❌ [RestaurantService] Error updating restaurant ${id}:`, error.message);
  }
};
