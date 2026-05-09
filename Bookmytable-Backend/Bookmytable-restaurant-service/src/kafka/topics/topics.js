/**
 * Kafka Topics used in Restaurant Service
 */
export const KAFKA_TOPICS = {
  // Commands from Admin
  RESTAURANT_ADMIN_COMMAND: "restaurant.admin.command",
  
  // Events emitted by Restaurant Service
  RESTAURANT_UPDATED: "restaurant.updated",
  STAFF_INVITED: "staff.invited",
  
  // Potential future topics
  NOTIFICATIONS: "notification.events"
};