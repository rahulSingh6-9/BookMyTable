import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
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

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    date: {
      type: String, // "2026-03-29"
      required: true,
    },

    // 🔥 UPDATED (better than timeSlot)
    startTime: {
      type: String, // "18:00"
      required: true,
    },

    endTime: {
      type: String, // "20:00"
      required: true,
    },

    guests: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    bookingSource: {
      type: String,
      enum: ["app", "walk-in"],
      default: "app",
    },

    // 🔥 CHECK-IN SYSTEM
    checkedIn: {
      type: Boolean,
      default: false,
    },

    checkInTime: Date,

    // 🔥 AUTO CANCEL IF NOT ARRIVED
    expiresAt: Date,

    specialRequest: String,
  },
  { timestamps: true }
);

// 🔥 INDEXES

// Prevent exact duplicate booking
bookingSchema.index(
  { table: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

// For fast availability queries
bookingSchema.index({ restaurant: 1, date: 1 });

export default mongoose.model("Booking", bookingSchema)