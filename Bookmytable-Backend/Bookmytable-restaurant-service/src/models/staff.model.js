import mongoose from "mongoose";
import User from "./user.model.js"; // Ensure User model is registered

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["receptionist", "manager", "waiter"],
      required: true,
      index: true,
    },

    permissions: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Prevent duplicate staff per restaurant
staffSchema.index(
  { user: 1, restaurant: 1 },
  { unique: true }
);

// Fast restaurant staff listing
staffSchema.index({ restaurant: 1, isActive: 1 });

// Role-based queries
staffSchema.index({ restaurant: 1, role: 1 });

const staff = mongoose.model('restaurantstaff', staffSchema)

export default staff