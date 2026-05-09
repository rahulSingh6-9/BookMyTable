import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleStaffInviteNotification } from "../handlers/staffNotification.handlers.js";
import { handleRestaurantUpdateNotification } from "../handlers/restaurantNotification.handlers.js";
import { handleBookingNotification } from "../handlers/bookingNotification.handlers.js";

const consumer = kafka.consumer({ groupId: "notification-service-group" });

export const startNotificationConsumer = async () => {
  try {
    await consumer.connect();
    console.log("📡 Notification Service Kafka Consumer Connected");

    await consumer.subscribe({ 
      topics: [
        KAFKA_TOPICS.STAFF_INVITED, 
        KAFKA_TOPICS.RESTAURANT_UPDATED,
        KAFKA_TOPICS.BOOKING_CREATED
      ], 
      fromBeginning: false 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const messageOffset = message.offset;
        try {
          const data = JSON.parse(message.value.toString());
          console.log(`📥 [NotificationConsumer] Received event on topic [${topic}] at offset ${messageOffset}`);
          console.log(`🔍 [NotificationConsumer] Event Type: ${data.eventType || 'N/A'}, Action: ${data.action || 'N/A'}`);

          if (topic === KAFKA_TOPICS.STAFF_INVITED) {
            await handleStaffInviteNotification(data);
          } else if (topic === KAFKA_TOPICS.RESTAURANT_UPDATED) {
            await handleRestaurantUpdateNotification(data);
          } else if (topic === KAFKA_TOPICS.BOOKING_CREATED) {
            await handleBookingNotification(data);
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
