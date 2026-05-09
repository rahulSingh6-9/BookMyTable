import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema(
  {
    /**
     * =========================================================
     * BRAND
     * =========================================================
     */
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },

    /**
     * =========================================================
     * BRANCH
     * =========================================================
     */
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },

    /**
     * =========================================================
     * CATEGORY INFO
     * =========================================================
     */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    /**
     * =========================================================
     * MEDIA
     * =========================================================
     */
    image: {
      type: String,
      trim: true,
    },

    icon: {
      type: String,
      trim: true,
    },

    /**
     * =========================================================
     * UI ORDERING
     * =========================================================
     */
    order: {
      type: Number,
      default: 0,
      index: true,
    },

    /**
     * =========================================================
     * AVAILABILITY
     * =========================================================
     */
    availableFrom: {
      type: Number, // minutes from midnight
    },

    availableTill: {
      type: Number,
    },

    /**
     * =========================================================
     * STATUS
     * =========================================================
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * =========================================================
     * FEATURE FLAGS
     * =========================================================
     */
    isFeatured: {
      type: Boolean,
      default: false,
    },

    /**
     * =========================================================
     * METADATA
     * =========================================================
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================================
 * INDEXES
 * =========================================================
 */

// Unique category name per branch
menuCategorySchema.index(
  {
    branch: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

// Fast menu rendering
menuCategorySchema.index({
  branch: 1,
  isActive: 1,
  order: 1,
});

// Brand analytics
menuCategorySchema.index({
  brand: 1,
});

// Featured categories
menuCategorySchema.index({
  branch: 1,
  isFeatured: 1,
});

export default mongoose.model(
  "MenuCategory",
  menuCategorySchema
);