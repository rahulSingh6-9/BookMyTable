import mongoose from "mongoose";

const brandSubscriptionReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    brandId: { type: String, ref: "BrandReadModel", required: true },
    subscriptionPlanId: { type: String, ref: "SubscriptionPlanReadModel", required: true },
    status: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled", "expired", "suspended"],
      default: "trial",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    trialEndsAt: { type: Date },
    autoRenew: { type: Boolean, default: false },
    paymentProvider: { type: String, default: null },
    paymentReference: { type: String, default: null },
    createdBy: { type: String, required: true },
    lastPaymentAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BrandSubscriptionReadModel = mongoose.model(
  "BrandSubscriptionReadModel",
  brandSubscriptionReadSchema
);

export default BrandSubscriptionReadModel;
