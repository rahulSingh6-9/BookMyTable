import { producer } from "./config/kafka.js";
import { startUserConsumer } from "./consumers/user.consumer.js";

/**
 * Initialize Kafka components for User Service
 */
export const initKafka = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // 1. Connect Producer
      await producer.connect();
      console.log("📡 User Service Kafka Producer Connected");

      // 2. Start Consumer
      await startUserConsumer();

      console.log("🚀 User Service Kafka Initialized");
      return;
    } catch (error) {
      console.error(`❌ User Service Kafka Startup Error (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("🔥 User Service Kafka Failed after max retries.");
        throw error;
      }
    }
  }
};

// Export commonly used producers and topics
export * from "./producers/user.producer.js";
export { KAFKA_TOPICS } from "./topics/topics.js";
