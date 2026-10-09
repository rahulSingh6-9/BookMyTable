import VerificationToken from "../../models/verificationToken.model.js";
import { generateOTP, hashOTP, compareOTP } from "./otp.service.js";
import { notificationService } from "../notification/notification.service.js";

export const sendPhoneOTP = async (phone, purpose) => {
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await VerificationToken.findOneAndUpdate(
    { phone, purpose },
    {
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
    },
    { upsert: true, new: true }
  );

  notificationService
    .sendPhoneOTP({ phone, otp, purpose })
    .catch((err) => console.error("❌ Failed to dispatch phone OTP:", err.message));

  return { success: true, message: "OTP sent successfully" };
};

export const verifyPhoneOTP = async (phone, otp, purpose) => {
  const token = await VerificationToken.findOne({ phone, purpose });

  if (!token) {
    throw new Error("OTP expired or not requested");
  }

  if (new Date() > token.expiresAt) {
    await VerificationToken.deleteOne({ _id: token._id });
    throw new Error("OTP expired");
  }

  if (token.attempts >= 5) {
    throw new Error("Too many failed attempts. Please request a new OTP");
  }

  const isValid = await compareOTP(otp, token.otp);

  if (!isValid) {
    token.attempts += 1;
    await token.save();
    throw new Error("Invalid OTP");
  }

  await VerificationToken.deleteOne({ _id: token._id });

  return { success: true, message: "Phone number verified successfully" };
};

