import mongoose from "mongoose";

const tableLockSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 FIXED (Date आधारित)
    startAt: {
      type: Date,
      required: true,
      index: true,
    },

    endAt: {
      type: Date,
      required: true,
      index: true,
    },

    // 🔥 LOCK STATE
    status: {
      type: String,
      enum: ["active", "converted", "expired"],
      default: "active",
      index: true,
    },

    // 🔥 AFTER CONFIRMATION
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
    },

    // 🔥 AUTO DELETE
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// ✅ FAST SEARCH
tableLockSchema.index({ restaurant: 1, startAt: 1, endAt: 1 });

export default mongoose.model("TableLock", tableLockSchema);