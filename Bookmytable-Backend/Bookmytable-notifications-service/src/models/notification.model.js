import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "sms", "push"],
      required: true,
    },

    event: {
      type: String, // e.g. "staff.invited"
      required: true,
    },

    recipient: {
      type: String, // email or phone
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },

    payload: {
      type: Object, // full event data
    },

    error: {
      type: String,
    },

    sentAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
