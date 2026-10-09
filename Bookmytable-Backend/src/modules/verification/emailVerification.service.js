import VerificationToken from "../../models/verificationToken.model.js";
import { generateOTP, hashOTP } from "./otp.service.js";
import { notificationService } from "../notification/notification.service.js";

/**
 * Sends an email verification OTP directly via notification service
 */
export const sendEmailVerificationOTP = async (email, purpose = "email_verification") => {
  const otp = generateOTP();
  console.log("Email otp: ", otp);
  const hashedOtp = await hashOTP(otp);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await VerificationToken.findOneAndUpdate(
    { email, purpose },
    {
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
    },
    { upsert: true, new: true }
  );

  notificationService
    .sendPhoneOTP({ phone: email, otp, purpose })
    .catch((err) => console.error("❌ Failed to dispatch email OTP:", err.message));

  return { success: true, message: "Verification email sent" };
};

