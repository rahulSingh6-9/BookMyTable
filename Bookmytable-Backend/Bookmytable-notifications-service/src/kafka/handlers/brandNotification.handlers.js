import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles BRAND_DEACTIVATED, BRAND_ARCHIVED, BRAND_RESTORED events
 */
export const handleBrandNotification = async (event) => {
  try {
    const { eventType, data, correlationId } = event;
    const finalPayload = data;
    
    if (!finalPayload) {
      logError("⚠️ [Handler] Received Brand event with no payload/data", { event });
      return;
    }

    const { name, id, ownerId } = finalPayload;
    const brandName = name;

    logInfo("📥 [Handler] Received Brand Lifecycle Kafka Event", { 
      eventType, 
      brandName, 
      brandId: id,
      correlationId 
    });

    // In a real scenario we need the owner's email. 
    // Since brand events might only have ownerId, we should fetch the email or expect it in the payload.
    // Assuming notification service has access to user data or we pass ownerEmail.
    // If not in payload, the notificationService handles finding the recipient via ownerId if recipient is just an ID.
    const recipientEmail = finalPayload.ownerEmail || ownerId; 

    if (!recipientEmail) {
      logError("⚠️ [Handler] No recipient found in event payload. Skipping notification.", { brandId: id });
      return;
    }

    logInfo(`📧 [Handler] Dispatching brand notification to ${recipientEmail} for event ${eventType}`);

    // Check notification preferences
    if (finalPayload.notifyMembers === false) {
      logInfo("ℹ️ [Handler] Notification bypassed as notifyMembers is false.", { brandId: id });
      return;
    }

    // Map internal actions to notification events
    const actionMap = {
      "brand.deactivated": "deactivated",
      "brand.archived": "archived",
      "brand.restored": "restored",
    };

    const notificationEvent = actionMap[eventType];

    await notificationService.processNotification({
      type: "email",
      event: `brand.${notificationEvent}`,
      recipient: recipientEmail,
      payload: event,
      metadata: { 
        brandName, 
        status: notificationEvent, 
        reason: finalPayload.reason || "Not specified",
        ...finalPayload 
      },
      brandId: id,
      branchId: null
    });

  } catch (error) {
    logError("❌ Brand Notification Kafka Handler Error", { error: error.message });
  }
};
