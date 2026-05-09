import { producer } from "./config/kafka.js";
import { startAdminConsumer } from "./consumers/admin.consumer.js";

/**
 * Initialize Kafka components for Admin Service
 */
export const initKafka = async () => {
  try {
    // 1. Connect Producer
    await producer.connect();
    console.log("📡 Admin Service Kafka Producer Connected");

    // 2. Start Consumer (for Read-Model Sync)
    await startAdminConsumer();

    console.log("🚀 Admin Service Kafka Initialized");
  } catch (error) {
    console.error("❌ Admin Service Kafka Startup Error:", error.message);
  }
};

// Export commonly used producers and topics
export * from "./producers/restaurantAdmin.producer.js";
export * from "./producers/userAdmin.producer.js";
export { KAFKA_TOPICS } from "./topics/topics.js";