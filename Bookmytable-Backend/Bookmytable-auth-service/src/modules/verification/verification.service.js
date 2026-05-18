import VerificationToken from '../../models/verificationToken.model.js';
import { generateOTP, hashOTP, compareOTP } from './otp.service.js';
import { emitEvent, AUTH_TOPICS } from '../../kafka/index.js';

export const sendPhoneOTP = async (phone, purpose) => {
  // 1. Generate OTP
  const otp = generateOTP();
  const hashedOtp = await hashOTP(otp);
  
  // 2. Save/Update in DB
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  
  await VerificationToken.findOneAndUpdate(
    { phone, purpose },
    { 
      otp: hashedOtp, 
      expiresAt,
      attempts: 0 
    },
    { upsert: true, new: true }
  );

  // 3. Emit Kafka Event for Notification Service
  await emitEvent(AUTH_TOPICS.PHONE_OTP_REQUESTED, {
    phone,
    otp, // Sending raw OTP to notification service to send to user
    purpose
  });

  return { success: true, message: 'OTP sent successfully' };
};


export const verifyPhoneOTP = async (phone, otp, purpose) => {
  const token = await VerificationToken.findOne({ phone, purpose });

  if (!token) {
    throw new Error('OTP expired or not requested');
  }

  if (new Date() > token.expiresAt) {
    await VerificationToken.deleteOne({ _id: token._id });
    throw new Error('OTP expired');
  }

  if (token.attempts >= 5) {
    throw new Error('Too many failed attempts. Please request a new OTP');
  }

  const isValid = await compareOTP(otp, token.otp);

  if (!isValid) {
    token.attempts += 1;
    await token.save();
    throw new Error('Invalid OTP');
  }

  // Success - Delete token
  await VerificationToken.deleteOne({ _id: token._id });

  return { success: true, message: 'Phone verified successfully' };
};

export const verifyEmailOTP = async (email, otp, purpose) => {
  const token = await VerificationToken.findOne({ email, purpose });

  if (!token) {
    throw new Error('OTP expired or not requested');
  }

  if (new Date() > token.expiresAt) {
    await VerificationToken.deleteOne({ _id: token._id });
    throw new Error('OTP expired');
  }

  if (token.attempts >= 5) {
    throw new Error('Too many failed attempts. Please request a new OTP');
  }

  const isValid = await compareOTP(otp, token.otp);

  if (!isValid) {
    token.attempts += 1;
    await token.save();
    throw new Error('Invalid OTP');
  }

  // Success - Delete token
  await VerificationToken.deleteOne({ _id: token._id });

  return { success: true, message: 'Email verified successfully' };
};

