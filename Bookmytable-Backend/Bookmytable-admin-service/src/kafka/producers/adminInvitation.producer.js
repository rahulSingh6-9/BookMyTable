import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

/**
 * Emits an admin invitation event
 */
export const emitAdminInvitationEvent = async (action, payload) => {
  try {
    let topic;
    switch (action) {
      case "invited":
      case "resent":
        topic = KAFKA_TOPICS.ADMIN_INVITED;
        break;
      case "joined":
        topic = KAFKA_TOPICS.ADMIN_JOINED;
        break;
      case "revoked":
        topic = KAFKA_TOPICS.ADMIN_INVITATION_REVOKED;
        break;
      case "viewed":
        topic = KAFKA_TOPICS.ADMIN_INVITATION_VIEWED;
        break;
      case "failed":
        topic = KAFKA_TOPICS.ADMIN_INVITATION_FAILED;
        break;
      case "sent":
        topic = KAFKA_TOPICS.ADMIN_INVITATION_SENT;
        break;
      case "expired":
        topic = KAFKA_TOPICS.ADMIN_INVITATION_EXPIRED;
        break;
      default:
        throw new Error(`Invalid admin invitation action: ${action}`);
    }

    const event = {
      type: `admin.invitation.${action}`,
      payload,
      timestamp: new Date().toISOString(),
    };

    await producer.send({
      topic,
      messages: [
        {
          key: payload.email || payload.invitationId || "admin-invite",
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`📡 Admin Invitation Event Emitted: ${action} to ${payload.email}`);
  } catch (error) {
    console.error(`❌ Failed to emit admin invitation event (${action}):`, error.message);
  }
};

/**
 * Emits a command to update the user's role in the User Service
 */
export const emitUserRoleUpdate = async (userId, role, adminId) => {
  try {
    const event = {
      action: "UPDATE_ROLE",
      data: { userId, role },
      actor: { id: adminId, role: "system" },
      id: `evt_${Date.now()}`,
      correlationId: `cmd_${Date.now()}`,
      timestamp: new Date().toISOString(),
      service: "USER",
      eventType: "ADMIN_COMMAND"
    };

    await producer.send({
      topic: KAFKA_TOPICS.USER_ADMIN_COMMAND,
      messages: [
        {
          key: userId.toString(),
          value: JSON.stringify(event),
        },
      ],
    });

    console.log(`📡 User Role Update Command Emitted for user ${userId} -> ${role}`);
  } catch (error) {
    console.error(`❌ Failed to emit user role update command:`, error.message);
  }
};

