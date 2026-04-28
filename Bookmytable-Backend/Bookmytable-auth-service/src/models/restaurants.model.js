import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    cuisine: {
      type: String,
      index: true, // 🔥 filter/search fast
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      index: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      index: true, // 🔥 location filter
    },

    lat: Number,
    lng: Number,

    images: [String],
    menuImages: [String],

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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔥 INDEXES (IMPORTANT)

// Search by city + cuisine
restaurantSchema.index({ city: 1, cuisine: 1 });

// Geo search (future use)
restaurantSchema.index({ lat: 1, lng: 1 });

export default mongoose.model("Restaurant", restaurantSchema);

