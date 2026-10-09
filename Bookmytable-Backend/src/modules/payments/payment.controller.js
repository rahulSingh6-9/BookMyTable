import crypto from "crypto";
import axios from "axios";
import User from "../../models/user.model.js";
import Booking from "../../models/booking.model.js";
import Payment from "../../models/payment.model.js";
import TableLock from "../../models/tableLock.model.js";
import { env } from "../../config/env.js";
import { confirmBookingPayment } from "../booking/booking.service.js";
import { emitTableAvailabilityChanged } from "../../config/socket.js";

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

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn(`⚠️ Razorpay signature mismatch for order ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        code: "PAYMENT_VERIFICATION_FAILED",
        message: "Payment signature verification failed.",
      });
    }

    // Authoritative confirmation on the backend
    const result = await confirmBookingPayment({
      bookingId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: "razorpay",
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed successfully.",
      data: {
        bookingId: result.booking._id,
        status: result.booking.status,
        paymentStatus: result.booking.paymentStatus,
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
 * POST /api/payments/webhook
 * Razorpay Webhook Endpoint
 * 
 * Verifies webhook signature, ensures idempotency, confirms booking or marks failure.
 * No user JWT required.
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

    if (!webhookSignature) {
      return res.status(400).json({ success: false, message: "Missing webhook signature" });
    }

    // Verify webhook signature using raw body
    const rawPayload = req.rawBody ? req.rawBody : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      console.error("❌ [Webhook] Invalid signature received from Razorpay");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body;
    const eventType = event.event;
    console.log(`🔔 [Webhook] Received Razorpay event: ${eventType} (ID: ${event.id || "none"})`);

    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      console.log("ℹ️ [Webhook] Event contains no associated order_id. Ignoring safely.");
      return res.status(200).json({ status: "ignored" });
    }

    // Find the payment and booking records
    const payment = await Payment.findOne({ razorpayOrderId });
    const booking = await Booking.findOne({ razorpayOrderId });

    if (!booking) {
      console.warn(`⚠️ [Webhook] No booking found for order ${razorpayOrderId}`);
      return res.status(200).json({ status: "booking_not_found" });
    }

    // IDEMPOTENCY CHECK
    if (payment && event.id) {
      const alreadyProcessed = payment.webhookEvents?.some(e => e.eventId === event.id);
      if (alreadyProcessed) {
        console.log(`ℹ️ [Webhook Idempotency] Duplicate event ${event.id} already processed.`);
        return res.status(200).json({ status: "already_processed" });
      }
      payment.webhookEvents.push({
        eventId: event.id,
        eventType,
        receivedAt: new Date(),
      });
      await payment.save();
    }

    // Process event
    if (eventType === "payment.captured" || eventType === "order.paid") {
      await confirmBookingPayment({
        bookingId: booking._id,
        razorpayOrderId,
        razorpayPaymentId,
        paymentMethod: paymentEntity?.method || "razorpay",
      });
      console.log(`✅ [Webhook] Confirmed booking ${booking._id} via webhook ${eventType}`);
    } else if (eventType === "payment.failed") {
      const failureReason = paymentEntity?.error_description || "Payment failed via gateway";

      if (payment) {
        payment.status = "failed";
        payment.failureReason = failureReason;
        await payment.save();
      }

      if (booking.status === "payment_pending") {
        booking.status = "payment_failed";
        booking.paymentStatus = "failed";
        await booking.save();

        await TableLock.updateMany({ booking: booking._id }, { status: "expired" });

        const tableIds = booking.tables?.length > 0 ? booking.tables.map(t => t.tableId) : [booking.tableId];
        emitTableAvailabilityChanged({
          restaurantId: booking.restaurantId,
          date: booking.date,
          time: booking.time,
          tableIds,
          status: "available",
        });

        console.log(`❌ [Webhook] Booking ${booking._id} marked payment_failed, table released.`);
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error processing Razorpay webhook:", error.message);
    // Return 200 to prevent Razorpay retry loops on internal handling errors
    return res.status(200).json({ status: "error", message: error.message });
  }
};
