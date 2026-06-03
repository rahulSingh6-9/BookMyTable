import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { syncUser } from "../handlers/userSync.handler.js";
import { syncBrand } from "../handlers/brandSync.handler.js";
import { syncBranch } from "../handlers/branchSync.handler.js";
import { syncMembership } from "../handlers/membershipSync.handler.js";
import { syncSubscriptionPlan } from "../handlers/subscriptionPlanSync.handler.js";
import { syncBrandSubscription } from "../handlers/brandSubscriptionSync.handler.js";
import { syncBilling } from "../handlers/billingSync.handler.js";
import { syncSubscriptionOverride } from "../handlers/subscriptionOverrideSync.handler.js";
import { handleInvitationSync } from "../handlers/invitationSync.handler.js";
import { syncBooking } from "../handlers/bookingSync.handler.js";
import { syncTable } from "../handlers/tableSync.handler.js";
import { handleAdminLogSync } from "../handlers/adminLogSync.handler.js";
import Logger from "../../utils/logger.js";

const consumer = kafka.consumer({ groupId: "admin-service-group" });

export const startAdminConsumer = async () => {
  try {
    await consumer.connect();
    console.log("📡 Admin Service Kafka Consumer Connected");

    const fromBeginning = process.env.KAFKA_FROM_BEGINNING === "true";
    await consumer.subscribe({ 
      topics: [
        KAFKA_TOPICS.USER_UPDATED, 
        KAFKA_TOPICS.RESTAURANT_CREATED,
        KAFKA_TOPICS.RESTAURANT_UPDATED,
        KAFKA_TOPICS.RESTAURANT_APPROVED,
        KAFKA_TOPICS.RESTAURANT_REJECTED,
        KAFKA_TOPICS.RESTAURANT_SUSPENDED,
        KAFKA_TOPICS.RESTAURANT_REMOVED,
        KAFKA_TOPICS.BRAND_CREATED,
        KAFKA_TOPICS.BRAND_UPDATED,
        KAFKA_TOPICS.BRAND_DEACTIVATED,
        KAFKA_TOPICS.BRAND_ARCHIVED,
        KAFKA_TOPICS.BRAND_RESTORED,
        KAFKA_TOPICS.MEMBERSHIP_CREATED,
        KAFKA_TOPICS.MEMBERSHIP_UPDATED,
        KAFKA_TOPICS.MEMBERSHIP_DELETED,
        KAFKA_TOPICS.SUBSCRIPTION_PLAN_CREATED,
        KAFKA_TOPICS.SUBSCRIPTION_PLAN_UPDATED,
        KAFKA_TOPICS.SUBSCRIPTION_ACTIVATED,
        KAFKA_TOPICS.SUBSCRIPTION_SUSPENDED,
        KAFKA_TOPICS.SUBSCRIPTION_OVERRIDE_CREATED,
        KAFKA_TOPICS.BILLING_UPDATED,
        KAFKA_TOPICS.STAFF_INVITED,
        KAFKA_TOPICS.STAFF_JOINED,
        KAFKA_TOPICS.INVITATION_FAILED,
        KAFKA_TOPICS.INVITATION_REVOKED,
        KAFKA_TOPICS.BOOKING_CREATED,
        KAFKA_TOPICS.BOOKING_CANCELLED,
        KAFKA_TOPICS.BOOKING_COMPLETED,
        KAFKA_TOPICS.TABLE_CREATED,
        KAFKA_TOPICS.TABLE_DELETED,
        KAFKA_TOPICS.ADMIN_INVITED,
        KAFKA_TOPICS.ADMIN_JOINED,
        KAFKA_TOPICS.ADMIN_INVITATION_REVOKED,
        KAFKA_TOPICS.ADMIN_INVITATION_VIEWED,
        KAFKA_TOPICS.ADMIN_INVITATION_FAILED,
        KAFKA_TOPICS.ADMIN_INVITATION_SENT,
        KAFKA_TOPICS.ADMIN_INVITATION_EXPIRED
      ], 
      fromBeginning
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 Admin Read-Model Sync: [${topic}] ${event.action || event.eventType || 'UPDATE'}`);

          // Enforce payload/data standardization
          // Read from event.data, fallback to event.payload, then fallback to root event
          const data = event.data || event.payload || event;

          if (topic === KAFKA_TOPICS.USER_UPDATED) {
            await syncUser(data);
          } else if (
            topic === KAFKA_TOPICS.RESTAURANT_CREATED ||
            topic === KAFKA_TOPICS.RESTAURANT_UPDATED ||
            topic === KAFKA_TOPICS.RESTAURANT_APPROVED ||
            topic === KAFKA_TOPICS.RESTAURANT_REJECTED ||
            topic === KAFKA_TOPICS.RESTAURANT_SUSPENDED ||
            topic === KAFKA_TOPICS.RESTAURANT_REMOVED ||
            topic === KAFKA_TOPICS.BRANCH_UPDATED
          ) {
            await syncBranch(data);
          } else if (
            topic === KAFKA_TOPICS.BRAND_CREATED || 
            topic === KAFKA_TOPICS.BRAND_UPDATED ||
            topic === KAFKA_TOPICS.BRAND_DEACTIVATED ||
            topic === KAFKA_TOPICS.BRAND_ARCHIVED ||
            topic === KAFKA_TOPICS.BRAND_RESTORED
          ) {
            await syncBrand(data, topic);
          } else if (topic === KAFKA_TOPICS.MEMBERSHIP_CREATED || topic === KAFKA_TOPICS.MEMBERSHIP_UPDATED || topic === KAFKA_TOPICS.MEMBERSHIP_DELETED) {
            await syncMembership(data);
          } else if (topic === KAFKA_TOPICS.SUBSCRIPTION_PLAN_CREATED || topic === KAFKA_TOPICS.SUBSCRIPTION_PLAN_UPDATED) {
            await syncSubscriptionPlan(data);
          } else if (topic === KAFKA_TOPICS.SUBSCRIPTION_ACTIVATED || topic === KAFKA_TOPICS.SUBSCRIPTION_SUSPENDED) {
            await syncBrandSubscription(data);
          } else if (topic === KAFKA_TOPICS.SUBSCRIPTION_OVERRIDE_CREATED) {
            await syncSubscriptionOverride(data);
          } else if (topic === KAFKA_TOPICS.BILLING_UPDATED) {
            await syncBilling(data);
          } else if (
            topic === KAFKA_TOPICS.STAFF_INVITED ||
            topic === KAFKA_TOPICS.STAFF_JOINED ||
            topic === KAFKA_TOPICS.INVITATION_FAILED ||
            topic === KAFKA_TOPICS.INVITATION_REVOKED
          ) {
            await handleInvitationSync(event.eventType, data);
          } else if (
            topic === KAFKA_TOPICS.BOOKING_CREATED ||
            topic === KAFKA_TOPICS.BOOKING_CANCELLED ||
            topic === KAFKA_TOPICS.BOOKING_COMPLETED
          ) {
            await syncBooking(topic, data);
          } else if (
            topic === KAFKA_TOPICS.TABLE_CREATED ||
            topic === KAFKA_TOPICS.TABLE_DELETED
          ) {
            await syncTable(topic, data);
          } else if (
            topic === KAFKA_TOPICS.ADMIN_INVITED ||
            topic === KAFKA_TOPICS.ADMIN_JOINED ||
            topic === KAFKA_TOPICS.ADMIN_INVITATION_REVOKED ||
            topic === KAFKA_TOPICS.ADMIN_INVITATION_VIEWED ||
            topic === KAFKA_TOPICS.ADMIN_INVITATION_FAILED ||
            topic === KAFKA_TOPICS.ADMIN_INVITATION_SENT ||
            topic === KAFKA_TOPICS.ADMIN_INVITATION_EXPIRED
          ) {
            await handleAdminLogSync(topic, data);
          }
        } catch (err) {
          await Logger.logError("admin-service", "kafka-consumer", `Error parsing/handling message on topic [${topic}]: ${err.message}`, { topic, error: err.stack });
        }
      },
    });
  } catch (error) {
    await Logger.logError("admin-service", "kafka-consumer", `Admin Consumer Error: ${error.message}`, { error: error.stack });
  }
};
