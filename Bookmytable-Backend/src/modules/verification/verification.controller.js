import * as verificationService from './verification.service.js';
import * as emailVerificationService from './emailVerification.service.js';

export const sendOTP = async (req, res, next) => {
  try {
    const { phone, purpose } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const result = await verificationService.sendPhoneOTP(phone, purpose || 'phone_verification');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp, purpose } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }
    const result = await verificationService.verifyPhoneOTP(phone, otp, purpose || 'phone_verification');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const sendEmailOTP = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const result = await emailVerificationService.sendEmailVerificationOTP(email, purpose || 'email_verification');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    const result = await verificationService.verifyEmailOTP(email, otp, purpose || 'email_verification');
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

