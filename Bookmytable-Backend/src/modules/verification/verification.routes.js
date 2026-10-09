import express from 'express';
import * as verificationController from './verification.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { 
  sendPhoneOTPSchema, 
  verifyPhoneOTPSchema, 
  sendEmailOTPSchema, 
  verifyEmailOTPSchema 
} from './verification.validation.js';

const router = express.Router();

router.post('/send-phone-otp', validate(sendPhoneOTPSchema), verificationController.sendOTP);
router.post('/verify-phone-otp', validate(verifyPhoneOTPSchema), verificationController.verifyOTP);

router.post('/send-email-otp', validate(sendEmailOTPSchema), verificationController.sendEmailOTP);
router.post('/verify-email-otp', validate(verifyEmailOTPSchema), verificationController.verifyEmailOTP);


export default router;
