import Joi from 'joi';

export const sendPhoneOTPSchema = Joi.object({
  phone: Joi.string().required(),
  purpose: Joi.string().valid(
    'restaurant_onboarding', 
    'phone_verification', 
    'login_otp'
  ).optional()
});

export const verifyPhoneOTPSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required(),
  purpose: Joi.string().optional()
});

export const sendEmailOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().valid(
    'email_verification', 
    'password_reset'
  ).optional()
});

export const verifyEmailOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  purpose: Joi.string().optional()
});
