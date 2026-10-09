import mongoose from "mongoose";

const adminInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
    },
    customPermissions: {
      type: [String],
      default: [],
    },
    invitedBy: {
      type: String,
      ref: "UserReadModel",
      required: true,
    },
    brandAccess: {
      type: [String],
      default: [],
    },
    branchAccess: {
      type: [String],
      default: [],
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    revokedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked", "delivery_failed"],
      default: "pending",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Prevent duplicate active invitations for the same email and role
adminInvitationSchema.index(
  { email: 1, role: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

// TTL index to automatically remove expired invitations after 30 days (optional cleanup)
// adminInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 2592000 });

const AdminInvitation = mongoose.model("AdminInvitation", adminInvitationSchema);
export default AdminInvitation;
