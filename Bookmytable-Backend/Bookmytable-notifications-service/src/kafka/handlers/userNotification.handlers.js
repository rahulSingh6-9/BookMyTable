import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles USER_UPDATED domain events
 * e.g., USER_BLOCKED, USER_UNBLOCKED, ROLE_CHANGED
 */
export const handleUserUpdateNotification = async (event) => {
  try {
    const { action, payload, correlationId } = event;
    const { email, name } = payload;

    logInfo("📥 [Handler] Received User Update Kafka Event", { action, email, correlationId });

    if (!email) {
      logError("⚠️ [Handler] No email found in user event. Skipping notification.");
      return;
    }

    // Map internal actions to user-friendly notification keys
    const actionMap = {
      "USER_BLOCKED": "account.blocked",
      "USER_UNBLOCKED": "account.unblocked",
      "ROLE_CHANGED": "role.updated",
    };

    const notificationKey = actionMap[action];
    const context = event.context || {};

    if (!notificationKey) {
        logInfo(`ℹ️ [Handler] Action ${action} does not require a user notification.`);
        return;
    }

    await notificationService.processNotification({
      type: "email",
      event: notificationKey,
      recipient: email,
      payload: event,
      metadata: { name, action },
      brandId: context.brandId,
      branchId: context.branchId
    });

    logInfo(`✅ [Handler] User notification sent for ${action}`);

  } catch (error) {
    logError("❌ User Update Kafka Handler Error", { error: error.message });
  }
};
