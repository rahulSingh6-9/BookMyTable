import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// Prevent duplicate favorites
favoriteSchema.index(
  { user: 1, restaurant: 1 },
  { unique: true }
);

export default mongoose.model("Favorite", favoriteSchema);