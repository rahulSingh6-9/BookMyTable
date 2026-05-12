import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * =========================================================
 * USER SCHEMA
 * =========================================================
 */

const userSchema = new mongoose.Schema(
  {
    /**
     * =========================================================
     * BASIC INFO
     * =========================================================
     */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },

    /**
     * =========================================================
     * EMAIL
     * =========================================================
     */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please use a valid email address",
      ],
    },

    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
    },

    /**
     * =========================================================
     * PASSWORD
     * =========================================================
     */

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    /**
     * =========================================================
     * AUTH PROVIDERS
     * =========================================================
     */

    authProviders: {
      google: {
        id: String,
      },

      apple: {
        id: String,
      },

      phone: {
        id: String,
      },
    },

    /**
     * =========================================================
     * GLOBAL PLATFORM ROLES
     * =========================================================
     */

    // ONLY GLOBAL ACCESS
    // Branch roles belong in BranchMembership
    roles: {
      type: [String],
      enum: [
        "customer",
        "admin",
        "super_admin",
      ],
      default: ["customer"],
      index: true,
    },

    /**
     * =========================================================
     * PHONE
     * =========================================================
     */

    phone: {
      e164: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        match: [
          /^\+\d{10,15}$/,
          "Invalid phone number",
        ],
      },

      countryCode: {
        type: String,
      },

      number: {
        type: String,
      },

      isVerified: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
      },
    },

    /**
     * =========================================================
     * PROFILE
     * =========================================================
     */

    avatar: {
      type: String,
    },

    bio: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
      ],
    },

    /**
     * =========================================================
     * ACCOUNT STATUS
     * =========================================================
     */

    accountStatus: {
      type: String,
      enum: [
        "active",
        "blocked",
        "suspended",
        "deleted",
        "pending_verification",
      ],
      default: "active",
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * =========================================================
     * SECURITY
     * =========================================================
     */

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lastLoginAt: {
      type: Date,
    },

    lastLoginIp: {
      type: String,
    },

    /**
     * =========================================================
     * PREFERENCES
     * =========================================================
     */

    preferences: {
      language: {
        type: String,
        default: "en",
      },

      notifications: {
        email: {
          type: Boolean,
          default: true,
        },

        sms: {
          type: Boolean,
          default: false,
        },

        push: {
          type: Boolean,
          default: true,
        },

        whatsapp: {
          type: Boolean,
          default: false,
        },
      },
    },

    /**
     * =========================================================
     * SOFT DELETE
     * =========================================================
     */

    deletedAt: {
      type: Date,
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
 * PASSWORD HASHING
 * =========================================================
 */

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * =========================================================
 * PASSWORD COMPARE
 * =========================================================
 */

userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  return bcrypt.compare(
    enteredPassword,
    this.password
  );
};

/**
 * =========================================================
 * INDEXES
 * =========================================================
 */

// Global status filtering
userSchema.index({
  accountStatus: 1,
});

// Role filtering
userSchema.index({
  roles: 1,
});

// Verification filtering
userSchema.index({
  emailVerified: 1,
});

// Last login analytics
userSchema.index({
  lastLoginAt: -1,
});

export default mongoose.model(
  "User",
  userSchema
);