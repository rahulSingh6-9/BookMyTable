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
  MEMBERSHIP_DELETED: "membership.deleted",

  USER_UPDATED: "user.updated",

  STAFF_INVITED: "staff.invited",
  STAFF_JOINED: "staff.joined",
  INVITATION_FAILED: "invitation.failed",
  INVITATION_REVOKED: "invitation.revoked",

  ADMIN_INVITED: "admin.invited",
  ADMIN_JOINED: "admin.joined",
  ADMIN_INVITATION_REVOKED: "admin.invitation.revoked",
  ADMIN_INVITATION_VIEWED: "admin.invitation.viewed",
  ADMIN_INVITATION_FAILED: "admin.invitation.failed",
  ADMIN_INVITATION_SENT: "admin.invitation.sent",
  ADMIN_INVITATION_EXPIRED: "admin.invitation.expired",

  // Legacy compatibility mapping
  BRANCH_UPDATED: "branch.updated",

  // Booking & Table CQRS Topics
  BOOKING_CREATED: "booking.created",
  BOOKING_CANCELLED: "booking.cancelled",
  BOOKING_COMPLETED: "booking.completed",
  TABLE_CREATED: "table.created",
  TABLE_DELETED: "table.deleted",

  // Subscription CQRS Topics
  SUBSCRIPTION_PLAN_CREATED: "subscription.plan.created",
  SUBSCRIPTION_PLAN_UPDATED: "subscription.plan.updated",
  SUBSCRIPTION_ACTIVATED: "subscription.activated",
  SUBSCRIPTION_SUSPENDED: "subscription.suspended",
  SUBSCRIPTION_OVERRIDE_CREATED: "subscription.override.created",
  BILLING_UPDATED: "billing.updated",
};
