import mongoose from "mongoose";

const branchReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    brandId: { type: String, ref: "BrandReadModel" },
    branchName: { type: String },
    branchCode: { type: String },
    status: { type: String, default: "pending" },
    city: { type: String },
    address: { type: String },
    contactNumber: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    isActive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BranchReadModel = mongoose.model("BranchReadModel", branchReadSchema);
export default BranchReadModel;
