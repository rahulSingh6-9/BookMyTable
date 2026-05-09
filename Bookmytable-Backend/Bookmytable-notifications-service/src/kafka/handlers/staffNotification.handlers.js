import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles STAFF_INVITED event
 */
export const handleStaffInviteNotification = async (event) => {
  try {
    const { email, role, restaurantName, inviteLink } = event.payload || event;

    logInfo("📥 Received Staff Invite Kafka Event", { email, restaurantName });

    await notificationService.processNotification({
      type: "email",
      event: "staff.invited",
      recipient: email,
      payload: event,
      metadata: { email, role, restaurantName, inviteLink }
    });

  } catch (error) {
    logError("❌ Staff Invite Kafka Handler Error", { error: error.message });
  }
};
