import mongoose from "mongoose";

const subscriptionPlanReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    pricing: {
      monthly: { type: Number, default: 0 },
      yearly: { type: Number, default: 0 },
    },
    limits: {
      maxBranches: { type: Number, default: 1 },
      maxTables: { type: Number, default: 20 },
      maxStaff: { type: Number, default: 5 },
      maxReservationsPerMonth: { type: Number, default: 100 },
    },
    features: {
      analytics: { type: Boolean, default: false },
      qrOrdering: { type: Boolean, default: false },
      loyaltyProgram: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      multiBranchSupport: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    isTrialPlan: { type: Boolean, default: false },
    trialDays: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SubscriptionPlanReadModel = mongoose.model(
  "SubscriptionPlanReadModel",
  subscriptionPlanReadSchema
);

export default SubscriptionPlanReadModel;
