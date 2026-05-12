import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles RESTAURANT_UPDATED event
 */
export const handleRestaurantUpdateNotification = async (event) => {
  try {
    const { action, payload, data, correlationId } = event;
    const finalPayload = payload || data; // Handle both old and new structures
    const { branchName, name, status } = finalPayload;
    const restaurantName = branchName || name;

    logInfo("📥 [Handler] Received Restaurant Update Kafka Event", { action, status, restaurantName, correlationId });

    // Identify recipient
    const recipientEmail = finalPayload.ownerEmail || finalPayload.owner?.email; 

    if (!recipientEmail) {
      logError("⚠️ [Handler] No recipient email found in event payload. Skipping notification.");
      return;
    }

    // Map internal actions to notification events
    const actionMap = {
      "APPROVE_RESTAURANT": "approved",
      "SUSPEND_RESTAURANT": "suspended",
      "REJECT_RESTAURANT": "rejected",
      "STATUS_CHANGED": status,
      "CREATED": "created"
    };

    const notificationEvent = actionMap[action] || status;
    const context = event.context || {};

    await notificationService.processNotification({
      type: "email",
      event: `restaurant.${notificationEvent}`,
      recipient: recipientEmail,
      payload: event,
      metadata: { restaurantName, status: notificationEvent },
      brandId: context.brandId || finalPayload.brandId,
      branchId: context.branchId || finalPayload.id
    });

  } catch (error) {
    logError("❌ Restaurant Update Kafka Handler Error", { error: error.message });
  }
};
