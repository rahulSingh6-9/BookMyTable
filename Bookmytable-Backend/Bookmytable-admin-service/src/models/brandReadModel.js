import mongoose from "mongoose";
import "./userReadModel.js"; // Import to register schema for populate

const brandReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    ownerId: { type: String, ref: "UserReadModel" }, // User ID of the brand owner
    status: { type: String, default: "pending" },
    logo: { type: String },
    description: { type: String },
    isVerified: { type: Boolean, default: false },
    slug: { type: String },
    totalBranches: { type: Number, default: 0 },
    activeBranches: { type: Number, default: 0 },
    deactivatedBranches: { type: Number, default: 0 },
    pendingBranches: { type: Number, default: 0 },
    suspendedBranches: { type: Number, default: 0 },
    staffCount: { type: Number, default: 0 },
    bookingsCount: { type: Number, default: 0 },
    contactEmail: { type: String, default: "" },
    contactEmailVerified: { type: Boolean, default: false },
    contactPhone: { type: String, default: "" },
    contactPhoneVerified: { type: Boolean, default: false },
    supportEmail: { type: String, default: "" },
    website: { type: String, default: "" },
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BrandReadModel = mongoose.model("BrandReadModel", brandReadSchema);
export default BrandReadModel;
