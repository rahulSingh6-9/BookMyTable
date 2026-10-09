import mongoose from "mongoose";

const businessEmailVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

businessEmailVerificationSchema.index({ userId: 1, email: 1 });
businessEmailVerificationSchema.index({ tokenHash: 1 }, { unique: true });

const BusinessEmailVerification = mongoose.model(
  "BusinessEmailVerification",
  businessEmailVerificationSchema
);

export default BusinessEmailVerification;
