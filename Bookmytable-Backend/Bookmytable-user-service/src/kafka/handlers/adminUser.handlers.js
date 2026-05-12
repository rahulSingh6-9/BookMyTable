import User from "../../models/user.model.js";
import { emitUserUpdated } from "../producers/user.producer.js";

/**
 * Handles ADMIN_COMMAND events for User Service
 */
/**
 * Handles professional ADMIN_COMMAND events for User Service
 * Supports: BAN_USER, UNBAN_USER, UPDATE_ROLE
 */
export const handleAdminUserCommand = async (event) => {
  const { action, data, actor, context, correlationId, id: eventId } = event;
  const userId = data?.userId ?? data?.id;
  const { role } = data ?? {};

  if (!userId) {
    console.warn(`⚠️ [UserService] Admin command ${eventId} missing user ID`);
    return;
  }

  console.log(`🛠️ [UserService] [Trace: ${correlationId}] Admin ${actor?.id} (${actor?.role}) performing ${action} on User ${userId}`);

  let update = {};
  let eventType = "STATUS_CHANGED";

  switch (action) {
    case "BAN_USER":
      update = { isBlocked: true, accountStatus: "blocked" };
      eventType = "USER_BLOCKED";
      break;
    case "UNBAN_USER":
      update = { isBlocked: false, accountStatus: "active" };
      eventType = "USER_UNBLOCKED";
      break;
    case "UPDATE_ROLE":
      update = { roles: [role] };
      eventType = "ROLE_CHANGED";
      break;
    default:
      console.warn(`⚠️ Unknown admin action: ${action}`);
      return;
  }

  try {
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");

    if (!user) {
      console.error(`❌ User ${userId} not found for event ${eventId}`);
      return;
    }

    console.log(`✅ User ${userId} updated successfully [Action: ${action}]`);

    // Emit standardized domain event with correlation and context
    await emitUserUpdated({
      ...user.toObject(),
      correlationId,
      actorId: actor?.id,
      tenantContext: context
    }, eventType);
    
  } catch (error) {
    console.error(`❌ Error updating user ${userId}:`, error.message);
  }
};
