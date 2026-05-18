import VerificationToken from '../../models/verificationToken.model.js';
import { generateOTP, hashOTP } from './otp.service.js';
import { emitEvent, AUTH_TOPICS } from '../../kafka/index.js';

/**
 * Sends an email verification OTP via Kafka
 */
export const sendEmailVerificationOTP = async (email, purpose = 'email_verification') => {
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  
  await VerificationToken.findOneAndUpdate(
    { email, purpose },
    { 
      otp: hashedOtp, 
      expiresAt,
      attempts: 0 
    },
    { upsert: true, new: true }
  );

  await emitEvent(AUTH_TOPICS.EMAIL_VERIFICATION_REQUESTED, {
    email,
    otp,
    purpose
  });

  return { success: true, message: 'Verification email sent' };
};
