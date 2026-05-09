import mongoose from "mongoose";

/**
 * =========================================================
 * REUSABLE BREAK SCHEMA
 * =========================================================
 */

const breakSchema = new mongoose.Schema(
  {
    start: {
      type: Number, // minutes from midnight
      required: true,
    },

    end: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/**
 * =========================================================
 * DAILY SCHEDULE
 * =========================================================
 */

const dayScheduleSchema = new mongoose.Schema(
  {
    open: {
      type: Number,
    },

    close: {
      type: Number,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    breaks: {
      type: [breakSchema],
      default: [],
    },
  },
  { _id: false }
);

/**
 * =========================================================
 * WEEKLY SCHEDULE
 * =========================================================
 */

const weeklyScheduleSchema = new mongoose.Schema(
  {
    mon: { type: dayScheduleSchema, required: true },
    tue: { type: dayScheduleSchema, required: true },
    wed: { type: dayScheduleSchema, required: true },
    thu: { type: dayScheduleSchema, required: true },
    fri: { type: dayScheduleSchema, required: true },
    sat: { type: dayScheduleSchema, required: true },
    sun: { type: dayScheduleSchema, required: true },
  },
  { _id: false }
);

/**
 * =========================================================
 * MAIN RESTAURANT / BRANCH SCHEMA
 * =========================================================
 */

const restaurantSchema = new mongoose.Schema(
  {
    /**
     * =====================================================
     * BRAND RELATION
     * =====================================================
     */

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    /**
     * =====================================================
     * BRANCH INFO
     * =====================================================
     */

    branchName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    branchCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    branchType: {
      type: String,
      enum: [
        "main",
        "branch",
        "franchise",
        "cloud_kitchen",
      ],
      default: "branch",
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    /**
     * =====================================================
     * OWNER / MANAGER
     * =====================================================
     */

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    franchiseOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    /**
     * =====================================================
     * CONTACT INFO
     * =====================================================
     */

    contact: {
      primaryPhone: {
        countryCode: String,

        number: String,

        e164: {
          type: String,
          index: true,
        },

        isVerified: {
          type: Boolean,
          default: false,
        },
      },

      secondaryPhone: {
        countryCode: String,

        number: String,

        e164: String,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },

      supportEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },

    /**
     * =====================================================
     * LOCATION
     * =====================================================
     */

    address: {
      country: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      area: {
        type: String,
        trim: true,
      },

      addressLine1: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine2: {
        type: String,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },

      landmark: {
        type: String,
        trim: true,
      },
    },

    /**
     * =====================================================
     * GEO LOCATION
     * =====================================================
     */

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    /**
     * =====================================================
     * CUISINES / TAGS
     * =====================================================
     */

    cuisines: {
      type: [String],
      default: [],
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    searchKeywords: {
      type: [String],
      default: [],
    },

    /**
     * =====================================================
     * MEDIA
     * =====================================================
     */

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    menuImages: {
      type: [String],
      default: [],
    },

    /**
     * =====================================================
     * SERVICE MODES
     * =====================================================
     */

    serviceModes: {
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
    },

    /**
     * =====================================================
     * TABLE MANAGEMENT
     * =====================================================
     */

    totalTables: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * =====================================================
     * RATINGS
     * =====================================================
     */

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * =====================================================
     * STATUS
     * =====================================================
     */

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "suspended",
        "blocked",
      ],
      default: "draft",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * =====================================================
     * ADMIN MODERATION
     * =====================================================
     */

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: {
      type: Date,
    },

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejectedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    suspendedAt: {
      type: Date,
    },

    suspensionReason: {
      type: String,
      trim: true,
    },

    /**
     * =====================================================
     * OPERATING HOURS
     * =====================================================
     */

    openingHours: {
      type: weeklyScheduleSchema,
      required: true,
    },

    /**
     * =====================================================
     * BOOKING SETTINGS
     * =====================================================
     */

    bookingSettings: {
      advanceBookingDays: {
        type: Number,
        default: 30,
      },

      slotDurationMinutes: {
        type: Number,
        default: 60,
      },

      maxGuestsPerBooking: {
        type: Number,
        default: 20,
      },

      allowInstantBooking: {
        type: Boolean,
        default: true,
      },
    },

    /**
     * =====================================================
     * BUSINESS METADATA
     * =====================================================
     */

    establishmentYear: {
      type: Number,
    },

    costForTwo: {
      type: Number,
      min: 0,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    language: {
      type: String,
      default: "en",
    },

    currency: {
      type: String,
      default: "INR",
    },

    /**
     * =====================================================
     * ANALYTICS
     * =====================================================
     */

    totalBookings: {
      type: Number,
      default: 0,
    },

    totalCustomers: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0,
    },

    /**
     * =====================================================
     * SOFT DELETE
     * =====================================================
     */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
    },

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Geo queries
restaurantSchema.index({ location: "2dsphere" });

// Search optimization
restaurantSchema.index({
  "address.city": 1,
  cuisines: 1,
  status: 1,
});

// Brand dashboard
restaurantSchema.index({
  brandId: 1,
  status: 1,
});

// Owner dashboard
restaurantSchema.index({
  ownerId: 1,
  status: 1,
});

// Manager dashboard
restaurantSchema.index({
  managerId: 1,
});

// Public discovery
restaurantSchema.index({
  averageRating: -1,
  totalReviews: -1,
});

// Search
restaurantSchema.index({
  branchName: "text",
  description: "text",
  cuisines: "text",
  tags: "text",
});

// Status filtering
restaurantSchema.index({
  status: 1,
  isActive: 1,
});

// Slug
restaurantSchema.index({
  slug: 1,
});

// Branch code
restaurantSchema.index({
  branchCode: 1,
});

const Restaurant = mongoose.model("Restaurantbranches", restaurantSchema);

export default Restaurant;