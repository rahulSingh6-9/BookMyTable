import { producer } from "../config/kafka.js";
import { KAFKA_TOPICS } from "../topics/topics.js";
import { RestaurantEvents } from "../events/restaurant.events.js";

/**
 * Producer for Restaurant related events
 */
export const emitRestaurantEvent = async (event) => {
  try {
    await producer.send({
      topic: KAFKA_TOPICS.RESTAURANT_UPDATED,
      messages: [
        {
          value: JSON.stringify(event),
        },
      ],
      acks: -1,
    });
    console.log(`📡 Restaurant Event Emitted: ${event.eventType}`);
  } catch (error) {
    console.error("❌ Failed to emit restaurant event:", error.message);
  }
};

export const emitRestaurantCreated = (restaurant, ownerId) => 
  emitRestaurantEvent(RestaurantEvents.restaurantCreated(restaurant, ownerId));

export const emitRestaurantStatusChanged = (restaurant, action = "STATUS_CHANGED", metadata = {}) =>
  emitRestaurantEvent(RestaurantEvents.restaurantUpdated(restaurant, action, metadata));
