import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔥 veg/non-veg filter
    isVeg: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🔥 availability control
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    // 🔥 soft delete
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // 🔥 optional image
    image: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },

    // 🔥 prep time (future: kitchen optimization)
    preparationTime: {
      type: Number, // minutes
      default: 10,
    },

    // 🔥 UI ordering inside category
    order: {
      type: Number,
      default: 0,
    },

    // 🔥 FUTURE READY (important)
    tags: [String], // "spicy", "popular", etc.

    // 🔥 FUTURE: rating / analytics
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔥 Unique item name per category per restaurant
menuItemSchema.index(
  { restaurant: 1, category: 1, name: 1 },
  { unique: true }
);

// 🔥 Fast query
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });

export default mongoose.model("MenuItem", menuItemSchema);