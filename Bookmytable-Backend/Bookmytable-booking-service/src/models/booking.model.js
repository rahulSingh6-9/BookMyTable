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
    
    // 🪑 TABLE TYPE
    tableType: {
      type: String,
      required: true,
      default: "Indoor"
    },

    // 🪑 TABLE ID
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
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
