import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // 👤 USER
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🏪 RESTAURANT
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // 🍽️ TABLE
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    // 📅 DATE
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },

    // ⏰ TIME (IN MINUTES)
    startTime: {
      type: Number, // e.g. 600
      required: true,
    },

    endTime: {
      type: Number,
      required: true,
    },

    // 👥 GUESTS
    guests: {
      type: Number,
      required: true,
    },

    // 📌 STATUS
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },

    // 💳 PAYMENT
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // 🔐 LOCK REFERENCE (IMPORTANT)
    lock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TableLock",
    },
  },
  { timestamps: true }
);

bookingSchema.index({
  restaurant: 1,
  table: 1,
  date: 1,
  startTime: 1,
  endTime: 1,
});