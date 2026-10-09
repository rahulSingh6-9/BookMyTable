import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // in INR
    },
    amountInPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    provider: {
      type: String,
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },
    paidAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    webhookEvents: [
      {
        eventId: { type: String },
        eventType: { type: String },
        receivedAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1, status: 1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
