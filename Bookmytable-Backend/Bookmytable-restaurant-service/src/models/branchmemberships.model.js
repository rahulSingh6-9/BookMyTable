import mongoose from "mongoose";

/**
 * =========================================================
 * BRANCH MEMBERSHIP MODEL
 * =========================================================
 * Purpose:
 * - Connect users with restaurant branches
 * - RBAC (Role Based Access Control)
 * - Multi-owner / manager architecture
 * - Franchise support
 * - Enterprise scalability
 * =========================================================
 */

const branchMembershipSchema = new mongoose.Schema(
    {
        // 👤 USER
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // 🏪 BRANCH
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RestaurantBranch",
            required: true,
            index: true,
        },

        // 🧩 BRAND (optional but useful for enterprise queries)
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            index: true,
        },

        /**
         * =========================================================
         * ROLE SYSTEM
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
         * Fine-grained access control
         * =========================================================
         */
        ROLE_PERMISSIONS = {
            owner: ["*"],

            co_owner: [
                "MANAGE_BRANCH",
                "MANAGE_STAFF",
                "VIEW_ANALYTICS",
            ],

            manager: [
                "MANAGE_BOOKINGS",
                "MANAGE_TABLES",
                "VIEW_REPORTS",
            ],

            cashier: [
                "CREATE_BOOKING",
                "VIEW_BOOKINGS",
            ],

            waiter: [
                "VIEW_ASSIGNED_TABLES",
                "UPDATE_ORDER_STATUS",
            ],
        },

        /**
         * =========================================================
         * STAFF STATUS
         * =========================================================
         */
        status: {
            type: String,
            enum: [
                "pending",
                "active",
                "suspended",
                "removed",
                "rejected",
            ],
            default: "pending",
            index: true,
        },

        /**
         * =========================================================
         * INVITATION FLOW
         * =========================================================
         */
        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        inviteToken: {
            type: String,
            index: true,
        },

        inviteExpiresAt: {
            type: Date,
        },

        invitedAt: {
            type: Date,
        },

        joinedAt: {
            type: Date,
        },

        /**
         * =========================================================
         * EMPLOYMENT INFO
         * =========================================================
         */
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

        /**
         * =========================================================
         * ACCESS CONTROL
         * =========================================================
         */
        isPrimaryOwner: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        /**
         * =========================================================
         * SHIFT INFO (optional)
         * =========================================================
         */
        shift: {
            start: Number, // minutes from midnight
            end: Number,
        },

        /**
         * =========================================================
         * METADATA
         * =========================================================
         */
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
 * INDEXES
 * =========================================================
 */

// Prevent duplicate role entries for same user in same branch
branchMembershipSchema.index(
    {
        user: 1,
        branch: 1,
        role: 1,
    },
    {
        unique: true,
    }
);

// Fast branch staff listing
branchMembershipSchema.index({
    branch: 1,
    status: 1,
});

// Fast user access lookup
branchMembershipSchema.index({
    user: 1,
    status: 1,
});

// Brand-level filtering
branchMembershipSchema.index({
    brand: 1,
    role: 1,
});

// Invitation lookup
branchMembershipSchema.index({
    inviteToken: 1,
});

// Active staff lookup
branchMembershipSchema.index({
    isActive: 1,
    status: 1,
});

export default mongoose.model(
    "BranchMembership",
    branchMembershipSchema
);