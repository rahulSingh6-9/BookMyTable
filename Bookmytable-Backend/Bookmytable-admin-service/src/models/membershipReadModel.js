import mongoose from "mongoose";

const membershipReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    branchId: { type: String, required: true, ref: "BranchReadModel" },
    brandId: { type: String, required: true, ref: "BrandReadModel" },
    role: { type: String, required: true },
    permissions: [{ type: String }],
    status: { type: String, default: "active" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MembershipReadModel = mongoose.model("MembershipReadModel", membershipReadSchema);
export default MembershipReadModel;
