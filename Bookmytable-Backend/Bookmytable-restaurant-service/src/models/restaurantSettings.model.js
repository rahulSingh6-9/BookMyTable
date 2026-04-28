import mongoose from "mongoose";

const restaurantSettingsSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
    },

    openingHours: {
      type: Object,
      required: true,
    },

    specialDays: {
      type: Array,
      default: [],
    },

    timeSlotInterval: {
      type: Number,
      default: 30,
    },

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

    cancellationPolicy: {
      type: String,
    },

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

    // 🔥 TIME SLOT CONTROL
    maxTablesPerSlot: {
      type: Number,
      default: 20,
    },

    onlineBookingLimit: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "RestaurantSettings",
  restaurantSettingsSchema
);