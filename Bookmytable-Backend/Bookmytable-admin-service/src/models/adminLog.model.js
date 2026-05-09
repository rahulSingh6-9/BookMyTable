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
        "BAN_USER",
        "UNBAN_USER",
        "UPDATE_USER_ROLE",
        "STAFF_INVITED",
        "BOOKING_CANCELLED",
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