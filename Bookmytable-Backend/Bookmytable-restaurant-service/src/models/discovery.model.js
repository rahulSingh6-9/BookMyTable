import mongoose from "mongoose";

const discoveryRestaurantSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    description: String,
    
    // Flattened Location Data
    city: {
      type: String,
      required: true,
      index: true,
    },
    area: {
      type: String,
      index: true,
    },
    addressLine1: String,
    
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

    cuisines: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    
    averageRating: {
      type: Number,
      default: 0,
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    logo: String,
    coverImage: String,
    phone: String,
    
    costForTwo: Number,
    
    // Status
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "suspended",
        "blocked",
      ],
      default: "draft",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geo index
discoveryRestaurantSchema.index({ location: "2dsphere" });

// Text index for search
discoveryRestaurantSchema.index({
  name: "text",
  cuisines: "text",
  area: "text",
  tags: "text",
});

// Composite index for common queries
discoveryRestaurantSchema.index({ city: 1, status: 1, isDeleted: 1 });

const DiscoveryRestaurant = mongoose.model("DiscoveryRestaurant", discoveryRestaurantSchema);

export default DiscoveryRestaurant;
