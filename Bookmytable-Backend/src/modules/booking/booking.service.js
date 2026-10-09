import mongoose from "mongoose";
import axios from "axios";
import Booking from "../../models/booking.model.js";
import Payment from "../../models/payment.model.js";
import TableLock from "../../models/tableLock.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import Table from "../../models/table.model.js";
import User from "../../models/user.model.js";
import DiscoveryRestaurant from "../../models/discovery.model.js";
import { env } from "../../config/env.js";
import {
  emitTableAvailabilityChanged,
  emitBookingConfirmed,
  emitBookingCancelled,
  emitBookingCreated,
} from "../../config/socket.js";
import { notificationService } from "../notification/notification.service.js";
import { checkReservationLimits, incrementReservationUsage } from "../subscriptions/subscription.service.js";

/**
 * Check phone verification across all schema locations
 */
export const isUserPhoneVerified = (user) => {
  if (!user) return false;
  return (
    user.isPhoneVerified === true ||
    user.phone?.isVerified === true ||
    user.verification?.phoneVerified === true
  );
};

/**
 * Helper: Create Razorpay Order via REST API / SDK credentials
 */
const createRazorpayOrderDirect = async ({ amountInPaise, currency = "INR", receipt, notes = {} }) => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured on the server.");
  }

  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await axios.post(
    "https://api.razorpay.com/v1/orders",
    {
      amount: amountInPaise,
      currency,
      receipt: receipt.slice(0, 40), // Razorpay receipt max 40 chars
      notes,
    },
    {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  return response.data;
};

/**
 * 1. INITIATE BOOKING HOLD & CREATE PAYMENT-PENDING RESERVATION
 * 
 * Flow:
 * - Authenticate user & verify phone
 * - Validate restaurant, tables, capacity, and slot
 * - Calculate authoritative amount on backend
 * - ATOMICALLY verify table availability & create temporary HOLD
 * - Create Razorpay order
 * - Create Payment record
 * - Emit real-time table availability changed
 */
export const initiateBookingHold = async (userId, data) => {
  let { restaurantId, tableId, tables, slot, date, guests, specialRequests, cartItems, paymentMethod = "upi" } = data;
  const time = slot || data.time;

  // 1. Authoritative User & Phone Verification Check
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error("User not found or unauthenticated.");
    err.code = "AUTHENTICATION_REQUIRED";
    err.statusCode = 401;
    throw err;
  }

  if (!isUserPhoneVerified(user)) {
    const err = new Error("Please verify your phone number before making a table reservation.");
    err.code = "PHONE_VERIFICATION_REQUIRED";
    err.statusCode = 403;
    throw err;
  }

  // 2. Validate Parameters
  const selectedTables =
    tables && tables.length > 0
      ? tables
      : tableId
      ? [{ tableId, tableType: data.tableType, tableName: data.tableName }]
      : [];

  if (selectedTables.length === 0 || !time || !date || !guests) {
    const err = new Error("Missing required booking details (tables, time, date, guests)");
    err.statusCode = 400;
    throw err;
  }

  // 3. Load Branch & Settings (Supports Branch _id, DiscoveryRestaurant _id, or slug)
  let branch = null;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(restaurantId));

  if (isObjectId) {
    branch = await RestaurantBranch.findOne({
      _id: restaurantId,
      isActive: { $ne: false },
      isDeleted: { $ne: true },
    }).lean();

    if (!branch) {
      // Check if restaurantId is a DiscoveryRestaurant _id
      const discovery = await DiscoveryRestaurant.findById(restaurantId).lean();
      if (discovery?.restaurantId) {
        branch = await RestaurantBranch.findOne({
          _id: discovery.restaurantId,
          isActive: { $ne: false },
          isDeleted: { $ne: true },
        }).lean();
      }
    }
  }

  if (!branch) {
    // Try resolving by slug
    branch = await RestaurantBranch.findOne({
      slug: String(restaurantId),
      isActive: { $ne: false },
      isDeleted: { $ne: true },
    }).lean();

    if (!branch) {
      const discovery = await DiscoveryRestaurant.findOne({ slug: String(restaurantId) }).lean();
      if (discovery?.restaurantId) {
        branch = await RestaurantBranch.findOne({
          _id: discovery.restaurantId,
          isActive: { $ne: false },
          isDeleted: { $ne: true },
        }).lean();
      }
    }
  }

  if (!branch) {
    const err = new Error("Restaurant branch not found or inactive");
    err.statusCode = 404;
    throw err;
  }

  // Canonical branch ID
  restaurantId = branch._id;

  const settings = await RestaurantSettings.findOne({ branch: restaurantId }).lean();
  const slotDuration = settings?.slotDuration || 60;
  const buffer = settings?.tableBufferMinutes || 15;
  const totalOccupancyMinutes = slotDuration + buffer;

  const [reqH, reqM] = time.split(":").map(Number);
  const reqSlotStart = reqH * 60 + reqM;
  const reqSlotEnd = reqSlotStart + totalOccupancyMinutes;

  // Check subscription limits before proceeding
  try {
    await checkReservationLimits(branch.brandId, restaurantId);
  } catch (err) {
    if (err.message && err.message.includes("limit exceeded")) {
      err.code = "PLAN_LIMIT_EXCEEDED";
      err.statusCode = 403;
      throw err;
    }
  }

  // 4. Validate Table Records & Backend Authoritative Pricing
  const verifiedTables = [];
  let totalCapacity = 0;
  const tableObjectIds = [];

  for (const t of selectedTables) {
    const tid = t.tableId || t.id || t._id;
    const tableRecord = await Table.findOne({ _id: tid, branch: restaurantId, isActive: true }).lean();
    if (!tableRecord) {
      const err = new Error(`Selected table ${t.tableName || tid} not found in restaurant`);
      err.statusCode = 400;
      throw err;
    }

    totalCapacity += tableRecord.capacity;
    tableObjectIds.push(tableRecord._id);

    verifiedTables.push({
      tableId: tableRecord._id,
      tableName: tableRecord.tableCode || tableRecord.name,
      tableType: tableRecord.type || "indoor_dining",
      tablePrice: tableRecord.resolvedPrice || tableRecord.price || 0,
      sectionLabel: tableRecord.sectionLabel || "Main Area",
      floorLabel: tableRecord.floorLabel || "Main Floor",
    });
  }

  if (totalCapacity < Number(guests)) {
    const err = new Error(`Total selected table capacity (${totalCapacity}) is too small for party size (${guests})`);
    err.statusCode = 400;
    throw err;
  }

  // Backend authoritative financial calculations (Paise math)
  const tablePriceTotal = verifiedTables.reduce((sum, t) => sum + (t.tablePrice || 0), 0);
  const foodTotal = (cartItems || []).reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const tax = Math.round((foodTotal + tablePriceTotal) * 0.05 * 100) / 100;
  const grandTotal = Math.round((foodTotal + tablePriceTotal + tax) * 100) / 100;
  // Razorpay requires amount in paise. Minimum Razorpay payment is ₹1 (100 paise) if paying online.
  const amountInPaise = Math.max(100, Math.round(grandTotal * 100));

  const holdDurationMinutes = env.BOOKING_HOLD_DURATION_MINUTES || 10;
  const holdExpiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

  // 5. ATOMIC DOUBLE-BOOKING PREVENTION & HOLD CREATION
  let createdBooking;
  let session = null;

  try {
    // Attempt to use MongoDB session for atomic transaction
    session = await mongoose.startSession();
  } catch (e) {
    session = null;
  }

  const executeAtomicHold = async (sess) => {
    const now = new Date();

    // Serialize check by updating/touching table documents
    for (const tId of tableObjectIds) {
      const lockRes = await Table.findOneAndUpdate(
        { _id: tId, branch: restaurantId, isActive: true },
        { $inc: { __v: 1 } },
        sess ? { session: sess } : {}
      );
      if (!lockRes) {
        const err = new Error("Selected table is unavailable");
        err.code = "TABLE_UNAVAILABLE";
        err.statusCode = 409;
        throw err;
      }
    }

    // Check for conflicting confirmed bookings or active holds
    const conflictQuery = {
      restaurantId,
      date,
      $or: [
        { status: "confirmed" },
        { 
          status: { $in: ["payment_pending", "pending"] }, 
          holdExpiresAt: { $gt: now } 
        }
      ],
      $and: [
        {
          $or: [
            { tableId: { $in: tableObjectIds } },
            { "tables.tableId": { $in: tableObjectIds } }
          ]
        }
      ]
    };

    const conflictingBookings = await Booking.find(
      conflictQuery,
      null,
      sess ? { session: sess } : {}
    ).lean();

    for (const b of conflictingBookings) {
      const [h, m] = b.time.split(":").map(Number);
      const bStart = h * 60 + m;
      const bEnd = bStart + totalOccupancyMinutes;

      if (bStart < reqSlotEnd && bEnd > reqSlotStart) {
        const err = new Error("This table is no longer available for the selected time.");
        err.code = "TABLE_UNAVAILABLE";
        err.statusCode = 409;
        throw err;
      }
    }

    // No conflict: Create Booking with status PAYMENT_PENDING
    const bookingDoc = new Booking({
      userId,
      restaurantId,
      tables: verifiedTables,
      tableId: verifiedTables[0]?.tableId,
      tableType: verifiedTables[0]?.tableType,
      tableName: verifiedTables[0]?.tableName,
      date,
      time,
      guests: Number(guests),
      specialRequests: specialRequests || "",
      status: "payment_pending",
      tablePrice: tablePriceTotal,
      foodTotal,
      tax,
      grandTotal,
      currency: "INR",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "upi",
      holdExpiresAt,
      emailSent: false,
    });

    if (sess) {
      await bookingDoc.save({ session: sess });
    } else {
      await bookingDoc.save();
    }

    // Create TableLock entries
    const lockPromises = verifiedTables.map((t) => {
      const lockDoc = new TableLock({
        table: t.tableId,
        restaurant: restaurantId,
        user: userId,
        booking: bookingDoc._id,
        reservation: bookingDoc._id,
        startAt: new Date(`${date}T${time}:00`),
        endAt: new Date(new Date(`${date}T${time}:00`).getTime() + totalOccupancyMinutes * 60000),
        status: "active",
        expiresAt: holdExpiresAt,
      });
      return sess ? lockDoc.save({ session: sess }) : lockDoc.save();
    });

    await Promise.all(lockPromises);
    return bookingDoc;
  };

  try {
    if (session) {
      await session.withTransaction(async () => {
        createdBooking = await executeAtomicHold(session);
      });
    } else {
      createdBooking = await executeAtomicHold(null);
    }
  } catch (err) {
    if (session) {
      try { await session.endSession(); } catch (e) {}
    }
    throw err;
  } finally {
    if (session) {
      try { await session.endSession(); } catch (e) {}
    }
  }

  // 6. Create Razorpay Order
  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrderDirect({
      amountInPaise,
      currency: "INR",
      receipt: `bmt_${createdBooking._id.toString().slice(-8)}_${Date.now()}`.slice(0, 40),
      notes: {
        userId: userId.toString(),
        bookingId: createdBooking._id.toString(),
        restaurantId: restaurantId.toString(),
      },
    });
  } catch (orderErr) {
    console.error("❌ Razorpay order creation failed:", orderErr.response?.data || orderErr.message);
    // Rollback the hold since payment order couldn't be initialized
    await Booking.findByIdAndUpdate(createdBooking._id, { status: "expired" });
    await TableLock.updateMany({ booking: createdBooking._id }, { status: "expired" });
    const err = new Error(orderErr.response?.data?.error?.description || "Failed to initialize payment gateway order.");
    err.statusCode = 500;
    throw err;
  }

  // 7. Persist Payment Record & Link Order to Booking
  const paymentRecord = await Payment.create({
    bookingId: createdBooking._id,
    userId,
    restaurantId,
    amount: grandTotal,
    amountInPaise,
    currency: "INR",
    provider: "razorpay",
    razorpayOrderId: rzpOrder.id,
    status: "created",
    metadata: {
      date,
      time,
      guests,
    },
  });

  createdBooking.razorpayOrderId = rzpOrder.id;
  createdBooking.paymentId = paymentRecord._id;
  await createdBooking.save();

  // 8. Emit Real-Time Socket Event
  emitTableAvailabilityChanged({
    restaurantId,
    date,
    time,
    tableIds: verifiedTables.map(t => t.tableId),
    status: "held",
  });

  emitBookingCreated({
    restaurantId,
    userId,
    booking: createdBooking,
  });

  return {
    bookingId: createdBooking._id,
    orderId: rzpOrder.id,
    amount: rzpOrder.amount, // in paise
    amountDisplay: grandTotal, // in INR
    currency: rzpOrder.currency || "INR",
    keyId: env.RAZORPAY_KEY_ID,
    holdExpiresAt,
  };
};

/**
 * 2. RELEASE BOOKING HOLD (When user closes checkout or cancels before payment)
 */
export const releaseBookingHold = async (bookingId, userId) => {
  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    return { success: false, message: "Booking not found" };
  }

  if (booking.status === "payment_pending") {
    booking.status = "expired";
    booking.holdExpiresAt = new Date();
    await booking.save();

    await TableLock.updateMany({ booking: booking._id, status: "active" }, { status: "expired" });

    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, {
        status: "failed",
        failureReason: "Checkout abandoned / hold released by user",
      });
    }

    const tableIds = booking.tables?.length > 0 ? booking.tables.map(t => t.tableId) : [booking.tableId];

    emitTableAvailabilityChanged({
      restaurantId: booking.restaurantId,
      date: booking.date,
      time: booking.time,
      tableIds,
      status: "available",
    });

    console.log(`🔓 Hold released for booking ${bookingId}`);
    return { success: true, message: "Hold released successfully" };
  }

  return { success: false, message: `Cannot release booking with status ${booking.status}` };
};

/**
 * 3. CONFIRM BOOKING AFTER PAYMENT VERIFICATION (Idempotent)
 */
export const confirmBookingPayment = async ({
  bookingId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paymentMethod = "razorpay",
}) => {
  const query = bookingId
    ? { _id: bookingId }
    : { razorpayOrderId };

  const booking = await Booking.findOne(query);
  if (!booking) {
    const err = new Error("Booking not found for payment confirmation.");
    err.code = "BOOKING_NOT_FOUND";
    err.statusCode = 404;
    throw err;
  }

  // IDEMPOTENCY CHECK: If already confirmed, safely return without duplicating actions
  if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
    console.log(`ℹ️ [Idempotent] Booking ${booking._id} is already confirmed.`);
    return {
      success: true,
      alreadyConfirmed: true,
      booking,
    };
  }

  // Ensure hold hasn't expired
  const now = new Date();
  if (booking.holdExpiresAt && booking.holdExpiresAt < now && booking.status !== "confirmed") {
    // If webhook captured payment just after expiry window, allow confirmation to avoid customer money loss
    console.warn(`⚠️ Confirming payment for booking ${booking._id} where hold expired, capturing safely.`);
  }

  // Update Booking
  booking.status = "confirmed";
  booking.paymentStatus = "paid";
  booking.paymentMethod = paymentMethod;
  if (razorpayPaymentId) booking.razorpayPaymentId = razorpayPaymentId;
  if (razorpaySignature) booking.razorpaySignature = razorpaySignature;
  await booking.save();

  // Update Payment record
  await Payment.findOneAndUpdate(
    { razorpayOrderId: booking.razorpayOrderId || razorpayOrderId },
    {
      status: "paid",
      paidAt: new Date(),
      razorpayPaymentId,
      razorpaySignature,
    }
  );

  // Convert TableLock to converted
  await TableLock.updateMany({ booking: booking._id }, { status: "converted" });

  // Fetch restaurant and user details for email confirmation
  const branch = await RestaurantBranch.findById(booking.restaurantId).lean();
  const customer = await User.findById(booking.userId).lean();

  // Increment reservation usage for restaurant plan
  if (branch) {
    try {
      await incrementReservationUsage(branch.brandId, branch._id);
    } catch (e) {
      console.error("Failed to increment usage", e.message);
    }
  }

  // IDEMPOTENT EMAIL CONFIRMATION: Send confirmation email exactly once
  if (!booking.emailSent && (customer?.email || booking.email)) {
    const recipientEmail = customer?.email || booking.email;
    const recipientName = customer?.name || "Valued Guest";

    try {
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
      console.log(`📧 [Confirmation] Email sent for booking ${booking._id} to ${recipientEmail}`);
    } catch (emailErr) {
      // Failure to send email must NOT cancel or roll back a paid booking!
      console.error(`❌ [Email Error] Non-blocking email delivery failure for booking ${booking._id}:`, emailErr.message);
    }
  }

  // Emit Real-Time Socket Updates
  const tableIds = booking.tables?.length > 0 ? booking.tables.map(t => t.tableId) : [booking.tableId];

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

  return {
    success: true,
    booking,
  };
};

/**
 * 4. GET ALL BOOKINGS FOR CURRENT USER
 */
export const getUserBookingsService = async (userId) => {
  return Booking.find({ userId })
    .populate({
      path: "restaurantId",
      select: "name slug images address cuisine contactPhone operatingHours",
    })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * 5. GET SINGLE BOOKING BY ID WITH OWNERSHIP CHECK
 */
export const getBookingByIdService = async (bookingId, userId, userRoles = []) => {
  const booking = await Booking.findById(bookingId)
    .populate({
      path: "restaurantId",
      select: "name slug images address cuisine contactPhone",
    })
    .populate({
      path: "userId",
      select: "name email phone",
    })
    .lean();

  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = String(booking.userId?._id || booking.userId) === String(userId);
  const isAdminOrStaff = userRoles.some(r => ["admin", "super_admin", "SUPER_ADMIN", "staff"].includes(r));

  if (!isOwner && !isAdminOrStaff) {
    const err = new Error("You are not authorized to view this booking");
    err.code = "BOOKING_ACCESS_DENIED";
    err.statusCode = 403;
    throw err;
  }

  return booking;
};

/**
 * 6. CANCEL BOOKING WITH RESTAURANT POLICY CHECK
 */
export const cancelBookingService = async (bookingId, userId, reason = "") => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  if (String(booking.userId) !== String(userId)) {
    const err = new Error("You are not authorized to cancel this booking");
    err.statusCode = 403;
    throw err;
  }

  if (booking.status === "cancelled") {
    return { success: true, message: "Booking is already cancelled", booking };
  }

  // Check Cancellation Policy from restaurant settings
  const settings = await RestaurantSettings.findOne({ branch: booking.restaurantId }).lean();
  const allowedBeforeMinutes = settings?.cancellationAllowedBeforeMinutes || 60;

  const [h, m] = booking.time.split(":").map(Number);
  const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
  const now = new Date();
  const diffMinutes = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60);

  if (diffMinutes < allowedBeforeMinutes && diffMinutes > 0) {
    const err = new Error(`Cancellation is only permitted up to ${allowedBeforeMinutes} minutes before your reservation.`);
    err.statusCode = 400;
    throw err;
  }

  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason || "Cancelled by customer";
  await booking.save();

  // Release table lock
  await TableLock.updateMany({ booking: booking._id }, { status: "expired" });

  // Emit Real-Time Availability Change
  const tableIds = booking.tables?.length > 0 ? booking.tables.map(t => t.tableId) : [booking.tableId];

  emitTableAvailabilityChanged({
    restaurantId: booking.restaurantId,
    date: booking.date,
    time: booking.time,
    tableIds,
    status: "available",
  });

  emitBookingCancelled({
    restaurantId: booking.restaurantId,
    userId: booking.userId,
    bookingId: booking._id,
    tableIds,
    date: booking.date,
    time: booking.time,
  });

  return {
    success: true,
    message: "Booking cancelled successfully",
    booking,
  };
};

/**
 * 7. GET RESTAURANT BOOKINGS FOR STAFF / OWNER DASHBOARD
 */
export const getRestaurantBookingsService = async (restaurantId, query = {}) => {
  const filter = { restaurantId };
  if (query.date) filter.date = query.date;
  if (query.status) filter.status = query.status;

  return Booking.find(filter)
    .populate({
      path: "userId",
      select: "name email phone",
    })
    .sort({ date: 1, time: 1 })
    .lean();
};

/**
 * 8. UPDATE BOOKING STATUS (Staff/Admin)
 */
export const updateBookingStatusService = async (bookingId, status) => {
  const validStatuses = ["confirmed", "completed", "cancelled", "no_show"];
  if (!validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  booking.status = status;
  await booking.save();

  if (status === "cancelled" || status === "completed") {
    await TableLock.updateMany({ booking: booking._id }, { status: "expired" });
  }

  return booking;
};

/**
 * 9. LEGACY RESERVATION ADAPTER (Backwards compatibility for existing createReservation callers)
 */
export const createReservation = async (userId, data) => {
  const result = await initiateBookingHold(userId, data);
  // Auto-confirm if pay_at_restaurant is requested or price is 0
  if (data.paymentMethod === "pay_at_restaurant" || result.amountDisplay === 0) {
    const confirmResult = await confirmBookingPayment({
      bookingId: result.bookingId,
      paymentMethod: data.paymentMethod || "pay_at_restaurant",
    });
    return confirmResult.booking;
  }
  return Booking.findById(result.bookingId);
};
