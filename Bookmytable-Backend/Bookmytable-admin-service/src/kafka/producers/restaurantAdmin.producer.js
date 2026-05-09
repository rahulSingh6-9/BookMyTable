import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

export const emitRestaurantAdminCommand = async (action, payload, adminId) => {
  try {
    await producer.send({
      topic: KAFKA_TOPICS.RESTAURANT_ADMIN_COMMAND,
      messages: [
        {
          value: JSON.stringify({
            eventType: "ADMIN_COMMAND",
            service: "RESTAURANT",
            action,
            payload,
            adminId,
            timestamp: Date.now(),
            version: 1,
          }),
        },
      ],
    });
    console.log(`📡 Restaurant Admin Command Emitted: ${action}`);
  } catch (error) {
    console.error("❌ Failed to emit restaurant admin command:", error.message);
  }
};
