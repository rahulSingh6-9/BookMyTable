import crypto from "crypto";
import axios from "axios";
import User from "../../models/user.model.js";
import Booking from "../../models/booking.model.js";
import { env } from "../../config/env.js";
import {
  verifyWebhookSignature,
  verifyCheckoutSignature,
  reconcilePayment,
} from "./payment.service.js";

/**
 * Helper: check phone verification across all stored fields
 */
const isUserPhoneVerified = (user) =>
  user?.isPhoneVerified === true ||
  user?.phone?.isVerified === true ||
  user?.verification?.phoneVerified === true;

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please login to proceed with payment.",
      });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please login to proceed with payment.",
      });
    }

    if (!isUserPhoneVerified(user)) {
      return res.status(403).json({
        success: false,
        code: "PHONE_VERIFICATION_REQUIRED",
        message: "Please verify your phone number before making a payment.",
      });
    }

    let { amount, currency = "INR", bookingId } = req.body;

    // If bookingId is passed, use backend authoritative grandTotal
    if (bookingId) {
      const booking = await Booking.findById(bookingId).lean();
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      amount = booking.grandTotal;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid positive amount is required to create an order.",
      });
    }

    // Razorpay expects amount in paise (smallest currency unit, min 100 paise = 1 INR)
    const amountInPaise = Math.max(100, Math.round(Number(amount) * 100));

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured on the server.",
      });
    }

    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountInPaise,
        currency,
        receipt: `bmt_${userId}_${Date.now()}`.slice(0, 40),
        notes: {
          userId: userId.toString(),
          bookingId: bookingId ? bookingId.toString() : "",
        },
      },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const order = response.data;

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,         // in paise
        amountDisplay: Number(amount), // original INR for display
        currency: order.currency,
        keyId: keyId,                 // send key_id to frontend securely
      },
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error.response?.data || error.message);
    const errorDesc = error.response?.data?.error?.description || error.message || "Internal server error";
    res.status(500).json({
      success: false,
      message: errorDesc,
    });
  }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature after successful checkout and confirms reservation
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        code: "PAYMENT_VERIFICATION_FAILED",
        message: "Missing payment verification fields.",
      });
    }

    const keySecret = env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: "Payment gateway secret not configured" });
    }

    // Cryptographic signature check
    const isSignatureValid = verifyCheckoutSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isSignatureValid) {
      console.warn(`⚠️ Razorpay signature mismatch for order ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        code: "PAYMENT_VERIFICATION_FAILED",
        message: "Payment signature verification failed.",
      });
    }

    // Authoritative confirmation via shared reconciliation service
    const result = await reconcilePayment({
      bookingId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: "razorpay",
      source: "checkout",
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed successfully.",
      data: {
        bookingId: result.booking?._id,
        status: result.booking?.status,
        paymentStatus: result.booking?.paymentStatus,
        alreadyConfirmed: result.alreadyConfirmed || false,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error.message);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      code: error.code || "PAYMENT_VERIFICATION_ERROR",
      message: error.message || "Internal server error",
    });
  }
};

/**
 * POST /api/payments/razorpay/webhook
 * POST /api/payments/webhook
 * 
 * Razorpay Webhook Endpoint
 * 
 * Requirements:
 * - Accept only POST requests.
 * - Verify the X-Razorpay-Signature header using HMAC-SHA256 with RAZORPAY_WEBHOOK_SECRET.
 * - Uses raw HTTP request body.
 * - Idempotent event processing via x-razorpay-event-id.
 * - Central reconciliation service.
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

    if (!webhookSignature) {
      console.warn("⚠️ [Webhook] Missing X-Razorpay-Signature header");
      return res.status(400).json({ success: false, message: "Missing webhook signature" });
    }

    if (!webhookSecret) {
      console.error("❌ [Webhook] Webhook secret not configured on server");
      return res.status(500).json({ success: false, message: "Webhook secret not configured" });
    }

    // Capture raw body Buffer
    const rawPayload = Buffer.isBuffer(req.rawBody)
      ? req.rawBody
      : Buffer.isBuffer(req.body)
      ? req.body
      : typeof req.body === "string"
      ? Buffer.from(req.body, "utf8")
      : Buffer.from(JSON.stringify(req.body), "utf8");

    // Cryptographically verify signature using HMAC-SHA256 with timing-safe comparison
    const isValid = verifyWebhookSignature(rawPayload, webhookSignature, webhookSecret);
    if (!isValid) {
      console.error("❌ [Webhook] Invalid signature received from Razorpay");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    // Parse event payload
    let event = req.body;
    if (Buffer.isBuffer(event)) {
      try {
        event = JSON.parse(event.toString("utf8"));
      } catch (parseErr) {
        return res.status(400).json({ success: false, message: "Malformed JSON payload" });
      }
    }

    const eventId = req.headers["x-razorpay-event-id"] || event?.id;
    const eventType = event?.event;

    console.log(`🔔 [Webhook] Verified Razorpay event: ${eventType} (ID: ${eventId || "none"})`);

    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      console.log("ℹ️ [Webhook] Event contains no associated order_id. Ignoring safely.");
      return res.status(200).json({ status: "ignored", reason: "no_order_id" });
    }

    // Handle supported events: order.paid, payment.captured, payment.failed
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const result = await reconcilePayment({
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod: paymentEntity?.method || "razorpay",
        source: "webhook",
        eventType,
        eventId,
        paymentEntity,
        orderEntity,
      });

      return res.status(200).json({
        status: "ok",
        event: eventType,
        alreadyConfirmed: result.alreadyConfirmed || false,
      });
    } else if (eventType === "payment.failed") {
      await reconcilePayment({
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod: paymentEntity?.method || "razorpay",
        source: "webhook",
        eventType: "payment.failed",
        eventId,
        paymentEntity,
        orderEntity,
      });

      return res.status(200).json({ status: "ok", event: "payment.failed" });
    } else {
      console.log(`ℹ️ [Webhook] Unhandled event type: ${eventType}. Acknowledged safely.`);
      return res.status(200).json({ status: "ignored", eventType });
    }
  } catch (error) {
    console.error("❌ Error processing Razorpay webhook:", error.message);
    // Return 200 with error diagnostic to prevent endless retry loops on business logic exceptions
    return res.status(200).json({ status: "error", message: error.message });
  }
};
