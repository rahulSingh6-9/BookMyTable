import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { syncUser } from "../handlers/userSync.handler.js";
import { syncRestaurant } from "../handlers/restaurantSync.handler.js";
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
        KAFKA_TOPICS.RESTAURANT_UPDATED,
        KAFKA_TOPICS.BRAND_UPDATED,
        KAFKA_TOPICS.BRANCH_UPDATED,
        KAFKA_TOPICS.MEMBERSHIP_UPDATED
      ], 
      fromBeginning 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 Admin Read-Model Sync: [${topic}] ${event.action || event.eventType || 'UPDATE'}`);

          const payload = event.payload || event;

          if (topic === KAFKA_TOPICS.USER_UPDATED) {
            await syncUser(payload);
          } else if (topic === KAFKA_TOPICS.RESTAURANT_UPDATED || topic === KAFKA_TOPICS.BRANCH_UPDATED) {
            await syncBranch(payload);
          } else if (topic === KAFKA_TOPICS.BRAND_UPDATED) {
            await syncBrand(payload);
          } else if (topic === KAFKA_TOPICS.MEMBERSHIP_UPDATED) {
            await syncMembership(payload);
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
