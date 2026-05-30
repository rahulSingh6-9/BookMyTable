import mongoose from "mongoose";

const invitationReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, index: true },
    role: { type: String, required: true },
    restaurantId: { type: String, required: true, ref: "BranchReadModel" },
    brandId: { type: String, ref: "BrandReadModel" },
    status: { type: String, default: "pending" }, // pending, accepted, expired, cancelled, rejected, delivery_failed
    invitedBy: { type: String, required: true },
    inviteLink: { type: String },
    expiresAt: { type: Date },
    acceptedAt: { type: Date },
    error: { type: String }, // For delivery failures
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const InvitationReadModel = mongoose.model("InvitationReadModel", invitationReadSchema);
export default InvitationReadModel;
