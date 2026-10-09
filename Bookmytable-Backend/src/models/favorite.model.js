import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    restaurantId: {
      type: String,
      required: [true, "Restaurant ID is required"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites for the same user and restaurant
favoriteSchema.index({ user: 1, restaurantId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
