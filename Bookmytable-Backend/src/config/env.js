import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  JWT_SECRET: process.env.JWT_SECRET || "secretkey1221",
  GATEWAY_SECRET: process.env.GATEWAY_SECRET || "mysecretgateway123",
  WEB_URL: process.env.WEB_URL || "http://localhost:8080",
  ADMIN_URL: process.env.ADMIN_URL || "http://localhost:8081",
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  CLOUD_NAME: process.env.CLOUD_NAME || process.env.CLOUDINARY_NAME,
  API_KEY: process.env.API_KEY || process.env.CLOUDINARY_KEY,
  API_SECRET: process.env.API_SECRET || process.env.CLOUDINARY_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET,
  BOOKING_HOLD_DURATION_MINUTES: Number(process.env.BOOKING_HOLD_DURATION_MINUTES) || 10,
};
