import {
  initiateBookingHold,
  releaseBookingHold,
  getUserBookingsService,
  getBookingByIdService,
  cancelBookingService,
  getRestaurantBookingsService,
  updateBookingStatusService,
  createReservation,
} from "./booking.service.js";

/**
 * POST /api/booking/hold
 * Atomically creates a temporary table hold and creates Razorpay payment order
 */
export const initiateHold = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please login to continue booking.",
      });
    }

    const result = await initiateBookingHold(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Table hold created successfully. Please complete payment.",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error initiating booking hold:", error.message);
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "HOLD_CREATION_FAILED",
      message: error.message || "Failed to initiate table hold",
    });
  }
};

/**
 * POST /api/booking/release-hold
 * Releases an active temporary hold when user dismisses payment checkout
 */
export const releaseHold = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.body;

    if (!userId || !bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }

    const result = await releaseBookingHold(bookingId, userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error releasing booking hold:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/booking/my or /api/bookings/my
 * Retrieves all bookings for authenticated user
 */
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please login to view your bookings.",
      });
    }

    const bookings = await getUserBookingsService(userId);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/booking/:id or /api/bookings/:id
 * Retrieves single booking with authorization check
 */
export const getBookingById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userRoles = req.user?.roles || [];
    const { id } = req.params;

    const booking = await getBookingByIdService(id, userId, userRoles);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    const status = error.statusCode || 404;
    return res.status(status).json({
      success: false,
      code: error.code || "BOOKING_NOT_FOUND",
      message: error.message,
    });
  }
};

/**
 * PATCH /api/booking/:id/cancel or /api/bookings/:id/cancel
 * Cancels a reservation adhering to restaurant policies
 */
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body || {};

    const result = await cancelBookingService(id, userId, reason);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error cancelling booking:", error.message);
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/booking/restaurant/:restaurantId
 * Retrieves all bookings for a restaurant (Staff/Owner)
 */
export const getRestaurantBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const bookings = await getRestaurantBookingsService(restaurantId, req.query);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching restaurant bookings:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/booking/:id/status
 * Updates reservation status (Staff/Owner)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await updateBookingStatusService(id, status);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error updating booking status:", error.message);
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/booking (Legacy direct booking)
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please login to continue booking.",
      });
    }

    const booking = await createReservation(userId, req.body);

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    const status = error.statusCode || (error.code === "PLAN_LIMIT_EXCEEDED" ? 403 : 400);
    return res.status(status).json({
      success: false,
      code: error.code,
      message: error.message || "Internal server error",
    });
  }
};
