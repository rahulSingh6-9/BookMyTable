import crypto from "crypto";
import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

/**
 * Emits USER_UPDATED event after user details or status change
 */
/**
 * Emits USER_UPDATED domain event
 * @param {Object} user - The user object (rich with metadata)
 * @param {string} action - e.g., USER_BLOCKED, ROLE_CHANGED
 */
export const emitUserUpdated = async (user, action = "UPDATED") => {
  try {
    const { correlationId, tenantContext, actorId, ...userData } = user;
    
    const event = {
      id: crypto.randomUUID(),
      source: "user-service",
      type: "com.bookmytable.user.updated",
      action,
      correlationId,
      actorId,
      context: tenantContext,
      payload: {
        id: userData._id?.toString() || userData.id,
        name: userData.name,
        email: userData.email,
        roles: userData.roles,
        isBlocked: userData.isBlocked,
        updatedAt: userData.updatedAt || new Date(),
      },
      timestamp: Date.now(),
      version: 1,
    };

    await producer.send({
      topic: KAFKA_TOPICS.USER_UPDATED,
      messages: [
        {
          key: event.payload.id,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log(`📡 Professional User Event Emitted: ${action} for ${event.payload.id}`);
  } catch (error) {
    console.error("❌ Failed to emit user updated event:", error.message);
  }
};
