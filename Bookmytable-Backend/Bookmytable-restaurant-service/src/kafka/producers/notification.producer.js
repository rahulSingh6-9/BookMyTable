import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { StaffEvents } from "../events/staff.events.js";

/**
 * Producer for Notification-related events
 * These events are typically consumed by the Notification Service
 */

export const emitStaffInviteEvent = async (inviteData) => {
  try {
    const event = StaffEvents.staffInvited(inviteData);
    
    await producer.send({
      topic: KAFKA_TOPICS.STAFF_INVITED,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
      acks: -1,
    });
    console.log(`📡 Staff Invite Event Emitted for: ${inviteData.email}`);
  } catch (error) {
    console.error("❌ Failed to emit staff invite event:", error.message);
  }
};

// Generic notification event producer if needed for a dedicated notification topic
export const emitNotificationEvent = async (topic, payload) => {
    try {
        await producer.send({
            topic: topic || KAFKA_TOPICS.NOTIFICATIONS,
            messages: [{ value: JSON.stringify(payload) }]
        });
    } catch (error) {
        console.error("❌ Failed to emit notification event:", error.message);
    }
};
