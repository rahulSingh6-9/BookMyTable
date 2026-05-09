import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

export const emitUserAdminCommand = async (action, payload, adminId) => {
  try {
    await producer.send({
      topic: KAFKA_TOPICS.USER_ADMIN_COMMAND,
      messages: [
        {
          value: JSON.stringify({
            eventType: "ADMIN_COMMAND",
            service: "USER",
            action,
            payload,
            adminId,
            timestamp: Date.now(),
            version: 1,
          }),
        },
      ],
    });
    console.log(`📡 User Admin Command Emitted: ${action}`);
  } catch (error) {
    console.error("❌ Failed to emit user admin command:", error.message);
  }
};
