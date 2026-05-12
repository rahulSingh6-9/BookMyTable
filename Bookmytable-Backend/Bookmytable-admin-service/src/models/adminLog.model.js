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