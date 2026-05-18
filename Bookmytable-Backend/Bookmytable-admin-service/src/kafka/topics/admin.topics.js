export const ADMIN_TOPICS = {
  // Command topics (Produced)
  RESTAURANT_ADMIN_COMMAND: "restaurant.admin.command",
  USER_ADMIN_COMMAND: "user.admin.command",

  // Sync / domain topics (Consumed)
  RESTAURANT_CREATED: "restaurant.created",
  RESTAURANT_UPDATED: "restaurant.updated",
  RESTAURANT_APPROVED: "restaurant.approved",
  RESTAURANT_REJECTED: "restaurant.rejected",
  RESTAURANT_SUSPENDED: "restaurant.suspended",
  RESTAURANT_REMOVED: "restaurant.removed",

  BRAND_CREATED: "brand.created",
  BRAND_UPDATED: "brand.updated",

  MEMBERSHIP_CREATED: "membership.created",
  MEMBERSHIP_UPDATED: "membership.updated",

  USER_UPDATED: "user.updated",

  // Legacy compatibility mapping
  BRANCH_UPDATED: "branch.updated",
};
