import { producer } from "./config/kafka.js";
import { startAdminConsumer } from "./consumers/admin.consumer.js";
import { startNotificationConsumer } from "./consumers/notification.consumer.js";
import { startDiscoveryConsumer } from "./consumers/discovery.consumer.js";

/**
 * Initialize all Kafka related components
 */
export const initKafka = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // 1. Connect Producer
      await producer.connect();
      console.log("📡 Kafka Producer Connected");

      // 2. Start Consumers
      await startAdminConsumer();
      await startDiscoveryConsumer();

      console.log("🚀 Kafka System Initialized");
      return;
    } catch (error) {
      console.error(`❌ Kafka Initialization Error (attempt ${i + 1}/${retries}):`, error);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("🔥 Kafka Failed after max retries.");
        throw error;
      }
    }
  }
};

// Export commonly used functions for convenience
export { producer } from "./config/kafka.js";
export * from "./producers/restaurant.producer.js";
export * from "./producers/notification.producer.js";
export * from "./topics/topics.js";
