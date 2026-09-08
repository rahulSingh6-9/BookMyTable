import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // 👤 USER
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // 🏪 RESTAURANT
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // 📅 DATE
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },

    // ⏰ TIME (e.g. "19:00")
    time: {
      type: String, 
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
    
    // 🪑 TABLE METADATA (Legacy Singular Fields for backwards compatibility)
    tableType: {
      type: String,
      default: "indoor_dining"
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    tableName: {
      type: String,
    },
    sectionLabel: {
      type: String,
    },
    floorLabel: {
      type: String,
    },

    // 🪑 NEW MULTI-TABLE SUPPORT
    tables: [
      {
        tableId: { type: mongoose.Schema.Types.ObjectId, required: true },
        tableName: { type: String, required: true },
        tableType: { type: String, default: "indoor_dining" },
        tablePrice: { type: Number, default: 0 },
        sectionLabel: { type: String },
        floorLabel: { type: String },
      }
    ],

    // 💰 FINANCIAL DATA
    tablePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    foodTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },

    // 💳 PAYMENT
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["pay_at_restaurant", "upi", "card", "netbanking", "wallet", "none"],
      default: "none",
    },

    specialRequests: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

bookingSchema.index({
  restaurantId: 1,
  tableId: 1,
  date: 1,
  time: 1,
});

export default mongoose.model("Booking", bookingSchema);
