import Notification from "../models/notification.model.js";
import { emailService } from "./email.service.js";
import { logInfo, logError } from "../utils/logger.js";

class NotificationService {
  /**
   * Orchestrates the entire notification flow:
   * 1. Log to DB
   * 2. Send via appropriate channel (email, push, etc.)
   * 3. Update DB status
   */
  async processNotification(options) {
    const { type, event, recipient, payload, metadata, brandId, branchId } = options;
    logInfo(`🔄 Starting notification process: ${event} for ${recipient}`);
    
    const notification = await Notification.create({
      type,
      event,
      recipient,
      payload,
      brandId,
      branchId,
      status: "pending",
    });

    logInfo(`📝 Notification record created: ${notification._id} [pending]`);

    try {
      let result;

      // 2. Dispatch to correct sub-service
      if (type === "email") {
        result = await emailService.send(event, recipient, metadata);
      } else {
        throw new Error(`Unsupported notification type: ${type}`);
      }

      // 3. Success -> Update DB
      notification.status = "sent";
      notification.sentAt = new Date();
      if (result.messageId) notification.payload.messageId = result.messageId;
      await notification.save();

      logInfo(`✅ Notification [${event}] sent to ${recipient}`, { notificationId: notification._id });
      return notification;
    } catch (error) {
      // 4. Failure -> Update DB
      notification.status = "failed";
      notification.error = error.message;
      await notification.save();

      logError(`❌ Notification [${event}] failed for ${recipient}`, { 
        notificationId: notification._id, 
        error: error.message 
      });

      if (event === "staff.invited") {
        try {
          const { producer } = await import("../kafka/config/kafka.js");
          const { KAFKA_TOPICS } = await import("../kafka/topics/topics.js");
          await producer.send({
            topic: KAFKA_TOPICS.INVITATION_FAILED,
            messages: [{ value: JSON.stringify({ eventType: "INVITATION_FAILED", payload: { inviteId: metadata.inviteId, error: error.message } }) }]
          });
        } catch (kafkaErr) {
          logError("❌ Failed to emit INVITATION_FAILED", { error: kafkaErr.message });
        }
      }

      throw error;
    }
  }
}

export const notificationService = new NotificationService();
