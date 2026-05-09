import kafka from "../../config/kafka.js";
import { TOPICS } from "../topics.js";
import { syncUser } from "../handlers/sync/syncUser.js";
import { syncRestaurant } from "../handlers/sync/syncRestaurant.js";

const consumer = kafka.consumer({ groupId: "admin-service-group" });

export const startAdminConsumer = async () => {
  await consumer.connect();
  console.log("📡 Admin Service Kafka Consumer Connected");

  const fromBeginning = process.env.KAFKA_FROM_BEGINNING === "true";
  await consumer.subscribe({ topic: TOPICS.USER_UPDATED, fromBeginning });
  await consumer.subscribe({ topic: TOPICS.RESTAURANT_UPDATED, fromBeginning });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log(`📥 Admin Read-Model: [${event.eventType}] ${event.action}`);

      try {
        if (topic === TOPICS.USER_UPDATED) {
          await syncUser(event.payload);
        } else if (topic === TOPICS.RESTAURANT_UPDATED) {
          await syncRestaurant(event.payload);
        }
      } catch (err) {
        console.error(`❌ Error syncing read model [${topic}]:`, err.message);
      }
    },
  });
};
