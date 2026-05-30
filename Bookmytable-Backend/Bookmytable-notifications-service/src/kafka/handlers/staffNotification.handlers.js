import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles STAFF_INVITED event
 */
export const handleStaffInviteNotification = async (event) => {
  try {
    const payload = event.payload || event;
    const { email, role, restaurantName } = payload;

    logInfo("📥 Received Staff Invite Kafka Event", { email, restaurantName });

    await notificationService.processNotification({
      type: "email",
      event: "staff.invited",
      recipient: email,
      payload: event,
      metadata: { 
        ...payload, // Pass all expanded properties to the email template
      }
    });

  } catch (error) {
    logError("❌ Staff Invite Kafka Handler Error", { error: error.message });
  }
};
