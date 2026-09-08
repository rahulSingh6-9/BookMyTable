import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    // =========================================================
    // BASIC BRAND INFO
    // =========================================================
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // Unique public URL slug
    // Example:
    // burger-farm
    // dominos-india
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Used for duplicate/spam detection
    // Example:
    // "Burger Farm" -> "burgerfarm"
    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    
    },

    description: {
      type: String,
      maxlength: 2000,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    // =========================================================
    // BRAND OWNERSHIP
    // =========================================================

    // Main business owner account
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================================================
    // BUSINESS TYPE
    // =========================================================

    businessType: {
      type: String,
      enum: [
        "single_restaurant",
        "multi_branch",
        "franchise",
        "cloud_kitchen",
        "enterprise_chain",
      ],
      default: "single_restaurant",
      index: true,
    },

    cuisineTypes: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================================================
    // BRAND STATUS
    // =========================================================

    status: {
      type: String,
      enum: [
        "draft",
        "pending_review",
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

    // =========================================================
    // VERIFICATION SYSTEM
    // =========================================================

    isVerifiedBrand: {
      type: Boolean,
      default: false,
      index: true,
    },

    verificationStatus: {
      type: String,
      enum: [
        "not_submitted",
        "pending",
        "approved",
        "rejected",
      ],
      default: "not_submitted",
    },

    verifiedAt: {
      type: Date,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // =========================================================
    // LEGAL / BUSINESS DETAILS
    // =========================================================

    legalBusinessName: {
      type: String,
      trim: true,
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    trademarkNumber: {
      type: String,
      trim: true,
      default: "",
    },

    fssaiLicenseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================================================
    // CONTACT INFO
    // =========================================================

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    contactEmailVerified: {
      type: Boolean,
      default: false,
    },

    pendingContactEmail: {
      email: { type: String, trim: true, lowercase: true },
      tokenId: { type: String },
      expiresAt: { type: Date }
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    contactPhoneVerified: {
      type: Boolean,
      default: false,
    },

    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // =========================================================
    // HEADQUARTERS ADDRESS
    // =========================================================

    headquartersAddress: {
      country: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      addressLine1: {
        type: String,
        default: "",
      },

      addressLine2: {
        type: String,
        default: "",
      },

      postalCode: {
        type: String,
        default: "",
      },
    },

    // =========================================================
    // PLATFORM METADATA
    // =========================================================

    totalBranches: {
      type: Number,
      default: 0,
    },

    totalStaff: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // =========================================================
    // SUBSCRIPTION / BILLING
    // =========================================================

    subscriptionPlan: {
      type: String,
      enum: [
        "free",
        "starter",
        "pro",
        "enterprise",
      ],
      default: "free",
    },

    subscriptionStatus: {
      type: String,
      enum: [
        "active",
        "inactive",
        "cancelled",
        "past_due",
      ],
      default: "active",
    },

    // =========================================================
    // SOFT DELETE
    // =========================================================

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
    },

    // =========================================================
    // AUDIT
    // =========================================================

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

// =========================================================
// INDEXES
// =========================================================

brandSchema.index({ normalizedName: 1 });

brandSchema.index({
  name: "text",
  description: "text",
});

brandSchema.index({
  ownerId: 1,
  status: 1,
});

brandSchema.index({
  businessType: 1,
  status: 1,
});

brandSchema.index({
  isVerifiedBrand: 1,
  verificationStatus: 1,
});
const Brand = mongoose.model("Brand", brandSchema);

export default Brand;