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
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 [RestaurantService] Received Kafka event on topic [${topic}]`);

          if (topic === KAFKA_TOPICS.RESTAURANT_ADMIN_COMMAND) {
            // Recognize both legacy and new professional event types
            const isProfessionalCommand = event.type === "com.bookmytable.admin.restaurant.command";
            const isLegacyCommand = event.eventType === "ADMIN_COMMAND" && event.service === "RESTAURANT";

            if (isProfessionalCommand || isLegacyCommand) {
              await handleAdminRestaurantCommand(event);
            } else {
              console.warn(`⚠️ [RestaurantService] Ignoring event on topic [${topic}] with type: ${event.type || event.eventType}`);
            }
          } else if (topic === KAFKA_TOPICS.STAFF_INVITED) {
            await handleStaffInvite(event);
          }
        } catch (error) {
          console.error(`❌ [RestaurantService] Error handling message on topic [${topic}]:`, error.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ Admin Consumer Error:", error);
  }
};
