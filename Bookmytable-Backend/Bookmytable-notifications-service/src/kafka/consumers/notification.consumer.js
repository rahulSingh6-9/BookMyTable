import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleStaffInviteNotification } from "../handlers/staffNotification.handlers.js";
import { handleRestaurantUpdateNotification } from "../handlers/restaurantNotification.handlers.js";
import { handleBookingNotification } from "../handlers/bookingNotification.handlers.js";
import { handleUserUpdateNotification } from "../handlers/userNotification.handlers.js";
import { 
  handlePhoneOTPNotification,
  handleEmailVerificationNotification,
  handlePasswordResetNotification
} from "../handlers/verificationNotification.handlers.js";
import { handleNotificationEmailSend } from "../handlers/notificationEmail.handlers.js";

const consumer = kafka.consumer({ groupId: "notification-service-group" });

export const startNotificationConsumer = async () => {
  try {
    await consumer.connect();
    console.log("📡 Notification Service Kafka Consumer Connected");

    const fromBeginning = process.env.KAFKA_FROM_BEGINNING === "true";
    await consumer.subscribe({ 
      topics: [
        KAFKA_TOPICS.STAFF_INVITED, 
        KAFKA_TOPICS.RESTAURANT_UPDATED,
        KAFKA_TOPICS.USER_UPDATED,
        KAFKA_TOPICS.BOOKING_CREATED,
        
        KAFKA_TOPICS.SEND_EMAIL_NOTIFICATION,
        KAFKA_TOPICS.RESTAURANT_APPROVED,
        KAFKA_TOPICS.RESTAURANT_REJECTED,
        KAFKA_TOPICS.RESTAURANT_SUSPENDED,
        
        KAFKA_TOPICS.PHONE_OTP_REQUESTED,
        KAFKA_TOPICS.VERIFICATION_EMAIL_REQUESTED,
        KAFKA_TOPICS.PASSWORD_RESET_REQUESTED
      ], 
      fromBeginning 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const messageOffset = message.offset;
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 [NotificationConsumer] Received event on topic [${topic}] at offset ${messageOffset}`);
          
          if (topic === KAFKA_TOPICS.STAFF_INVITED) {
            await handleStaffInviteNotification(event);
          } else if (
            topic === KAFKA_TOPICS.RESTAURANT_UPDATED ||
            topic === KAFKA_TOPICS.RESTAURANT_APPROVED ||
            topic === KAFKA_TOPICS.RESTAURANT_REJECTED ||
            topic === KAFKA_TOPICS.RESTAURANT_SUSPENDED
          ) {
            await handleRestaurantUpdateNotification(event);
          } else if (topic === KAFKA_TOPICS.USER_UPDATED) {
            await handleUserUpdateNotification(event);
          } else if (topic === KAFKA_TOPICS.BOOKING_CREATED) {
            await handleBookingNotification(event);
          } else if (topic === KAFKA_TOPICS.SEND_EMAIL_NOTIFICATION) {
            await handleNotificationEmailSend(event);
          } else if (topic === KAFKA_TOPICS.PHONE_OTP_REQUESTED) {
            await handlePhoneOTPNotification(event);
          } else if (topic === KAFKA_TOPICS.VERIFICATION_EMAIL_REQUESTED) {
            await handleEmailVerificationNotification(event);
          } else if (topic === KAFKA_TOPICS.PASSWORD_RESET_REQUESTED) {
            await handlePasswordResetNotification(event);
          }
          
          console.log(`✅ [NotificationConsumer] Successfully processed message at offset ${messageOffset}`);
        } catch (err) {
          console.error(`❌ [NotificationConsumer] Error processing message at offset ${messageOffset} on topic [${topic}]:`, err.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ Notification Consumer Error:", error.message);
  }
};
