import mongoose from "mongoose";

/**
 * =========================================================
 * STAFF INVITE MODEL
 * =========================================================
 */

const staffInviteSchema = new mongoose.Schema(
  {
    /**
     * =========================================================
     * USER EMAIL
     * =========================================================
     */
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

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
      index: true,
    },

    /**
     * =========================================================
     * ROLE
     * =========================================================
     */
    role: {
      type: String,
      enum: [
        "owner",
        "co_owner",
        "manager",
        "assistant_manager",
        "cashier",
        "host",
        "waiter",
        "chef",
        "kitchen_staff",
        "support_staff",
      ],
      required: true,
      index: true,
    },

    /**
     * =========================================================
     * PERMISSIONS
     * =========================================================
     */
    permissions: {
      type: [String],
      default: [],
    },

    /**
     * =========================================================
     * INVITED BY
     * =========================================================
     */
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * =========================================================
     * INVITE TOKEN
     * =========================================================
     */
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    /**
     * =========================================================
     * INVITE STATUS
     * =========================================================
     */
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "expired",
        "cancelled",
        "rejected",
      ],
      default: "pending",
      index: true,
    },

    /**
     * =========================================================
     * ACCEPTANCE
     * =========================================================
     */
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    acceptedAt: {
      type: Date,
    },

    rejectedAt: {
      type: Date,
    },

    /**
     * =========================================================
     * OPTIONAL MESSAGE
     * =========================================================
     */
    message: {
      type: String,
      trim: true,
    },

    /**
     * =========================================================
     * EMPLOYMENT INFO
     * =========================================================
     */
    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
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

// Prevent duplicate active invite
staffInviteSchema.index(
  {
    email: 1,
    branch: 1,
    role: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
  }
);

// Auto delete expired invites
staffInviteSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

// Branch invite listing
staffInviteSchema.index({
  branch: 1,
  status: 1,
});

// Inviter analytics
staffInviteSchema.index({
  invitedBy: 1,
});

// Brand analytics
staffInviteSchema.index({
  brand: 1,
});

export default mongoose.model(
  "StaffInvite",
  staffInviteSchema
);