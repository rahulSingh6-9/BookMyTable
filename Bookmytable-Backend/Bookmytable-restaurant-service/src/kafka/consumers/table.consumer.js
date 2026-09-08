import kafka from "../config/kafka.js";
import { RESTAURANT_TOPICS } from "../topics/restaurant.topics.js";
import { handleTableProjectionSync } from "../handlers/tableProjection.handler.js";

const CONSUMER_GROUP = "restaurant-service-table-projection-group";

export const startTableConsumer = async () => {
  const consumer = kafka.consumer({ groupId: CONSUMER_GROUP });

  try {
    await consumer.connect();

    // Subscribe to all table modification events
    await consumer.subscribe({
      topics: [
        RESTAURANT_TOPICS.TABLE_CREATED,
        RESTAURANT_TOPICS.TABLE_UPDATED,
        RESTAURANT_TOPICS.TABLE_DELETED,
        RESTAURANT_TOPICS.TABLE_STATUS_CHANGED,
        RESTAURANT_TOPICS.TABLE_BULK_UPDATED,
        RESTAURANT_TOPICS.TABLE_FLOOR_CREATED,
        RESTAURANT_TOPICS.TABLE_FLOOR_DELETED,
        RESTAURANT_TOPICS.TABLE_SECTION_CREATED,
        RESTAURANT_TOPICS.TABLE_SECTION_DELETED,
      ],
      fromBeginning: false,
    });

    console.log(`✅ Kafka Consumer Connected: ${CONSUMER_GROUP}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value.toString());
          const { eventType, data } = event;

          await handleTableProjectionSync(topic, eventType, data);

        } catch (err) {
          console.error(`Error parsing/handling message on topic [${topic}]: ${err.message}`, { topic, error: err.stack });
        }
      },
    });
  } catch (error) {
    console.error(`Consumer connection failed: ${error.message}`, { error: error.stack });
    
    // Auto-restart logic
    setTimeout(startTableConsumer, 5000);
  }
};
