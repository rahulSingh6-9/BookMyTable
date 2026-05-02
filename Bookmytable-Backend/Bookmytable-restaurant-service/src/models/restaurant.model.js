import mongoose from "mongoose";

/**
 * 🔥 Reusable Break Schema
 */
const breakSchema = new mongoose.Schema(
  {
    start: {
      type: Number, // minutes from midnight (e.g. 14:00 → 840)
      required: true,
    },
    end: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/**
 * 🔥 Daily Timing Schema
 */
const dayScheduleSchema = new mongoose.Schema(
  {
    open: {
      type: Number, // e.g. 10:00 → 600
    },
    close: {
      type: Number, // e.g. 23:00 → 1380
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    breaks: {
      type: [breakSchema],
      default: [],
    },
  },
  { _id: false }
);

/**
 * 🔥 Weekly Schedule (OBJECT → FAST LOOKUP)
 */
const weeklyScheduleSchema = new mongoose.Schema(
  {
    mon: { type: dayScheduleSchema, required: true },
    tue: { type: dayScheduleSchema, required: true },
    wed: { type: dayScheduleSchema, required: true },
    thu: { type: dayScheduleSchema, required: true },
    fri: { type: dayScheduleSchema, required: true },
    sat: { type: dayScheduleSchema, required: true },
    sun: { type: dayScheduleSchema, required: true },
  },
  { _id: false }
);

/**
 * 🔥 MAIN RESTAURANT SCHEMA
 */
const restaurantSchema = new mongoose.Schema(
  {
    // 🔹 BASIC INFO
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    cuisine: {
      type: String,
      index: true,
    },

    // 👤 OWNER
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📍 LOCATION
    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    // 🖼️ MEDIA
    images: {
      type: [String],
      default: [],
    },

    menuImages: {
      type: [String],
      default: [],
    },

    // ⭐ RATINGS
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // 🟢 STATUS
    status: {
      type: String,
      enum: ["pending", "approved", "suspended", "rejected"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ⏰ TIMINGS (🔥 IMPROVED)
    openingHours: {
      type: weeklyScheduleSchema,
      required: true,
    },

    // 💰 OPTIONAL
    costForTwo: Number,

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

/**
 * 🔥 INDEXES (CRITICAL FOR SCALE)
 */

// search optimization
restaurantSchema.index({ city: 1, cuisine: 1 });

// geo search
restaurantSchema.index({ location: "2dsphere" });

// owner dashboard
restaurantSchema.index({ owner: 1 });

// status filtering (admin panel)
restaurantSchema.index({ status: 1, isActive: 1 });

export default mongoose.model("Restaurant", restaurantSchema);