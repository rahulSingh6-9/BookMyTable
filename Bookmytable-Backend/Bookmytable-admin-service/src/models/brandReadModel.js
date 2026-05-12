import mongoose from "mongoose";

const brandReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    ownerId: { type: String }, // User ID of the brand owner
    status: { type: String, default: "pending" },
    logo: { type: String },
    description: { type: String },
    isVerified: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BrandReadModel = mongoose.model("BrandReadModel", brandReadSchema);
export default BrandReadModel;
