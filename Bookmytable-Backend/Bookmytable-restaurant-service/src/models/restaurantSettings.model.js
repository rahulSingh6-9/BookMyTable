import mongoose from "mongoose";

const restaurantSettingsSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    unique: true,
    index: true
  },

  timeSlotInterval: {
    type: Number,
    default: 30,
  },

  slotDuration: {
    type: Number,
    default: 60,
  },

  specialDays: [
    {
      date: { type: Date, required: true },
      open: Number,
      close: Number,
      isClosed: Boolean,
      breaks: [
        {
          start: Number,
          end: Number
        }
      ]
    }
  ],

  minGuestsPerBooking: {
    type: Number,
    default: 1,
  },

  maxGuestsPerBooking: {
    type: Number,
    default: 10,
  },

  advanceBookingDays: {
    type: Number,
    default: 7,
  },

  cancellationPolicy: String,

  autoAcceptBookings: {
    type: Boolean,
    default: true,
  },

  depositRequired: {
    type: Boolean,
    default: false,
  },

  depositAmount: {
    type: Number,
    default: 0,
  },

  onlineBookingLimit: {
    type: Number,
    default: 10,
  },
});

export default mongoose.model("RestaurantSettings", restaurantSettingsSchema);