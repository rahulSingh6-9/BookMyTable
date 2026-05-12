import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { buildAdminEvent } from "../../utils/eventBuilder.js";

/**
 * Emits a professional admin command for User Service
 * @param {Object} params
 * @param {string} params.action - e.g., BAN_USER, UPDATE_ROLE
 * @param {Object} params.payload - The data for the action
 * @param {Object} params.adminContext - { id, role, permissions }
 * @param {Object} [params.tenantContext] - { brandId, branchId }
 * @param {string} [params.correlationId]
 */
export const emitUserAdminCommand = async ({ 
  action, 
  payload, 
  adminContext, 
  tenantContext = {}, 
  correlationId 
}) => {
  try {
    const event = buildAdminEvent({
      type: "admin.user.command",
      action,
      payload,
      adminContext,
      tenantContext,
      correlationId
    });

    await producer.send({
      topic: KAFKA_TOPICS.USER_ADMIN_COMMAND,
      messages: [
        {
          key: payload.userId || payload.id, // Partition by target ID
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`📡 Professional User Admin Command Emitted: ${action} [ID: ${event.id}]`);
  } catch (error) {
    console.error("❌ Failed to emit user admin command:", error.message);
  }
};
