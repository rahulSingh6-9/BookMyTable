import mongoose from "mongoose";

const subscriptionOverrideReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    brandId: { type: String, ref: "BrandReadModel", required: true },
    subscriptionId: { type: String, ref: "BrandSubscriptionReadModel", required: true },
    overrideType: {
      type: String,
      required: true,
      enum: ["trial_extension", "temporary_upgrade", "downgrade", "reactivate", "suspend", "grace_period", "bonus_features"],
    },
    reason: { type: String, required: true },
    details: { type: Object, default: {} },
    appliedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SubscriptionOverrideReadModel = mongoose.model(
  "SubscriptionOverrideReadModel",
  subscriptionOverrideReadSchema
);

export default SubscriptionOverrideReadModel;
