import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // 👤 USER (Reviewer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🏪 RESTAURANT BRANCH
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },

    // 📅 BOOKING (Strictly 1 Review Per Booking)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },

    // ⭐ THREE MANDATORY CATEGORIES (1-5 STARS)
    ratings: {
      food: {
        type: Number,
        required: [true, "Food rating is required"],
        min: [1, "Food rating must be between 1 and 5"],
        max: [5, "Food rating must be between 1 and 5"],
      },
      ambience: {
        type: Number,
        required: [true, "Ambience rating is required"],
        min: [1, "Ambience rating must be between 1 and 5"],
        max: [5, "Ambience rating must be between 1 and 5"],
      },
      service: {
        type: Number,
        required: [true, "Service rating is required"],
        min: [1, "Service rating must be between 1 and 5"],
        max: [5, "Service rating must be between 1 and 5"],
      },
    },

    // 🌟 COMPUTED OVERALL RATING: (food + ambience + service) / 3
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // 📝 OPTIONAL REVIEW TEXT
    review: {
      type: String,
      trim: true,
      maxlength: [2000, "Review text cannot exceed 2000 characters"],
      default: "",
    },

    // 🛡️ MODERATION STATUS
    status: {
      type: String,
      enum: ["published", "hidden", "rejected", "deleted"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound Indexes for fast restaurant reviews query and user review history
reviewSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
