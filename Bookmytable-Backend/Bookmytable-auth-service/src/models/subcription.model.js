import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ["basic", "pro", "premium"],
      default: "basic",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "inactive",
    },

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);