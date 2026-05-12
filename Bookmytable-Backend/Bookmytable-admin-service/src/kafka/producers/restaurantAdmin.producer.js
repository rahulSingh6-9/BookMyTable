import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { buildAdminEvent } from "../../utils/eventBuilder.js";

/**
 * Emits a professional admin command for Restaurant Service
 * @param {Object} params
 * @param {string} params.action - e.g., APPROVE_RESTAURANT, SUSPEND_RESTAURANT
 * @param {Object} params.payload - The data for the action
 * @param {Object} params.adminContext - { id, role, permissions }
 * @param {Object} [params.tenantContext] - { brandId, branchId }
 * @param {string} [params.correlationId]
 */
export const emitRestaurantAdminCommand = async ({ 
  action, 
  payload, 
  adminContext, 
  tenantContext = {}, 
  correlationId 
}) => {
  try {
    const event = buildAdminEvent({
      type: "admin.restaurant.command",
      action,
      payload,
      adminContext,
      tenantContext,
      correlationId
    });

    await producer.send({
      topic: KAFKA_TOPICS.RESTAURANT_ADMIN_COMMAND,
      messages: [
        {
          key: payload.id || payload.branchId, // Partition by target ID
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`📡 Professional Restaurant Admin Command Emitted: ${action} [ID: ${event.id}]`);
  } catch (error) {
    console.error("❌ Failed to emit restaurant admin command:", error.message);
  }
};
