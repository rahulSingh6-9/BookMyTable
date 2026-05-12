import mongoose from "mongoose";
import { ROLES } from "../config/roles.js";

const branchMembershipSchema = new mongoose.Schema(
  {
    // =========================
    // USER REFERENCE
    // =========================
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================
    // BRANCH REFERENCE
    // =========================
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantBranch",
      required: true,
      index: true,
    },

    // =========================
    // BRAND REFERENCE (denormalized for fast queries)
    // =========================
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },

    // =========================
    // ROLE
    // =========================
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      index: true,
    },

    // =========================
    // CUSTOM PERMISSIONS (OVERRIDE LAYER)
    // =========================
    permissions: {
      type: [
        {
          action: { type: String, required: true },
          scope: {
            type: String,
            enum: ["branch", "own_shift", "assigned_only", "global"],
            default: "branch",
          },
        },
      ],
      default: [],
    },

    // =========================
    // STATUS
    // =========================
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "removed", "rejected"],
      default: "pending",
      index: true,
    },

    // =========================
    // INVITATION SYSTEM
    // =========================
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    inviteToken: {
      type: String,
      index: true,
    },

    inviteExpiresAt: Date,

    invitedAt: Date,

    joinedAt: Date,

    // =========================
    // EMPLOYMENT INFO
    // =========================
    employeeId: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    // =========================
    // OWNERSHIP FLAGS
    // =========================
    isPrimaryOwner: {
      type: Boolean,
      default: false,
    },

    // =========================
    // SHIFT MANAGEMENT
    // =========================
    shift: {
      start: Number, // minutes from midnight
      end: Number,
    },

    // =========================
    // METADATA
    // =========================
    notes: {
      type: String,
      trim: true,
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
 * INDEXES (OPTIMIZED FOR SAAS SCALE)
 * =========================================================
 */

// Prevent duplicate membership per role per branch
branchMembershipSchema.index(
  { user: 1, branch: 1, role: 1 },
  { unique: true }
);

// Fast branch staff listing
branchMembershipSchema.index({ branch: 1, status: 1 });

// Fast user access lookup
branchMembershipSchema.index({ user: 1, status: 1 });

// Brand-level queries (analytics / admin panel)
branchMembershipSchema.index({ brand: 1, role: 1, status: 1 });


// Shift-based filtering (future use)
branchMembershipSchema.index({ branch: 1, "shift.start": 1, "shift.end": 1 });

export default mongoose.model(
  "BranchMembership",
  branchMembershipSchema
);