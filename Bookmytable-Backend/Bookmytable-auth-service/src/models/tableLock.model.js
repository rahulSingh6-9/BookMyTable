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
      ref: "Restaurant",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String, // "2026-03-29"
      required: true,
      index: true,
    },

    // 🔥 FIXED (no more timeSlot)
    startTime: {
      type: String, // "18:00"
      required: true,
    },

    endTime: {
      type: String, // "20:00"
      required: true,
    },

    // 🔥 AUTO DELETE LOCK
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  { timestamps: true }
);

// 🔥 FAST QUERY INDEX
tableLockSchema.index({ restaurant: 1, date: 1 });

// 🔥 NOTE:
// Overlap prevention will be handled in service logic (NOT by unique index)

export default mongoose.model("TableLock", tableLockSchema);
