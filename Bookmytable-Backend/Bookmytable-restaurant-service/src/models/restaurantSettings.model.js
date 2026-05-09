import mongoose from "mongoose";

/**
 * =========================================================
 * SPECIAL DAY SCHEMA
 * =========================================================
 */

const specialDaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    open: Number,

    close: Number,

    isClosed: {
      type: Boolean,
      default: false,
    },

    breaks: [
      {
        start: Number,
        end: Number,
      },
    ],

    note: String,
  },
  { _id: false }
);

/**
 * =========================================================
 * RESTAURANT SETTINGS
 * =========================================================
 */

const restaurantSettingsSchema = new mongoose.Schema(
  {
    /**
     * =========================================================
     * BRAND
     * =========================================================
     */
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },

    /**
     * =========================================================
     * BRANCH
     * =========================================================
     */
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      unique: true,
      index: true,
    },

    /**
     * =========================================================
     * TIME SLOT ENGINE
     * =========================================================
     */

    // Slot interval generation
    // Example:
    // 15 mins
    // 30 mins
    timeSlotInterval: {
      type: Number,
      default: 30,
    },

    // Booking duration
    // Example:
    // 60 mins
    // 90 mins
    slotDuration: {
      type: Number,
      default: 60,
    },

    /**
     * =========================================================
     * SPECIAL DAYS / HOLIDAYS
     * =========================================================
     */

    specialDays: {
      type: [specialDaySchema],
      default: [],
    },

    /**
     * =========================================================
     * BOOKING LIMITS
     * =========================================================
     */

    minGuestsPerBooking: {
      type: Number,
      default: 1,
    },

    maxGuestsPerBooking: {
      type: Number,
      default: 10,
    },

    /**
     * =========================================================
     * ADVANCE BOOKING
     * =========================================================
     */

    advanceBookingDays: {
      type: Number,
      default: 7,
    },

    minimumAdvanceNoticeMinutes: {
      type: Number,
      default: 30,
    },

    /**
     * =========================================================
     * CANCELLATION POLICY
     * =========================================================
     */

    cancellationPolicy: {
      type: String,
      trim: true,
    },

    cancellationAllowedBeforeMinutes: {
      type: Number,
      default: 60,
    },

    /**
     * =========================================================
     * AUTO ACCEPT
     * =========================================================
     */

    autoAcceptBookings: {
      type: Boolean,
      default: true,
    },

    /**
     * =========================================================
     * DEPOSIT SYSTEM
     * =========================================================
     */

    depositRequired: {
      type: Boolean,
      default: false,
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    depositType: {
      type: String,
      enum: [
        "fixed",
        "percentage",
      ],
      default: "fixed",
    },

    /**
     * =========================================================
     * ONLINE BOOKING LIMITS
     * =========================================================
     */

    onlineBookingLimitPerSlot: {
      type: Number,
      default: 10,
    },

    /**
     * =========================================================
     * BOOKING MODES
     * =========================================================
     */

    bookingModes: {
      dineIn: {
        type: Boolean,
        default: true,
      },

      takeaway: {
        type: Boolean,
        default: false,
      },

      delivery: {
        type: Boolean,
        default: false,
      },

      eventBooking: {
        type: Boolean,
        default: false,
      },
    },

    /**
     * =========================================================
     * WAITLIST
     * =========================================================
     */

    waitlistEnabled: {
      type: Boolean,
      default: true,
    },

    /**
     * =========================================================
     * BOOKING CONFIRMATION
     * =========================================================
     */

    requireManualConfirmation: {
      type: Boolean,
      default: false,
    },

    /**
     * =========================================================
     * BUFFER SETTINGS
     * =========================================================
     */

    tableBufferMinutes: {
      type: Number,
      default: 15,
    },

    /**
     * =========================================================
     * NOTIFICATIONS
     * =========================================================
     */

    notifications: {
      email: {
        type: Boolean,
        default: true,
      },

      sms: {
        type: Boolean,
        default: false,
      },

      whatsapp: {
        type: Boolean,
        default: false,
      },
    },

    /**
     * =========================================================
     * METADATA
     * =========================================================
     */

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================================
 * INDEXES
 * =========================================================
 */

restaurantSettingsSchema.index({
  branch: 1,
});

restaurantSettingsSchema.index({
  brand: 1,
});

export default mongoose.model(
  "RestaurantSettings",
  restaurantSettingsSchema
);