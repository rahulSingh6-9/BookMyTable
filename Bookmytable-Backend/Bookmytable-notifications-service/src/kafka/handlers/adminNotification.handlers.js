import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handle Admin Invitation Event
 * Topic: admin.invited
 */
export const handleAdminInvited = async (event) => {
  try {
    const payload = event.payload || event;
    const { email, role, inviterName, inviteLink, customPermissions, expiresAt } = payload;

    logInfo("📥 Received Admin Invite Kafka Event", { email, role });

    await notificationService.processNotification({
      type: "email",
      event: "admin.invited",
      recipient: email,
      payload: event,
      metadata: { 
        ...payload,
      }
    });

  } catch (error) {
    logError("❌ Admin Invite Kafka Handler Error", { error: error.message });
  }
};
