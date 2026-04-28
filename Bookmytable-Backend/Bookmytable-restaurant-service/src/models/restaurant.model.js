import mongoose from "mongoose";

const openingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      required: true,
    },

    open: {
      type: String, // "10:00"
    },

    close: {
      type: String, // "23:00"
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    breaks: [
      {
        start: String, // "15:00"
        end: String,   // "17:00"
      },
    ],
  },
  { _id: false }
);

const restaurantSchema = new mongoose.Schema(
  {
    // 🔥 BASIC INFO
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
      },
    },

    // 🖼️ MEDIA
    images: [String],
    menuImages: [String],

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

    // 🟢 STATUS (IMPORTANT FOR ADMIN PANEL)
    status: {
      type: String,
      enum: ["pending", "approved", "suspended", "rejected"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ⏰ TIMINGS (ADVANCED)
    openingHours: [openingHoursSchema],

    // 💰 OPTIONAL FUTURE FIELDS
    costForTwo: Number,
    tags: [String], // "family", "fine-dining", "budget"

  },
  { timestamps: true }
);


// 🔥 INDEXES (VERY IMPORTANT)

// search
restaurantSchema.index({ city: 1, cuisine: 1 });

// geo search
restaurantSchema.index({ location: "2dsphere" });

// owner lookup
restaurantSchema.index({ owner: 1 });

export default mongoose.model("Restaurant", restaurantSchema);