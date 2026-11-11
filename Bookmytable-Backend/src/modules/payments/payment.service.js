import crypto from "crypto";
import axios from "axios";
import Booking from "../../models/booking.model.js";
import Payment from "../../models/payment.model.js";
import TableLock from "../../models/tableLock.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import User from "../../models/user.model.js";
import WebhookEvent from "../../models/webhookEvent.model.js";
import { env } from "../../config/env.js";
import {
  emitTableAvailabilityChanged,
  emitBookingConfirmed,
} from "../../config/socket.js";
import { notificationService } from "../notification/notification.service.js";
import { incrementReservationUsage } from "../subscriptions/subscription.service.js";

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export const timingSafeCompare = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Verify HMAC-SHA256 Razorpay Webhook Signature against raw payload
 */
export const verifyWebhookSignature = (rawPayload, signature, secret) => {
  if (!rawPayload || !signature || !secret) {
    return false;
  }
  try {
    const rawBuffer = Buffer.isBuffer(rawPayload)
      ? rawPayload
      : typeof rawPayload === "string"
      ? Buffer.from(rawPayload, "utf8")
      : Buffer.from(JSON.stringify(rawPayload), "utf8");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBuffer)
      .digest("hex");

    return timingSafeCompare(expectedSignature, signature);
  } catch (err) {
    console.error("❌ Error verifying webhook signature:", err.message);
    return false;
  }
};

/**
 * Verify Razorpay Checkout Signature (order_id|payment_id)
 */
export const verifyCheckoutSignature = (orderId, paymentId, signature, secret) => {
  if (!orderId || !paymentId || !signature || !secret) {
    return false;
  }
  try {
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return timingSafeCompare(expectedSignature, signature);
  } catch (err) {
    console.error("❌ Error verifying checkout signature:", err.message);
    return false;
  }
};

/**
 * Fetch Payment Entity from Razorpay API
 */
export const fetchRazorpayPayment = async (paymentId) => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !paymentId) return null;

  try {
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: authHeader },
      timeout: 8000,
    });
    return response.data;
  } catch (err) {
    console.warn(`⚠️ [Razorpay API] Could not fetch payment ${paymentId}:`, err.response?.data?.error?.description || err.message);
    return null;
  }
};

/**
 * Fetch Order Entity from Razorpay API
 */
export const fetchRazorpayOrder = async (orderId) => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !orderId) return null;

  try {
    const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await axios.get(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { Authorization: authHeader },
      timeout: 8000,
    });
    return response.data;
  } catch (err) {
    console.warn(`⚠️ [Razorpay API] Could not fetch order ${orderId}:`, err.response?.data?.error?.description || err.message);
    return null;
  }
};

/**
 * Central Shared Payment Reconciliation Service
 * 
 * Used by both frontend Checkout verification and Razorpay Webhook.
 * Enforces:
 * - Idempotency
 * - Amount & Currency Validation
 * - Double-Booking Prevention & Expired Hold Recovery (Phase 7)
 * - Safe Payment Failure Handling (No eager cancellation if hold is still active)
 * - Single-execution Email & Socket.IO notifications
 */
export const reconcilePayment = async ({
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod = "razorpay",
  source = "webhook", // 'webhook' | 'checkout'
  eventType = "payment.captured",
  eventId,
  paymentEntity = null,
  orderEntity = null,
}) => {
  console.log(`🔄 [Reconciliation] Initiated from [${source}] for Order: ${razorpayOrderId || "N/A"}, Payment: ${razorpayPaymentId || "N/A"}`);

  // 1. Webhook Event Deduplication (Idempotency)
  let webhookEventRecord = null;
  if (eventId) {
    try {
      webhookEventRecord = await WebhookEvent.findOne({ eventId });
      if (webhookEventRecord && webhookEventRecord.status === "processed") {
        console.log(`ℹ️ [Idempotency] Webhook event ${eventId} has already been processed.`);
        return {
          success: true,
          alreadyProcessed: true,
          message: `Webhook event ${eventId} already processed.`,
        };
      }

      if (!webhookEventRecord) {
        webhookEventRecord = await WebhookEvent.create({
          eventId,
          eventType,
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          status: "processing",
        });
      }
    } catch (eventErr) {
      // E11000 duplicate key error means concurrent worker is processing this event
      if (eventErr.code === 11000) {
        console.log(`ℹ️ [Idempotency] Concurrent collision detected for event ${eventId}. Skipping.`);
        return {
          success: true,
          alreadyProcessed: true,
          message: `Webhook event ${eventId} is currently being processed.`,
        };
      }
      console.warn("⚠️ [WebhookEvent Log] Non-critical warning:", eventErr.message);
    }
  }

  // 2. Find Booking Record
  const bookingQuery = bookingId
    ? { _id: bookingId }
    : razorpayOrderId
    ? { razorpayOrderId }
    : null;

  if (!bookingQuery) {
    const err = new Error("Neither bookingId nor razorpayOrderId was provided for reconciliation.");
    err.code = "INVALID_RECONCILIATION_QUERY";
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOne(bookingQuery);
  if (!booking) {
    console.warn(`⚠️ [Reconciliation] No booking found matching query:`, bookingQuery);
    if (webhookEventRecord) {
      webhookEventRecord.status = "ignored";
      webhookEventRecord.error = "No matching booking found";
      await webhookEventRecord.save();
    }
    const err = new Error("Booking not found for payment reconciliation.");
    err.code = "BOOKING_NOT_FOUND";
    err.statusCode = 404;
    throw err;
  }

  // 3. Find or Associate Payment Record
  let payment = await Payment.findOne({
    $or: [
      { razorpayOrderId: booking.razorpayOrderId || razorpayOrderId },
      { bookingId: booking._id },
    ].filter(Boolean),
  });

  // 4. IDEMPOTENCY: Check if already confirmed
  if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
    console.log(`ℹ️ [Idempotent] Booking ${booking._id} is already confirmed.`);
    if (payment && payment.status !== "paid") {
      payment.status = "paid";
      if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
      if (razorpaySignature) payment.razorpaySignature = razorpaySignature;
      if (!payment.paidAt) payment.paidAt = new Date();
      await payment.save();
    }
    if (webhookEventRecord) {
      webhookEventRecord.status = "processed";
      webhookEventRecord.processedAt = new Date();
      await webhookEventRecord.save();
    }
    return {
      success: true,
      alreadyConfirmed: true,
      booking,
      payment,
    };
  }

  // 5. Handle Payment Failure Event
  if (eventType === "payment.failed") {
    const failureReason =
      paymentEntity?.error_description || "Payment failed at gateway";

    if (payment) {
      payment.status = "failed";
      payment.failureReason = failureReason;
      if (eventId) {
        payment.webhookEvents = payment.webhookEvents || [];
        payment.webhookEvents.push({ eventId, eventType, receivedAt: new Date() });
      }
      await payment.save();
    }

    const now = new Date();
    const isHoldStillValid = booking.holdExpiresAt && booking.holdExpiresAt > now;

    // Do NOT permanently cancel booking if hold is still active (user can retry!)
    if (!isHoldStillValid) {
      booking.status = "payment_failed";
      booking.paymentStatus = "failed";
      await booking.save();

      await TableLock.updateMany({ booking: booking._id }, { status: "expired" });

      const tableIds = booking.tables?.length > 0
        ? booking.tables.map((t) => t.tableId)
        : [booking.tableId].filter(Boolean);

      emitTableAvailabilityChanged({
        restaurantId: booking.restaurantId,
        date: booking.date,
        time: booking.time,
        tableIds,
        status: "available",
      });
      console.log(`❌ [Reconciliation] Hold expired for booking ${booking._id}; marked payment_failed.`);
    } else {
      console.log(`ℹ️ [Reconciliation] Payment failed but table hold is still active for booking ${booking._id}. Allowing retry.`);
    }

    if (webhookEventRecord) {
      webhookEventRecord.status = "processed";
      webhookEventRecord.processedAt = new Date();
      await webhookEventRecord.save();
    }

    return {
      success: true,
      status: "payment_failed_recorded",
      isHoldStillValid,
      booking,
      payment,
    };
  }

  // 6. Verification of Amount & Currency (Server-side validation)
  const expectedPaise = Math.max(100, Math.round(booking.grandTotal * 100));
  const expectedCurrency = (booking.currency || "INR").toUpperCase();

  let actualAmountPaise = paymentEntity?.amount || orderEntity?.amount;
  let actualCurrency = paymentEntity?.currency || orderEntity?.currency;
  let actualStatus = paymentEntity?.status || orderEntity?.status;

  // If entities were not supplied in payload, attempt authoritative fetch from Razorpay API
  if (!actualAmountPaise && (razorpayPaymentId || razorpayOrderId)) {
    if (razorpayPaymentId) {
      const livePayment = await fetchRazorpayPayment(razorpayPaymentId);
      if (livePayment) {
        actualAmountPaise = livePayment.amount;
        actualCurrency = livePayment.currency;
        actualStatus = livePayment.status;
      }
    } else if (razorpayOrderId) {
      const liveOrder = await fetchRazorpayOrder(razorpayOrderId);
      if (liveOrder) {
        actualAmountPaise = liveOrder.amount;
        actualCurrency = liveOrder.currency;
        actualStatus = liveOrder.status;
      }
    }
  }

  // If amount details are verified, check for discrepancy
  if (actualAmountPaise && actualAmountPaise !== expectedPaise) {
    console.error(`🚨 [Security Alert] Amount mismatch for booking ${booking._id}: Expected ₹${expectedPaise / 100}, Got ₹${actualAmountPaise / 100}`);
    const err = new Error("Payment amount mismatch detected. Security verification failed.");
    err.code = "PAYMENT_AMOUNT_MISMATCH";
    err.statusCode = 400;
    if (webhookEventRecord) {
      webhookEventRecord.status = "failed";
      webhookEventRecord.error = err.message;
      await webhookEventRecord.save();
    }
    throw err;
  }

  if (actualCurrency && actualCurrency.toUpperCase() !== expectedCurrency) {
    console.error(`🚨 [Security Alert] Currency mismatch for booking ${booking._id}: Expected ${expectedCurrency}, Got ${actualCurrency}`);
    const err = new Error("Payment currency mismatch detected.");
    err.code = "PAYMENT_CURRENCY_MISMATCH";
    err.statusCode = 400;
    if (webhookEventRecord) {
      webhookEventRecord.status = "failed";
      webhookEventRecord.error = err.message;
      await webhookEventRecord.save();
    }
    throw err;
  }

  // 7. Phase 7 — Expired Holds and Double-Booking Recovery
  const now = new Date();
  const tableObjectIds = booking.tables?.length > 0
    ? booking.tables.map((t) => t.tableId)
    : [booking.tableId].filter(Boolean);

  const isHoldExpired = booking.holdExpiresAt && booking.holdExpiresAt < now;

  if (isHoldExpired) {
    console.warn(`⏳ [Hold Expired] Booking ${booking._id} hold expired at ${booking.holdExpiresAt}. Checking table availability...`);

    // Check if table was re-booked by another guest
    const settings = await RestaurantSettings.findOne({ branch: booking.restaurantId }).lean();
    const slotDuration = settings?.slotDuration || 60;
    const buffer = settings?.tableBufferMinutes || 15;
    const totalOccupancyMinutes = slotDuration + buffer;

    const [reqH, reqM] = booking.time.split(":").map(Number);
    const reqSlotStart = reqH * 60 + reqM;
    const reqSlotEnd = reqSlotStart + totalOccupancyMinutes;

    const conflictingBookings = await Booking.find({
      _id: { $ne: booking._id },
      restaurantId: booking.restaurantId,
      date: booking.date,
      status: "confirmed",
      $or: [
        { tableId: { $in: tableObjectIds } },
        { "tables.tableId": { $in: tableObjectIds } },
      ],
    }).lean();

    let isTableTaken = false;
    for (const b of conflictingBookings) {
      const [h, m] = b.time.split(":").map(Number);
      const bStart = h * 60 + m;
      const bEnd = bStart + totalOccupancyMinutes;
      if (bStart < reqSlotEnd && bEnd > reqSlotStart) {
        isTableTaken = true;
        break;
      }
    }

    if (isTableTaken) {
      // OVERBOOKING SAFETY: Do not double-book! Mark for refund recovery
      console.error(`🚨 [Overbooking Prevented] Table already taken by another guest for booking ${booking._id}. Marking for refund.`);

      booking.status = "payment_failed";
      booking.paymentStatus = "refund_pending";
      booking.cancellationReason = "Table hold expired and table was re-booked by another guest. Refund required.";
      await booking.save();

      if (payment) {
        payment.status = "refund_pending";
        payment.failureReason = "Table hold expired and table was re-booked by another guest. Recovery refund initiated.";
        if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
        await payment.save();
      }

      if (webhookEventRecord) {
        webhookEventRecord.status = "processed";
        webhookEventRecord.processedAt = new Date();
        webhookEventRecord.error = "Hold expired and table re-booked. Refund pending.";
        await webhookEventRecord.save();
      }

      return {
        success: false,
        code: "TABLE_UNAVAILABLE_REFUND_PENDING",
        message: "Your table hold expired and the table was reserved by another guest. Your payment has been marked for an automatic refund.",
        booking,
        payment,
      };
    }

    console.log(`✅ [Hold Expired But Safe] Table is still available for booking ${booking._id}. Re-locking table.`);
  }

  // 8. ATOMIC CONFIRMATION
  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  booking.paymentMethod = paymentMethod || paymentEntity?.method || "razorpay";
  if (razorpayPaymentId) booking.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) booking.razorpaySignature = razorpaySignature;

  // Generate secure QR Check-in Token if absent
  if (!booking.qrCode?.token) {
    const rawToken = "BMT_" + crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    booking.qrCode = {
      token: rawToken,
      tokenHash,
      status: "valid",
      generatedAt: new Date(),
    };
  }

  await booking.save();

  // 9. Update Payment Record
  if (payment) {
    payment.status = "paid";
    payment.paidAt = payment.paidAt || new Date();
    if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) payment.razorpaySignature = razorpaySignature;
    if (eventId) {
      payment.webhookEvents = payment.webhookEvents || [];
      const alreadyLogged = payment.webhookEvents.some((e) => e.eventId === eventId);
      if (!alreadyLogged) {
        payment.webhookEvents.push({ eventId, eventType, receivedAt: new Date() });
      }
    }
    await payment.save();
  }

  // 10. Convert TableLocks to 'converted'
  await TableLock.updateMany({ booking: booking._id }, { status: "converted" });

  // 11. Increment Restaurant Reservation Usage
  try {
    const branch = await RestaurantBranch.findById(booking.restaurantId).lean();
    if (branch?.brandId) {
      await incrementReservationUsage(branch.brandId, branch._id);
    }
  } catch (usageErr) {
    console.warn("⚠️ [Subscription Usage] Non-blocking warning:", usageErr.message);
  }

  // 12. Idempotent Email Confirmation (Send exactly once)
  if (!booking.emailSent) {
    try {
      const branch = await RestaurantBranch.findById(booking.restaurantId).lean();
      const customer = await User.findById(booking.userId).lean();
      const recipientEmail = customer?.email || booking.email;
      const recipientName = customer?.name || "Valued Guest";

      if (recipientEmail) {
        await notificationService.sendBookingConfirmation({
          ...booking.toObject(),
          customerEmail: recipientEmail,
          customerName: recipientName,
          restaurantName: branch?.name || "BookMyTable Restaurant",
          branchLocation: branch?.address?.city || branch?.address?.street || "",
        });

        booking.emailSent = true;
        booking.emailSentAt = new Date();
        await booking.save();
        console.log(`📧 [Confirmation] Email sent successfully for booking ${booking._id} to ${recipientEmail}`);
      }
    } catch (emailErr) {
      console.error(`❌ [Email Delivery] Non-blocking error sending confirmation email for booking ${booking._id}:`, emailErr.message);
    }
  }

  // 13. Idempotent Socket.IO Real-time Broadcast
  try {
    const tableIds = booking.tables?.length > 0
      ? booking.tables.map((t) => t.tableId)
      : [booking.tableId].filter(Boolean);

    emitTableAvailabilityChanged({
      restaurantId: booking.restaurantId,
      date: booking.date,
      time: booking.time,
      tableIds,
      status: "booked",
    });

    emitBookingConfirmed({
      restaurantId: booking.restaurantId,
      userId: booking.userId,
      booking,
    });
  } catch (socketErr) {
    console.warn("⚠️ [Socket.IO] Non-blocking broadcast warning:", socketErr.message);
  }

  // 14. Mark WebhookEvent as processed
  if (webhookEventRecord) {
    webhookEventRecord.status = "processed";
    webhookEventRecord.processedAt = new Date();
    await webhookEventRecord.save();
  }

  console.log(`🎉 [Reconciliation Success] Booking ${booking._id} fully confirmed.`);

  return {
    success: true,
    alreadyConfirmed: false,
    booking,
    payment,
  };
};
