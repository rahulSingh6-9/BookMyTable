import { producer } from "./config/kafka.js";
import { startAdminConsumer } from "./consumers/admin.consumer.js";
import { startNotificationConsumer } from "./consumers/notification.consumer.js";

/**
 * Initialize all Kafka related components
 */
export const initKafka = async () => {
  try {
    // 1. Connect Producer
    await producer.connect();
    console.log("📡 Kafka Producer Connected");

    // 2. Start Consumers
    await startAdminConsumer();
    // await startNotificationConsumer(); // Uncomment when needed

    console.log("🚀 Kafka System Initialized");
  } catch (error) {
    console.error("❌ Kafka Initialization Error:", error);
    throw error;
  }
};

// Export commonly used functions for convenience
export { producer } from "./config/kafka.js";
export * from "./producers/restaurant.producer.js";
export * from "./producers/notification.producer.js";
export * from "./topics/topics.js";
