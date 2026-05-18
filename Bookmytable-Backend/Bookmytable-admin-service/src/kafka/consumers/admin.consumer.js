import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { syncUser } from "../handlers/userSync.handler.js";
import { syncBrand } from "../handlers/brandSync.handler.js";
import { syncBranch } from "../handlers/branchSync.handler.js";
import { syncMembership } from "../handlers/membershipSync.handler.js";

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
        KAFKA_TOPICS.MEMBERSHIP_CREATED,
        KAFKA_TOPICS.MEMBERSHIP_UPDATED
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
          } else if (topic === KAFKA_TOPICS.BRAND_CREATED || topic === KAFKA_TOPICS.BRAND_UPDATED) {
            await syncBrand(data);
          } else if (topic === KAFKA_TOPICS.MEMBERSHIP_CREATED || topic === KAFKA_TOPICS.MEMBERSHIP_UPDATED) {
            await syncMembership(data);
          }
        } catch (err) {
          console.error(`❌ Error parsing/handling message on topic [${topic}]:`, err.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ Admin Consumer Error:", error.message);
  }
};
