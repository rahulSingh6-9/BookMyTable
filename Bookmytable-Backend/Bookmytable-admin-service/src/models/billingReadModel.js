import mongoose from "mongoose";

const billingReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    brandId: { type: String, ref: "BrandReadModel", required: true },
    subscriptionId: { type: String, ref: "BrandSubscriptionReadModel", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentProvider: { type: String, default: null },
    transactionId: { type: String, default: null },
    invoiceUrl: { type: String, default: null },
    paidAt: { type: Date, default: null },
    metadata: { type: Object, default: {} },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BillingReadModel = mongoose.model(
  "BillingReadModel",
  billingReadSchema
);

export default BillingReadModel;
