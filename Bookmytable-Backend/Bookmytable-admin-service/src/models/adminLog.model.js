import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "APPROVE_RESTAURANT",
        "SUSPEND_RESTAURANT",
        "REJECT_RESTAURANT",
        "APPROVE_BRAND",
        "SUSPEND_BRAND",
        "REJECT_BRAND",
        "BAN_USER",
        "UNBAN_USER",
        "UPDATE_USER_ROLE",
        "STAFF_INVITED",
        "BOOKING_CANCELLED",
        "ADMIN_CREATED",
        "ADMIN_UPDATED",
        "ADMIN_DELETED",
        "PERMISSIONS_UPDATED",
        "ROLES_UPDATED",
        "ADMIN_STATUS_CHANGED",
        "ADMIN_INVITATION_CREATED",
        "ADMIN_INVITATION_SENT",
        "ADMIN_INVITATION_VIEWED",
        "ADMIN_INVITATION_ACCEPTED",
        "ADMIN_INVITATION_FAILED",
        "ADMIN_INVITATION_REVOKED",
        "ADMIN_MEMBERSHIP_CREATED",
        "ADMIN_INVITATION_EXPIRED",
        "CREATE_SUBSCRIPTION_PLAN",
        "UPDATE_SUBSCRIPTION_PRICING",
        "UPDATE_SUBSCRIPTION_FEATURES",
        "UPDATE_SUBSCRIPTION_LIMITS",
        "ARCHIVE_SUBSCRIPTION_PLAN",
        "RESTORE_SUBSCRIPTION_PLAN",
        "EXTEND_SUBSCRIPTION_TRIAL",
        "SUSPEND_SUBSCRIPTION",
        "REACTIVATE_SUBSCRIPTION",
        "UPGRADE_SUBSCRIPTION",
        "DOWNGRADE_SUBSCRIPTION",
        "GRACE_PERIOD_GRANTED",
        "FEATURE_RESTAURANT",
        "HIDE_RESTAURANT",
        "CREATE_BRANCH",
        "DELETE_BRANCH",
        "RESTORE_BRANCH",
        "MEMBERSHIP_CREATED",
        "MEMBERSHIP_DELETED",
        "STAFF_JOINED",
        "ADMIN_JOINED",
      ],
    },

    targetType: {
      type: String, // restaurant / user / system
    },

    targetId: String,

    metadata: Object,

    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);