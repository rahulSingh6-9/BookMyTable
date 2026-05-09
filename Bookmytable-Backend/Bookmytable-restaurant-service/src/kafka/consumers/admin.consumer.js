import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleAdminRestaurantCommand } from "../handlers/adminRestaurant.handlers.js";
import { handleStaffInvite } from "../handlers/staffInvite.handlers.js";

const consumer = kafka.consumer({ groupId: "restaurant-service-admin-group" });

export const startAdminConsumer = async () => {
  try {
    await consumer.connect();
    console.log("🚀 Admin Command Consumer Connected");

    await consumer.subscribe({ 
      topics: [KAFKA_TOPICS.RESTAURANT_ADMIN_COMMAND, KAFKA_TOPICS.STAFF_INVITED], 
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value.toString());
        
        try {
          if (topic === KAFKA_TOPICS.RESTAURANT_ADMIN_COMMAND) {
            // Guard: only process ADMIN_COMMAND events targeted at RESTAURANT service
            if (payload.eventType === "ADMIN_COMMAND" && payload.service === "RESTAURANT") {
              await handleAdminRestaurantCommand(payload);
            }
          } else if (topic === KAFKA_TOPICS.STAFF_INVITED) {
            await handleStaffInvite(payload);
          }
        } catch (error) {
          console.error(`❌ Error handling message on topic [${topic}]:`, error.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ Admin Consumer Error:", error);
  }
};
