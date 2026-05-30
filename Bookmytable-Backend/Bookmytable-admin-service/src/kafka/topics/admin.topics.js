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

  // Subscription CQRS Topics
  SUBSCRIPTION_PLAN_CREATED: "subscription.plan.created",
  SUBSCRIPTION_PLAN_UPDATED: "subscription.plan.updated",
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_SUSPENDED: "subscription.suspended",
  SUBSCRIPTION_OVERRIDE_CREATED: "subscription.override.created",
  BILLING_UPDATED: "billing.updated",
};
