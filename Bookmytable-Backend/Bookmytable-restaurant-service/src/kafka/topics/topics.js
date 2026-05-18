import { RESTAURANT_TOPICS } from "./restaurant.topics.js";

export const KAFKA_TOPICS = {
  ...RESTAURANT_TOPICS,
  // Keep legacy backward compatibility mappings
  NOTIFICATIONS: "notification.events"
};

export * from "./restaurant.topics.js";