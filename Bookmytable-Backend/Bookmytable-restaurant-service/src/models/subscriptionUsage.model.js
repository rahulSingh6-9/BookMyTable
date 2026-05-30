// =============================================
// subscriptionUsage.model.js
// =============================================

import mongoose from "mongoose";

const subscriptionUsageSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      unique: true,
    },

    branchesUsed: {
      type: Number,
      default: 0,
    },

    tablesUsed: {
      type: Number,
      default: 0,
    },

    staffUsed: {
      type: Number,
      default: 0,
    },

    reservationsThisMonth: {
      type: Number,
      default: 0,
    },

    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionUsage = mongoose.model(
  "SubscriptionUsage",
  subscriptionUsageSchema
);