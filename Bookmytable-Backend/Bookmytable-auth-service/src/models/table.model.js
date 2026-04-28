import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant", // ✅ FIXED
      required: true,
      index: true,
    },

    tableNumber: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🔥 TABLE STATUS SYSTEM
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available",
      index: true,
    },

    type: {
      type: String,
      enum: ["indoor", "outdoor", "vip"],
      default: "indoor",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// 🔥 UNIQUE TABLE NUMBER PER RESTAURANT
tableSchema.index(
  { restaurant: 1, tableNumber: 1 },
  { unique: true }
);

// 🔥 FAST AVAILABILITY QUERY
tableSchema.index({ restaurant: 1, status: 1 });

export default mongoose.model("Table", tableSchema);
