import { producer } from "./config/kafka.js";
import { startUserConsumer } from "./consumers/user.consumer.js";

/**
 * Initialize Kafka components for User Service
 */
export const initKafka = async () => {
  try {
    // 1. Connect Producer
    await producer.connect();
    console.log("📡 User Service Kafka Producer Connected");

    // 2. Start Consumer
    await startUserConsumer();

    console.log("🚀 User Service Kafka Initialized");
  } catch (error) {
    console.error("❌ User Service Kafka Startup Error:", error.message);
  }
};

// Export commonly used producers and topics
export * from "./producers/user.producer.js";
export { KAFKA_TOPICS } from "./topics/topics.js";
