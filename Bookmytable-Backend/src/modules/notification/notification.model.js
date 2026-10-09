import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "sms", "push"],
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    brandId: {
      type: String,
      index: true,
    },
    branchId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    payload: {
      type: Object,
    },
    error: {
      type: String,
    },
    sentAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

