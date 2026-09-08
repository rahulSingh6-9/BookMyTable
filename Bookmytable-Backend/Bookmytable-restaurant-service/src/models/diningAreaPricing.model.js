import mongoose from "mongoose";

const diningAreaPricingSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
    diningAreaType: {
      type: String,
      required: true,
      enum: ['indoor', 'outdoor', 'rooftop', 'private'],
    },
    sectionType: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for pricing config per branch/floor/type/section
diningAreaPricingSchema.index(
  { branch: 1, floor: 1, diningAreaType: 1, sectionType: 1 },
  { unique: true }
);

const DiningAreaPricing = mongoose.model("DiningAreaPricing", diningAreaPricingSchema);

export default DiningAreaPricing;
