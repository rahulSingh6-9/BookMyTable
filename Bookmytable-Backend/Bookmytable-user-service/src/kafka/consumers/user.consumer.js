import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleAdminUserCommand } from "../handlers/adminUser.handlers.js";

const consumer = kafka.consumer({ groupId: "user-service-admin-group" });

export const startUserConsumer = async () => {
  try {
    await consumer.connect();
    console.log("🚀 User Service Kafka Consumer Connected");

    await consumer.subscribe({ 
      topic: KAFKA_TOPICS.USER_ADMIN_COMMAND, 
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          if (event.eventType === "ADMIN_COMMAND" && event.service === "USER") {
            await handleAdminUserCommand(event);
          }
        } catch (err) {
          console.error("❌ [UserService Consumer] Error processing message:", err.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ User Consumer Error:", error.message);
  }
};
