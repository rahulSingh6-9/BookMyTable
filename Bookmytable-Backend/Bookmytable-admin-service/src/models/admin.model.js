import mongoose from "mongoose";

/**
 * =========================================================
 * BOOKMYTABLE — ENTERPRISE ADMIN MODEL
 * =========================================================
 * Professional scalable SaaS admin architecture
 * Designed for:
 * - Multi-admin RBAC
 * - Enterprise permission system
 * - Brand/Branch scoped access
 * - Audit/security tracking
 * - Future scalability
 * =========================================================
 */

const adminSchema = new mongoose.Schema(
  {
    // =========================================================
    // USER RELATION
    // =========================================================

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // =========================================================
    // BASIC INFO
    // =========================================================

    name: {
      type: String,
      trim: true,
      maxlength: 120,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    // =========================================================
    // ROLE SYSTEM (RBAC)
    // =========================================================

    /**
     * Dynamic role references
     * Example:
     * SUPER_ADMIN
     * SUPPORT_ADMIN
     * FINANCE_ADMIN
     */
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminRole",
      },
    ],

    /**
     * Extra permissions added directly to admin
     * Example:
     * ["restaurants.approve"]
     */
    customPermissions: [
      {
        type: String,
        trim: true,
      },
    ],

    /**
     * Explicitly denied permissions
     * Even if role contains them
     */
    deniedPermissions: [
      {
        type: String,
        trim: true,
      },
    ],

    /**
     * Cached merged permissions
     * Improves performance
     */
    resolvedPermissions: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================================================
    // ACCESS SCOPE
    // =========================================================

    /**
     * Restrict admin access
     * Useful for regional/platform operators
     */
    scope: {
      brands: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
        },
      ],

      branches: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "RestaurantBranch",
        },
      ],

      regions: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    // =========================================================
    // STATUS MANAGEMENT
    // =========================================================

    status: {
      type: String,
      enum: [
        "active",
        "pending",
        "suspended",
        "blocked",
        "inactive",
      ],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },

    // =========================================================
    // SECURITY
    // =========================================================

    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },

      twoFactorSecret: {
        type: String,
        default: "",
      },

      failedLoginAttempts: {
        type: Number,
        default: 0,
      },

      lockedUntil: {
        type: Date,
      },

      passwordLastChangedAt: {
        type: Date,
      },
    },

    // =========================================================
    // SESSION / ACTIVITY TRACKING
    // =========================================================

    activity: {
      lastLoginAt: {
        type: Date,
      },

      lastLoginIp: {
        type: String,
        default: "",
      },

      lastLoginDevice: {
        type: String,
        default: "",
      },

      lastLoginLocation: {
        type: String,
        default: "",
      },
    },

    // =========================================================
    // PLATFORM FLAGS
    // =========================================================

    isSuperAdmin: {
      type: Boolean,
      default: false,
    },

    isSystemAdmin: {
      type: Boolean,
      default: false,
    },

    // =========================================================
    // AUDIT
    // =========================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    suspensionReason: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

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
 * QUERY MIDDLEWARE
 * =========================================================
 * Automatically hide deleted admins
 * =========================================================
 */

adminSchema.pre(/^find/, function (next) {
  this.where({
    isDeleted: false,
  });

  next();
});

/**
 * =========================================================
 * INDEXES
 * =========================================================
 * IMPORTANT:
 * Avoid duplicate indexes.
 * Do NOT use:
 * index: true
 * if schema.index() already exists.
 * =========================================================
 */

// Fast email lookup
adminSchema.index({ email: 1 }, { unique: true });

// Fast user lookup
adminSchema.index({ userId: 1 }, { unique: true });

// Role filtering
adminSchema.index({ roles: 1 });

// Status filtering
adminSchema.index({ status: 1 });

// Soft delete filtering
adminSchema.index({ isDeleted: 1 });

// Brand scope filtering
adminSchema.index({ "scope.brands": 1 });

// Branch scope filtering
adminSchema.index({ "scope.branches": 1 });

// Region scope filtering
adminSchema.index({ "scope.regions": 1 });

// Super admin lookup
adminSchema.index({ isSuperAdmin: 1 });

// System admin lookup
adminSchema.index({ isSystemAdmin: 1 });

// Last login tracking
adminSchema.index({ "activity.lastLoginAt": -1 });

// Compound admin search
adminSchema.index({
  status: 1,
  isDeleted: 1,
  roles: 1,
});

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;