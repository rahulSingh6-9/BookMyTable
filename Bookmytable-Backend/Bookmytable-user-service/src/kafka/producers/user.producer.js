import crypto from "crypto";
import { producer } from "../config/kafka.js";
import { USER_TOPICS } from "../topics/user.topics.js";

/**
 * Emits USER_UPDATED domain event following a user details or status change
 * Follows standard enterprise envelope:
 * { eventId, eventType, correlationId, timestamp, source, version, data, payload }
 */
export const emitUserUpdated = async (user, action = "UPDATED") => {
  try {
    const { correlationId, tenantContext, actorId, ...userData } = user;
    const userId = userData._id?.toString() || userData.id;

    const dataPayload = {
      id: userId,
      userId: userId,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
      isBlocked: userData.isBlocked,
      updatedAt: userData.updatedAt || new Date(),
      action,
    };

    const event = {
      eventId: crypto.randomUUID(),
      eventType: USER_TOPICS.USER_UPDATED,
      correlationId: correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: "user-service",
      version: "1.0",
      data: dataPayload,
      payload: dataPayload, // Keep legacy support

      // Backward compatibility fields
      id: crypto.randomUUID(),
      type: "com.bookmytable.user.updated",
      action,
      actorId,
      context: tenantContext,
    };

    await producer.send({
      topic: USER_TOPICS.USER_UPDATED,
      messages: [
        {
          key: userId,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log(`📡 [UserService] Standardized User Event Emitted: ${action} for User ${userId}`);
  } catch (error) {
    console.error("❌ [UserService] Failed to emit user updated event:", error.message);
  }
};

/**
 * Emits auth.phone.otp.requested event
 */
export const emitPhoneOtpRequested = async (phone, otp, purpose = "Auth Verification") => {
  try {
    const dataPayload = {
      phone,
      otp,
      purpose,
    };

    const event = {
      eventId: crypto.randomUUID(),
      eventType: USER_TOPICS.PHONE_OTP_REQUESTED,
      correlationId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: "user-service",
      version: "1.0",
      data: dataPayload,
      payload: dataPayload,
    };

    await producer.send({
      topic: USER_TOPICS.PHONE_OTP_REQUESTED,
      messages: [
        {
          key: phone,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log(`📡 [UserService] Kafka Event Emitted: auth.phone.otp.requested for ${phone}`);
  } catch (error) {
    console.error("❌ [UserService] Failed to emit phone OTP requested event:", error.message);
  }
};

/**
 * Emits auth.email.verification.requested event
 */
export const emitEmailVerificationRequested = async (email, token, userId) => {
  try {
    const dataPayload = {
      email,
      token,
      userId,
    };

    const event = {
      eventId: crypto.randomUUID(),
      eventType: USER_TOPICS.VERIFICATION_EMAIL_REQUESTED,
      correlationId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: "user-service",
      version: "1.0",
      data: dataPayload,
      payload: dataPayload,
    };

    await producer.send({
      topic: USER_TOPICS.VERIFICATION_EMAIL_REQUESTED,
      messages: [
        {
          key: userId,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log(`📡 [UserService] Kafka Event Emitted: auth.email.verification.requested for ${email}`);
  } catch (error) {
    console.error("❌ [UserService] Failed to emit email verification requested event:", error.message);
  }
};
