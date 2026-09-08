import mongoose from "mongoose";

const diningAreaSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["indoor_dining", "outdoor_dining", "rooftop_dining", "private_room"],
      default: "indoor_dining",
    },
    description: {
      type: String,
      trim: true,
    },
    /**
     * =========================================================
     * PRICING
     * =========================================================
     * Base price for all tables in this dining area.
     * Overridden by sectionPrice (on sections) or tablePriceOverride (on tables).
     */
    basePrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeLayoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LayoutProject",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
diningAreaSchema.index({ branch: 1, isDeleted: 1 });

export default mongoose.model("DiningArea", diningAreaSchema);
