import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles notification.email.send event
 * Topic: notification.email.send
 */
export const handleNotificationEmailSend = async (event) => {
  try {
    const { correlationId, data, payload } = event;
    const finalData = data || payload;

    if (!finalData) {
      logError("⚠️ [Handler] Received notification.email.send with no data/payload", { event });
      return;
    }

    const { template, recipient, variables, brandId, branchId } = finalData;

    logInfo(`📥 [Handler] Processing notification.email.send - Template: ${template}, Recipient: ${recipient}`, {
      correlationId,
      brandId,
      branchId
    });

    await notificationService.processNotification({
      type: "email",
      event: template,
      recipient: recipient,
      payload: event,
      metadata: variables,
      brandId,
      branchId
    });

    console.log(`✅ [Handler] Successfully dispatched standardized email notification for ${recipient}`);
  } catch (error) {
    logError("❌ [Handler] Error in handleNotificationEmailSend handler", { error: error.message });
  }
};
