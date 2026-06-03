import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    /**
     * =========================================================
     * BRANCH RELATION
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
     * BRAND (optional but useful for enterprise queries)
     * =========================================================
     */
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    
    },

    /**
     * =========================================================
     * TABLE IDENTIFICATION
     * =========================================================
     */

    // Example:
    // T1
    // A-12
    // VIP-02
    tableCode: {
      type: String,
      required: true,
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    /**
     * =========================================================
     * CAPACITY
     * =========================================================
     */
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    minCapacity: {
      type: Number,
      default: 1,
    },

    maxCapacity: {
      type: Number,
    },

    /**
     * =========================================================
     * TABLE TYPE
     * =========================================================
     */
    type: {
      type: String,
      enum: [
        "indoor",
        "outdoor",
        "vip",
        "private",
        "bar",
        "rooftop",
        "family",
        "couple",
      ],
      default: "indoor",
      index: true,
    },

    /**
     * =========================================================
     * FLOOR + SECTION
     * =========================================================
     */
    floor: {
      type: String,
      trim: true,
    },
    floorLabel: {
      type: String,
      trim: true,
    },

    section: {
      type: String,
      trim: true,
    },
    sectionLabel: {
      type: String,
      trim: true,
    },

    /**
     * =========================================================
     * VISUAL LAYOUT POSITION
     * =========================================================
     */
    position: {
      x: {
        type: Number,
        default: 0,
      },

      y: {
        type: Number,
        default: 0,
      },

      rotation: {
        type: Number,
        default: 0,
      },
    },

    /**
     * =========================================================
     * TABLE STATUS
     * =========================================================
     */
    status: {
      type: String,
      enum: [
        "available",
        "occupied",
        "reserved",
        "maintenance",
        "inactive",
      ],
      default: "available",
      index: true,
    },

    /**
     * =========================================================
     * TABLE COMBINATION SUPPORT
     * =========================================================
     */
    mergeGroup: {
      type: String,
      index: true,
    },

    canMergeWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
      },
    ],

    /**
     * =========================================================
     * BOOKING RULES
     * =========================================================
     */
    bookingPriority: {
      type: Number,
      default: 0,
    },

    requiresDeposit: {
      type: Boolean,
      default: false,
    },

    minimumSpend: {
      type: Number,
      default: 0,
    },

    /**
     * =========================================================
     * FEATURES
     * =========================================================
     */
    features: {
      type: [String],
      default: [],
    },

    // Examples:
    // charging_port
    // smoking
    // sea_view
    // wheelchair_accessible

    /**
     * =========================================================
     * SOFT DELETE / ACTIVE
     * =========================================================
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * =========================================================
     * NOTES
     * =========================================================
     */
    notes: {
      type: String,
      trim: true,
    },

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

// Unique table code per branch
tableSchema.index(
  {
    branch: 1,
    tableCode: 1,
  },
  {
    unique: true,
  }
);

// Fast booking lookup
tableSchema.index({
  branch: 1,
  status: 1,
  isActive: 1,
});

// Fast filtering
tableSchema.index({
  branch: 1,
  floor: 1,
  section: 1,
});

// Type filtering
tableSchema.index({
  branch: 1,
  type: 1,
});

// Brand-level analytics
tableSchema.index({
  brand: 1,
});

// End of indexes

export default mongoose.model("Table", tableSchema);