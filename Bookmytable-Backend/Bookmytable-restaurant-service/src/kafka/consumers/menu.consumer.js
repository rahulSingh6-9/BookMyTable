import kafka from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { handleMenuProjectionEvent } from "../handlers/menuProjection.handler.js";

const consumer = kafka.consumer({ groupId: "restaurant-service-menu-projection-group" });

export const startMenuConsumer = async () => {
  try {
    await consumer.connect();
    console.log("🚀 Menu CQRS Consumer Connected");

    await consumer.subscribe({ 
      topics: [
        KAFKA_TOPICS.MENU_ITEM_CREATED,
        KAFKA_TOPICS.MENU_ITEM_UPDATED,
        KAFKA_TOPICS.MENU_ITEM_DELETED,
        KAFKA_TOPICS.MENU_CATEGORY_CREATED,
        KAFKA_TOPICS.MENU_CATEGORY_UPDATED,
        KAFKA_TOPICS.MENU_CATEGORY_DELETED,
      ], 
      fromBeginning: true 
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          console.log(`📥 [MenuConsumer] Received Kafka event on topic [${topic}]`);
          
          await handleMenuProjectionEvent({ ...event, topic });
          
        } catch (error) {
          console.error(`❌ [MenuConsumer] Error handling message on topic [${topic}]:`, error.message);
        }
      },
    });
  } catch (error) {
    console.error("❌ Menu Consumer Error:", error);
  }
};
