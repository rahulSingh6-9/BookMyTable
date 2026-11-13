import { reconcilePayment } from "../payments/payment.service.js";
import mongoose from "mongoose";
import axios from "axios";
import crypto from "crypto";
import Booking from "../../models/booking.model.js";
import Payment from "../../models/payment.model.js";
import TableLock from "../../models/tableLock.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import Table from "../../models/table.model.js";
import User from "../../models/user.model.js";
import DiscoveryRestaurant from "../../models/discovery.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import { env } from "../../config/env.js";
import {
  emitTableAvailabilityChanged,
  emitBookingConfirmed,
  emitBookingCancelled,
  emitBookingCreated,
} from "../../config/socket.js";
import { notificationService } from "../notification/notification.service.js";
import { checkReservationLimits, incrementReservationUsage } from "../subscriptions/subscription.service.js";
import { hasPermission } from "../../utils/rbac/hasPermission.js";

const PLATFORM_ADMIN_ROLES = ["admin", "super_admin", "SUPER_ADMIN", "PLATFORM_ADMIN"];

const assertBranchBookingAccess = async ({
  userId,
  globalRoles = [],
  restaurantId,
  headerBranchId,
  mode = "view",
}) => {
  if (!userId) {
    const err = new Error("Authentication required");
    err.statusCode = 401;
    err.code = "AUTHENTICATION_REQUIRED";
    throw err;
  }

  if (!restaurantId || !mongoose.Types.ObjectId.isValid(String(restaurantId))) {
    const err = new Error("Invalid restaurant or branch identifier.");
    err.statusCode = 400;
    err.code = "INVALID_BRANCH_ID";
    throw err;
  }

  const requestedId = String(restaurantId);
  if (headerBranchId && String(headerBranchId) !== requestedId) {
    const err = new Error(
      "Branch mismatch: you can only access reservations for the currently selected branch."
    );
    err.statusCode = 403;
    err.code = "BRANCH_MISMATCH";
    throw err;
  }

  const isGlobalAdmin = globalRoles.some((r) => PLATFORM_ADMIN_ROLES.includes(r));
  if (isGlobalAdmin) return { isGlobalAdmin: true, membership: null };

  const membership = await BranchMembership.findOne({
    user: userId,
    branch: restaurantId,
    status: "active",
  });

  if (!membership) {
    const err = new Error("Access Denied: No active membership for this branch.");
    err.statusCode = 403;
    err.code = "NO_BRANCH_MEMBERSHIP";
    throw err;
  }

  const canView =
    hasPermission(membership, "MANAGE_BOOKINGS") ||
    hasPermission(membership, "VIEW_BOOKINGS") ||
    hasPermission(membership, "MANAGE_RESERVATIONS");

  const canManage =
    hasPermission(membership, "MANAGE_BOOKINGS") ||
    hasPermission(membership, "MANAGE_RESERVATIONS");

  if (mode === "manage" ? !canManage : !canView) {
    const err = new Error("Access Denied: Insufficient permissions to access reservations.");
    err.statusCode = 403;
    err.code = "INSUFFICIENT_PERMISSIONS";
    throw err;
  }

  return { isGlobalAdmin: false, membership };
};

const serializeStaffBooking = (booking) => {
  const rawUser = booking.userId && typeof booking.userId === "object" ? booking.userId : null;
  const user = rawUser
    ? {
        _id: rawUser._id,
        name: rawUser.name || null,
        email: rawUser.email || null,
        phone: rawUser.phone?.e164 || (typeof rawUser.phone === "string" ? rawUser.phone : null),
      }
    : null;

  return {
    _id: booking._id,
    restaurantId: booking.restaurantId?._id || booking.restaurantId,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    specialRequests: booking.specialRequests || "",
    tableId: booking.tableId,
    tableName: booking.tableName,
    tables: booking.tables || [],
    sectionLabel: booking.sectionLabel,
    floorLabel: booking.floorLabel,
    grandTotal: booking.grandTotal,
    currency: booking.currency,
    cancellationReason: booking.cancellationReason || "",
    createdAt: booking.createdAt,
    userId: user,
    user,
  };
};

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
export const confirmBookingPayment = async (params) => {
  return reconcilePayment({
    ...params,
    source: "booking_service",
  });
};

/**
 * 4. GET ALL BOOKINGS FOR CURRENT USER
 */
export const getUserBookingsService = async (userId) => {
  return Booking.find({ userId })
    .populate({
      path: "restaurantId",
      model: "RestaurantBranch",
      select: "branchName slug images address cuisines contactPhone openingHours",
    })
    .populate({
      path: "review",
      select: "overallRating ratings review status createdAt",
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
      model: "RestaurantBranch",
      select: "branchName slug images address cuisines contactPhone",
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
 * restaurantId is the RestaurantBranch _id stored on Booking.restaurantId.
 */
export const getRestaurantBookingsService = async (restaurantId, query = {}, actor = {}) => {
  await assertBranchBookingAccess({
    userId: actor.userId,
    globalRoles: actor.globalRoles || [],
    restaurantId,
    headerBranchId: actor.headerBranchId,
    mode: "view",
  });

  const filter = { restaurantId };
  if (query.from && query.to) {
    filter.date = { $gte: query.from, $lte: query.to };
  } else if (query.date) {
    filter.date = query.date;
  }
  if (query.status) filter.status = query.status;

  const bookings = await Booking.find(filter)
    .select("-razorpaySignature -razorpayPaymentId -qrCode.token -qrCode.tokenHash")
    .populate({
      path: "userId",
      model: "User",
      select: "name email phone",
    })
    .sort({ date: 1, time: 1 })
    .lean();

  return bookings.map(serializeStaffBooking);
};

/**
 * 8. UPDATE BOOKING STATUS (Staff/Admin)
 */
export const updateBookingStatusService = async (bookingId, status, actor = {}) => {
  const validStatuses = ["confirmed", "checked_in", "completed", "cancelled", "no_show"];
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

  await assertBranchBookingAccess({
    userId: actor.userId,
    globalRoles: actor.globalRoles || [],
    restaurantId: booking.restaurantId,
    headerBranchId: actor.headerBranchId,
    mode: "manage",
  });

  const previousStatus = booking.status;
  booking.status = status;
  if (status === "cancelled") {
    booking.cancelledAt = new Date();
    if (!booking.cancellationReason) {
      booking.cancellationReason = "Cancelled by restaurant";
    }
  }
  await booking.save();

  const tableIds =
    booking.tables?.length > 0
      ? booking.tables.map((t) => t.tableId)
      : [booking.tableId].filter(Boolean);

  if (status === "cancelled" || status === "completed" || status === "no_show") {
    await TableLock.updateMany({ booking: booking._id }, { status: "expired" });
    emitTableAvailabilityChanged({
      restaurantId: booking.restaurantId,
      date: booking.date,
      time: booking.time,
      tableIds,
      status: "available",
    });
  }

  if (status === "cancelled") {
    emitBookingCancelled({
      restaurantId: booking.restaurantId,
      userId: booking.userId,
      bookingId: booking._id,
      tableIds,
      date: booking.date,
      time: booking.time,
    });
  } else if (status !== previousStatus) {
    emitBookingConfirmed({
      restaurantId: booking.restaurantId,
      userId: booking.userId,
      booking,
    });
  }

  const populated = await Booking.findById(booking._id)
    .select("-razorpaySignature -razorpayPaymentId -qrCode.token -qrCode.tokenHash")
    .populate({
      path: "userId",
      model: "User",
      select: "name email phone",
    })
    .lean();

  return serializeStaffBooking(populated);
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

/**
 * Helper: Computes the UTC timestamp for a scheduled booking given date (YYYY-MM-DD),
 * time (HH:mm), and restaurant IANA timezone (e.g. "Asia/Kolkata").
 */
export const getScheduledEpoch = (dateStr, timeStr, timeZone = "Asia/Kolkata") => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);

  const tentativeUtc = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = Object.fromEntries(
      formatter.formatToParts(tentativeUtc).map((p) => [p.type, p.value])
    );
    const tzYear = Number(parts.year);
    const tzMonth = Number(parts.month);
    const tzDay = Number(parts.day);
    let tzHour = Number(parts.hour);
    if (tzHour === 24) tzHour = 0;
    const tzMin = Number(parts.minute);

    const tzTimeUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, 0);
    const offsetMs = tzTimeUtc - tentativeUtc.getTime();

    return new Date(tentativeUtc.getTime() - offsetMs);
  } catch (e) {
    console.warn(`Timezone calculation fallback for timezone: ${timeZone}`, e);
    return new Date(`${dateStr}T${timeStr}:00+05:30`);
  }
};

/**
 * Helper: Generates a cryptographically secure random token and SHA-256 hash
 */
export const generateBookingQRTokenData = () => {
  const rawToken = "BMT_" + crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return {
    rawToken,
    tokenHash,
    generatedAt: new Date(),
  };
};

/**
 * 10. GET BOOKING QR DETAILS (Customer)
 * Retrieves or generates secure QR token for a confirmed booking
 */
export const getBookingQRService = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId)
    .populate({
      path: "restaurantId",
      select: "name slug address timezone contactPhone operatingHours images",
    })
    .populate({
      path: "userId",
      select: "name email phone",
    });

  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  // Ownership verification
  const isOwner = String(booking.userId?._id || booking.userId) === String(userId);
  if (!isOwner) {
    const err = new Error("You are not authorized to access this booking's QR code");
    err.statusCode = 403;
    throw err;
  }

  // State eligibility check
  const ineligibleStatuses = ["pending", "payment_pending", "cancelled", "expired", "payment_failed", "no_show"];
  if (ineligibleStatuses.includes(booking.status)) {
    const err = new Error(
      `QR code is not available for bookings with status: ${booking.status}. Only confirmed bookings can generate check-in QR codes.`
    );
    err.statusCode = 400;
    err.code = "INELIGIBLE_STATUS";
    throw err;
  }

  // Ensure QR token exists
  let rawToken = booking.qrCode?.token;
  if (!rawToken || !booking.qrCode?.tokenHash) {
    const tokenData = generateBookingQRTokenData();
    booking.qrCode = {
      token: tokenData.rawToken,
      tokenHash: tokenData.tokenHash,
      status: booking.status === "checked_in" ? "used" : "valid",
      generatedAt: tokenData.generatedAt,
    };
    await booking.save();
    rawToken = tokenData.rawToken;
  }

  // Time window calculations with restaurant timezone
  const restaurant = booking.restaurantId;
  const timeZone = restaurant?.timezone || "Asia/Kolkata";
  const scheduledTime = getScheduledEpoch(booking.date, booking.time, timeZone);
  const checkInOpensAt = new Date(scheduledTime.getTime() - 30 * 60 * 1000); // 30 mins before
  const checkInClosesAt = new Date(scheduledTime.getTime() + 60 * 60 * 1000); // 60 mins after
  const now = new Date();

  let checkInState = "AVAILABLE";
  if (booking.status === "checked_in" || booking.qrCode?.status === "used") {
    checkInState = "CHECKED_IN";
  } else if (booking.status === "cancelled") {
    checkInState = "CANCELLED";
  } else if (now < checkInOpensAt) {
    checkInState = "NOT_STARTED";
  } else if (now > checkInClosesAt) {
    checkInState = "EXPIRED";
  }

  return {
    bookingId: booking._id,
    token: rawToken,
    qrData: rawToken,
    restaurantName: restaurant?.name || "Restaurant",
    restaurantSlug: restaurant?.slug || "",
    branchLocation: restaurant?.address?.city || restaurant?.address?.street || "",
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    tableNames: booking.tables?.length > 0
      ? booking.tables.map(t => `${t.tableName}${t.sectionLabel ? ` (${t.sectionLabel})` : ""}`).join(", ")
      : booking.tableName || "Reserved",
    status: booking.status,
    checkInState,
    checkInOpensAt: checkInOpensAt.toISOString(),
    checkInClosesAt: checkInClosesAt.toISOString(),
    scheduledTime: scheduledTime.toISOString(),
    checkedInAt: booking.qrCode?.checkedInAt,
  };
};

/**
 * 11. VERIFY QR AND CHECK IN BOOKING (Staff / Restaurant Branch)
 * Validates token against SHA-256 hash, enforces staff branch authorization,
 * validates time window, and atomically marks booking checked in.
 */
export const verifyAndCheckInBookingService = async ({ token, staffUserId }) => {
  if (!token || typeof token !== "string") {
    const err = new Error("Invalid QR code token provided.");
    err.statusCode = 400;
    err.code = "INVALID_TOKEN";
    throw err;
  }

  // 1. Authorize staff member and derive authorized branches
  const staffUser = await User.findById(staffUserId).select("name email roles").lean();
  if (!staffUser) {
    const err = new Error("Staff member not found or unauthenticated.");
    err.statusCode = 401;
    err.code = "UNAUTHORIZED_STAFF";
    throw err;
  }

  const globalRoles = staffUser.roles || [];
  const isGlobalAdmin = globalRoles.some((r) =>
    ["admin", "super_admin", "SUPER_ADMIN", "PLATFORM_ADMIN"].includes(r)
  );

  let authorizedBranchIds = [];
  if (!isGlobalAdmin) {
    const memberships = await BranchMembership.find({
      user: staffUserId,
      status: "active",
    }).select("branch role permissions").lean();

    if (!memberships || memberships.length === 0) {
      const err = new Error("Unauthorized: You are not an active staff member of any restaurant branch.");
      err.statusCode = 403;
      err.code = "NO_BRANCH_MEMBERSHIP";
      throw err;
    }

    authorizedBranchIds = memberships.map((m) => String(m.branch));
  }

  // 2. Hash token with SHA-256 for instant indexed lookup
  const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

  // 3. Locate associated booking
  const booking = await Booking.findOne({ "qrCode.tokenHash": tokenHash })
    .populate({
      path: "restaurantId",
      select: "name slug address timezone contactPhone",
    })
    .populate({
      path: "userId",
      select: "name email phone",
    });

  if (!booking) {
    const err = new Error("Invalid QR code. No reservation found matching this code.");
    err.statusCode = 404;
    err.code = "BOOKING_NOT_FOUND";
    throw err;
  }

  // 4. Branch-Level Security: Verify staff belongs to the booking's branch
  const bookingBranchId = String(booking.restaurantId?._id || booking.restaurantId);
  if (!isGlobalAdmin && !authorizedBranchIds.includes(bookingBranchId)) {
    const err = new Error(
      "Branch Mismatch: This reservation belongs to another restaurant or branch and cannot be checked in here."
    );
    err.statusCode = 403;
    err.code = "BRANCH_MISMATCH";
    throw err;
  }

  // 5. Booking Status & Invalidation checks
  if (booking.status === "cancelled") {
    const err = new Error("This booking has been cancelled and cannot be checked in.");
    err.statusCode = 400;
    err.code = "BOOKING_CANCELLED";
    throw err;
  }

  if (booking.status === "no_show") {
    const err = new Error("This booking was marked as No Show and cannot be checked in.");
    err.statusCode = 400;
    err.code = "BOOKING_NO_SHOW";
    throw err;
  }

  if (booking.status === "payment_pending" || booking.paymentStatus === "pending") {
    const err = new Error("Payment is pending for this reservation. Only fully confirmed bookings can check in.");
    err.statusCode = 400;
    err.code = "PAYMENT_PENDING";
    throw err;
  }

  if (booking.status === "payment_failed" || booking.paymentStatus === "failed") {
    const err = new Error("Payment failed for this reservation. Check-in cannot proceed.");
    err.statusCode = 400;
    err.code = "PAYMENT_FAILED";
    throw err;
  }

  // 6. Duplicate Scan Protection (Already Checked In)
  if (booking.status === "checked_in" || booking.qrCode?.status === "used") {
    const err = new Error("Already checked in. This booking has already been verified.");
    err.statusCode = 409;
    err.code = "ALREADY_CHECKED_IN";
    err.data = {
      bookingId: booking._id,
      customerName: booking.userId?.name || "Valued Guest",
      restaurantName: booking.restaurantId?.name,
      checkedInAt: booking.qrCode?.checkedInAt,
    };
    throw err;
  }

  if (booking.status !== "confirmed") {
    const err = new Error(`Booking is not eligible for check-in (current status: ${booking.status}).`);
    err.statusCode = 400;
    err.code = "INELIGIBLE_STATUS";
    throw err;
  }

  // 7. Check-in Time Window and Timezone Handling
  const restaurant = booking.restaurantId;
  const timeZone = restaurant?.timezone || "Asia/Kolkata";
  const scheduledTime = getScheduledEpoch(booking.date, booking.time, timeZone);
  const checkInOpensAt = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
  const checkInClosesAt = new Date(scheduledTime.getTime() + 60 * 60 * 1000);
  const now = new Date();

  // Format local display time for clear messages
  const formatTz = (dt) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(dt);
    } catch (e) {
      return dt.toLocaleTimeString();
    }
  };

  if (now < checkInOpensAt) {
    const err = new Error(
      `Check-in not yet available. Check-in opens 30 minutes before the scheduled time (at ${formatTz(checkInOpensAt)}).`
    );
    err.statusCode = 400;
    err.code = "PREMATURE_CHECKIN";
    err.data = {
      bookingId: booking._id,
      scheduledTime: formatTz(scheduledTime),
      opensAt: formatTz(checkInOpensAt),
    };
    throw err;
  }

  if (now > checkInClosesAt) {
    // Invalidate QR status
    await Booking.updateOne({ _id: booking._id }, { $set: { "qrCode.status": "expired" } });
    const err = new Error(
      `Check-in window expired. Check-in was valid until ${formatTz(checkInClosesAt)} (60 minutes past reservation time).`
    );
    err.statusCode = 400;
    err.code = "QR_EXPIRED";
    err.data = {
      bookingId: booking._id,
      scheduledTime: formatTz(scheduledTime),
      closedAt: formatTz(checkInClosesAt),
    };
    throw err;
  }

  // 8. Atomic Database Update (Prevents race conditions / concurrent scans)
  const updatedBooking = await Booking.findOneAndUpdate(
    {
      _id: booking._id,
      status: "confirmed",
      "qrCode.status": "valid",
    },
    {
      $set: {
        status: "checked_in",
        "qrCode.status": "used",
        "qrCode.checkedInAt": now,
        "qrCode.checkedInBy": staffUserId,
      },
    },
    { new: true }
  )
    .populate("userId", "name email phone")
    .populate("restaurantId", "name slug address timezone");

  if (!updatedBooking) {
    const err = new Error("Already checked in. This booking has already been verified.");
    err.statusCode = 409;
    err.code = "ALREADY_CHECKED_IN";
    throw err;
  }

  const tableNames = updatedBooking.tables?.length > 0
    ? updatedBooking.tables.map((t) => `${t.tableName}${t.sectionLabel ? ` (${t.sectionLabel})` : ""}`).join(", ")
    : updatedBooking.tableName || "Reserved Table";

  return {
    bookingId: updatedBooking._id,
    customerName: updatedBooking.userId?.name || "Valued Guest",
    customerEmail: updatedBooking.userId?.email,
    customerPhone: updatedBooking.userId?.phone,
    restaurantName: updatedBooking.restaurantId?.name || "Restaurant",
    branchLocation: updatedBooking.restaurantId?.address?.city || updatedBooking.restaurantId?.address?.street || "",
    date: updatedBooking.date,
    time: updatedBooking.time,
    guests: updatedBooking.guests,
    tableNames,
    checkedInAt: now,
    checkedInBy: staffUser.name || "Staff Member",
    status: "checked_in",
  };
};
