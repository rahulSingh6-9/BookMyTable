import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleNotificationEvent } from "../handlers/notification.handlers.js";

const consumer = kafka.consumer({ groupId: "restaurant-service-notification-group" });

export const startNotificationConsumer = async () => {
  try {
    await consumer.connect();
    console.log("🚀 Notification Event Consumer Connected");

    // This service might listen to notification results or specific notification triggers
    // For now, subscribing to a generic topic or placeholder
    // await consumer.subscribe({ topic: KAFKA_TOPICS.NOTIFICATIONS, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const payload = JSON.parse(message.value.toString());
        await handleNotificationEvent(payload);
      },
    });
  } catch (error) {
    console.error("❌ Notification Consumer Error:", error);
  }
};
