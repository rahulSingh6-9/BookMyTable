import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles RESTAURANT_UPDATED event
 */
export const handleRestaurantUpdateNotification = async (event) => {
  try {
    const { action, payload } = event;
    const { name, status } = payload;
    logInfo("📥 [Handler] Received Restaurant Update Kafka Event", { action, status, name });
    console.log("DEBUG: Full event data received by handler:", JSON.stringify(event, null, 2));

    // TODO: Fetch owner email from user-service if not in payload
    const recipientEmail = payload.ownerEmail || payload.owner?.email; 
    logInfo("📧 [Handler] Identified Recipient Email", { recipientEmail: recipientEmail || "MISSING" });

    if (!recipientEmail) {
      logError("⚠️ [Handler] No recipient email found in event payload. Skipping notification.");
      return;
    }

    if (!["STATUS_CHANGED", "CREATED"].includes(action)) {
        return; 
    }

    await notificationService.processNotification({
      type: "email",
      event: `restaurant.${action === "CREATED" ? "created" : status}`,
      recipient: recipientEmail,
      payload: event,
      metadata: { restaurantName: name, status }
    });

  } catch (error) {
    logError("❌ Restaurant Update Kafka Handler Error", { error: error.message });
  }
};
