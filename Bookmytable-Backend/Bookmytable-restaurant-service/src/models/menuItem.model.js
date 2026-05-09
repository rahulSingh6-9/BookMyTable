import mongoose from "mongoose";

/**
 * =========================================================
 * VARIANT SCHEMA
 * =========================================================
 */

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * =========================================================
 * ADDON SCHEMA
 * =========================================================
 */

const addonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/**
 * =========================================================
 * MAIN MENU ITEM
 * =========================================================
 */

const menuItemSchema = new mongoose.Schema(
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
     * CATEGORY
     * =========================================================
     */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
      index: true,
    },

    /**
     * =========================================================
     * BASIC INFO
     * =========================================================
     */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    /**
     * =========================================================
     * PRICING
     * =========================================================
     */

    // Base/default price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountedPrice: {
      type: Number,
      min: 0,
    },

    costPrice: {
      type: Number,
      min: 0,
    },

    taxPercentage: {
      type: Number,
      default: 0,
    },

    /**
     * =========================================================
     * VARIANTS
     * =========================================================
     */

    variants: {
      type: [variantSchema],
      default: [],
    },

    /**
     * =========================================================
     * ADDONS
     * =========================================================
     */

    addons: {
      type: [addonSchema],
      default: [],
    },

    /**
     * =========================================================
     * FOOD TYPE
     * =========================================================
     */

    foodType: {
      type: String,
      enum: [
        "veg",
        "non_veg",
        "vegan",
        "egg",
        "jain",
      ],
      default: "veg",
      index: true,
    },

    /**
     * =========================================================
     * AVAILABILITY
     * =========================================================
     */

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    availableFrom: {
      type: Number,
    },

    availableTill: {
      type: Number,
    },

    /**
     * =========================================================
     * STOCK CONTROL
     * =========================================================
     */

    trackInventory: {
      type: Boolean,
      default: false,
    },

    stockQuantity: {
      type: Number,
      default: 0,
    },

    /**
     * =========================================================
     * MEDIA
     * =========================================================
     */

    image: {
      type: String,
      default: null,
    },

    imagePublicId: {
      type: String,
      default: null,
    },

    /**
     * =========================================================
     * PREPARATION
     * =========================================================
     */

    preparationTime: {
      type: Number,
      default: 10,
    },

    kitchenStation: {
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
    },

    /**
     * =========================================================
     * FEATURES
     * =========================================================
     */

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isRecommended: {
      type: Boolean,
      default: false,
    },

    isChefSpecial: {
      type: Boolean,
      default: false,
    },

    /**
     * =========================================================
     * TAGS
     * =========================================================
     */

    tags: {
      type: [String],
      default: [],
    },

    /**
     * =========================================================
     * ANALYTICS
     * =========================================================
     */

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    /**
     * =========================================================
     * VISIBILITY
     * =========================================================
     */

    visibility: {
      dineIn: {
        type: Boolean,
        default: true,
      },

      takeaway: {
        type: Boolean,
        default: true,
      },

      delivery: {
        type: Boolean,
        default: true,
      },
    },

    /**
     * =========================================================
     * SOFT DELETE
     * =========================================================
     */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Unique item per category in branch
menuItemSchema.index(
  {
    branch: 1,
    category: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

// Fast menu loading
menuItemSchema.index({
  branch: 1,
  isAvailable: 1,
  isActive: 1,
});

// Category filtering
menuItemSchema.index({
  category: 1,
  order: 1,
});

// Food filtering
menuItemSchema.index({
  branch: 1,
  foodType: 1,
});

// Featured items
menuItemSchema.index({
  branch: 1,
  isFeatured: 1,
});

// Analytics
menuItemSchema.index({
  branch: 1,
  totalOrders: -1,
});

// Brand analytics
menuItemSchema.index({
  brand: 1,
});

export default mongoose.model(
  "MenuItem",
  menuItemSchema
);