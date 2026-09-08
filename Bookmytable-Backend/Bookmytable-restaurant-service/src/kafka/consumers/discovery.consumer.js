import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleDiscoveryRestaurantUpdate } from "../handlers/discovery.handlers.js";
import { handleBranchProfileLog } from "../handlers/branchLogSync.handler.js";

const consumer = kafka.consumer({ groupId: "restaurant-service-discovery-group" });

export const startDiscoveryConsumer = async () => {
  try {
    await consumer.connect();
    console.log("🚀 Discovery CQRS Consumer Connected");

    await consumer.subscribe({ 
      topics: [
        KAFKA_TOPICS.RESTAURANT_UPDATED,
        KAFKA_TOPICS.BRAND_UPDATED,
        KAFKA_TOPICS.BRAND_DEACTIVATED,
        KAFKA_TOPICS.BRAND_ARCHIVED,
        KAFKA_TOPICS.BRAND_RESTORED,
        KAFKA_TOPICS.RESTAURANT_APPROVED,
        KAFKA_TOPICS.RESTAURANT_SUSPENDED,
        KAFKA_TOPICS.RESTAURANT_REJECTED,
        KAFKA_TOPICS.RESTAURANT_REMOVED
      ], 
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 [DiscoveryConsumer] Received Kafka event on topic [${topic}]`);
          
          await handleDiscoveryRestaurantUpdate({ ...event, topic });
          
          // Log Branch Profile changes (grouped)
          if (topic === KAFKA_TOPICS.RESTAURANT_UPDATED) {
            await handleBranchProfileLog(event);
          }
          
        } catch (error) {
          console.error(`❌ [DiscoveryConsumer] Error handling message on topic [${topic}]:`, error.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ Discovery Consumer Error:", error);
  }
};
