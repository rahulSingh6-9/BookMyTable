import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      index: true,
    },
    email: {
      type: String,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: [
        "restaurant_onboarding",
        "email_verification",
        "phone_verification",
        "password_reset",
        "login_otp",
      ],
      default: "phone_verification",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "0s" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.VerificationToken || mongoose.model("VerificationToken", verificationTokenSchema);
