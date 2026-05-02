import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🔥 UI ordering
    order: {
      type: Number,
      default: 0,
    },

    // 🔥 soft delete
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// 🔥 Unique category name per restaurant
menuCategorySchema.index(
  { restaurant: 1, name: 1 },
  { unique: true }
);

export default mongoose.model("MenuCategory", menuCategorySchema);