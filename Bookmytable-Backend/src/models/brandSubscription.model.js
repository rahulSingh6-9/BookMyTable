// =============================================
// brandSubscription.model.js
// =============================================

import mongoose from "mongoose";

const brandSubscriptionSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
        "suspended",
      ],
      default: "trial",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    trialEndsAt: {
      type: Date,
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },

    paymentProvider: {
      type: String,
      default: null,
    },

    paymentReference: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lastPaymentAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const BrandSubscription = mongoose.model(
  "BrandSubscription",
  brandSubscriptionSchema
);