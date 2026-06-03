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
    brandName: { type: String },
    cuisineTypes: [{ type: String }],
    description: { type: String },
    email: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    tablesCount: { type: Number, default: 0 },
    staffCount: { type: Number, default: 0 },
    bookingsEnabled: { type: Boolean, default: false },
    autoApproveBookings: { type: Boolean, default: false },
    bookingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    discoveryRanking: { type: Number, default: 0 },
    isHiddenFromDiscovery: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    suspendedAt: { type: Date },
    deletedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BranchReadModel = mongoose.model("BranchReadModel", branchReadSchema);
export default BranchReadModel;
