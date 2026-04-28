import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: String,
  },
  { timestamps: true }
);

// One review per user per restaurant
reviewSchema.index(
  { user: 1, restaurant: 1 },
  { unique: true }
);

export default mongoose.model("Review", reviewSchema);