import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleAdminUserCommand } from "../handlers/adminUser.handlers.js";
import { handleUserRegistered } from "../handlers/auth.handlers.js";

const consumer = kafka.consumer({ groupId: "user-service-group" }); // Changed group ID to match standard

export const startUserConsumer = async () => {
  try {
    await consumer.connect();
    console.log("🚀 User Service Kafka Consumer Connected");

    await consumer.subscribe({ 
      topics: [KAFKA_TOPICS.USER_ADMIN_COMMAND, KAFKA_TOPICS.AUTH_USER_REGISTERED], 
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());

          if (topic === KAFKA_TOPICS.AUTH_USER_REGISTERED) {
            await handleUserRegistered(event);
          } else if (topic === KAFKA_TOPICS.USER_ADMIN_COMMAND) {
            if (event.eventType === "ADMIN_COMMAND" && event.service === "USER") {
              await handleAdminUserCommand(event);
            }
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
