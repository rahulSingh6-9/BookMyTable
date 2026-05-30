import { producer } from "./config/kafka.js";
import { startAdminConsumer } from "./consumers/admin.consumer.js";

/**
 * Initialize Kafka components for Admin Service
 */
export const initKafka = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // 1. Connect Producer
      await producer.connect();
      console.log("📡 Admin Service Kafka Producer Connected");

      // 2. Start Consumer (for Read-Model Sync)
      await startAdminConsumer();

      console.log("🚀 Admin Service Kafka Initialized");
      return; // Success, exit loop
    } catch (error) {
      console.error(`❌ Admin Service Kafka Startup Error (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("🔥 Admin Service Kafka Failed after max retries.");
        throw error; // Fail the startup if it can't connect
      }
    }
  }
};

// Export commonly used producers and topics
export * from "./producers/restaurantAdmin.producer.js";
export * from "./producers/userAdmin.producer.js";
export { KAFKA_TOPICS } from "./topics/topics.js";