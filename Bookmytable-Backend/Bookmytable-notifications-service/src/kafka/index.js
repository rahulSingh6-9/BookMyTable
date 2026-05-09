import { startNotificationConsumer } from "./consumers/notification.consumer.js";

/**
 * Initialize Kafka components for Notification Service
 */
export const initKafka = async () => {
  try {
    // Notification service mostly consumes, so we just start the consumer
    await startNotificationConsumer();

    console.log("🚀 Notification Service Kafka Initialized");
  } catch (error) {
    console.error("❌ Notification Service Kafka Startup Error:", error.message);
  }
};

export { KAFKA_TOPICS } from "./topics/topics.js";
