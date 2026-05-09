import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

/**
 * Emits USER_UPDATED event after user details or status change
 */
export const emitUserUpdated = async (user, action = "UPDATED") => {
  try {
    await producer.send({
      topic: KAFKA_TOPICS.USER_UPDATED,
      messages: [
        {
          value: JSON.stringify({
            eventType: "USER_UPDATED",
            action,
            payload: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              isBanned: user.isBanned,
              updatedAt: user.updatedAt,
            },
            timestamp: Date.now(),
            version: 1,
          }),
        },
      ],
    });
    console.log(`📡 User Updated Event Emitted: ${user._id}`);
  } catch (error) {
    console.error("❌ Failed to emit user updated event:", error.message);
  }
};
