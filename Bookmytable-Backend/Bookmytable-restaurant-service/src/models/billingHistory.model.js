// =============================================
// billingHistory.model.js
// =============================================

import mongoose from "mongoose";

const billingHistorySchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BrandSubscription",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    paymentProvider: {
      type: String,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    invoiceUrl: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const BillingHistory = mongoose.model(
  "BillingHistory",
  billingHistorySchema
);