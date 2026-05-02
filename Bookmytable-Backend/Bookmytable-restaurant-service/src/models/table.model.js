import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // Better than tableNumber
    tableCode: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    type: {
      type: String,
      enum: ["indoor", "outdoor", "vip"],
      default: "indoor",
      index: true,
    },

    // 🔥 SCALABILITY FIELDS
    floor: {
      type: String, // Ground, First, Rooftop
    },

    section: {
      type: String, // Window, Hall, Poolside
    },

    position: {
      x: Number,
      y: Number,
    }, // future visual layout editor

    notes: String,

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ UNIQUE PER RESTAURANT
tableSchema.index(
  { restaurant: 1, tableCode: 1 },
  { unique: true }
);

// ✅ FILTER OPTIMIZATION
tableSchema.index({ restaurant: 1, isActive: 1 });

export default mongoose.model("Table", tableSchema);