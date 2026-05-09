import User from "../../models/user.model.js";
import { emitUserUpdated } from "../producers/user.producer.js";

/**
 * Handles ADMIN_COMMAND events for User Service
 */
export const handleAdminUserCommand = async (event) => {
  const { action, payload, adminId } = event;
  const userId = payload?.userId ?? payload?.id;
  const { role } = payload ?? {};

  if (!userId) {
    console.warn("⚠️ [UserService] Admin command missing user ID");
    return;
  }

  console.log(`🛠️ [UserService] Processing Admin command: ${action} on User ${userId}`);

  let update = {};
  switch (action) {
    case "BAN_USER":
      update = { isBlocked: true };
      break;
    case "UNBAN_USER":
      update = { isBlocked: false };
      break;
    case "UPDATE_ROLE":
      update = { roles: [role] };
      break;
    default:
      console.warn(`⚠️ Unknown admin action: ${action}`);
      return;
  }

  try {
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");

    if (!user) {
      console.error(`❌ User ${userId} not found`);
      return;
    }

    console.log(`✅ User ${userId} updated successfully`);

    // Emit standardized user.updated event
    await emitUserUpdated(user, "STATUS_CHANGED");
    
  } catch (error) {
    console.error(`❌ Error updating user ${userId}:`, error.message);
  }
};
