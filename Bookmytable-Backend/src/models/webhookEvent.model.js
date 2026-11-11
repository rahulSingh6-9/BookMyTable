import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      index: true,
    },
    paymentId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["received", "processing", "processed", "failed", "ignored"],
      default: "received",
      index: true,
    },
    payload: {
      type: Object,
    },
    processedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", webhookEventSchema);
