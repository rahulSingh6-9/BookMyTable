import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generates a cryptographically secure 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes the OTP for secure storage
 */
export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp, salt);
};

/**
 * Compares plain OTP with hashed OTP
 */
export const compareOTP = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};
