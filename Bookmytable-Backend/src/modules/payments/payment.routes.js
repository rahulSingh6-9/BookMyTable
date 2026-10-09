import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { createOrder, verifyPayment, handleRazorpayWebhook } from "./payment.controller.js";

const router = express.Router();

// Create a Razorpay order (authenticated + phone verified)
router.post("/create-order", protect, createOrder);

// Verify payment signature after successful Razorpay callback
router.post("/verify", protect, verifyPayment);

// Razorpay Webhook endpoint (Signature-verified, no user JWT required)
router.post("/webhook", handleRazorpayWebhook);

export default router;
