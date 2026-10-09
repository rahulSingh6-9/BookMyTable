import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// Booking API
// ──────────────────────────────────────────────

/**
 * Initiate an atomic table hold and create Razorpay payment order.
 * @param {{ restaurantId, tableId?, tables?, date, time, guests, specialRequests?, cartItems?, paymentMethod? }} data
 */
export function initiateBookingHold(data) {
  return apiClient.post("/booking/hold", data);
}

/**
 * Release an active table hold (e.g. if user dismisses checkout).
 * @param {string} bookingId
 */
export function releaseBookingHold(bookingId) {
  return apiClient.post("/booking/release-hold", { bookingId });
}

/**
 * Create a new booking (legacy / direct).
 * @param {{ restaurantId, tableId, date, time, guests, specialRequest? }} data
 */
export function createBooking(data) {
  return apiClient.post("/booking", data);
}

/**
 * Get available slots for a restaurant on a specific date.
 * @param {string} branchSlug
 * @param {string} date
 * @param {number} guests
 * @param {string} tableType
 */
export function getRestaurantAvailability(branchSlug, date, guests, tableType) {
  return apiClient.get(`/availability/${branchSlug}`, { params: { date, guests, tableType } });
}

/**
 * Get all bookings for the currently logged-in user.
 */
export function getUserBookings() {
  return apiClient.get("/bookings/my");
}

/**
 * Get a single booking by ID.
 * @param {string} id
 */
export function getBookingById(id) {
  return apiClient.get(`/bookings/${id}`);
}

/**
 * Cancel a booking.
 * @param {string} id
 * @param {string} reason
 */
export function cancelBooking(id, reason = "") {
  return apiClient.patch(`/bookings/${id}/cancel`, { reason });
}

/**
 * Get all bookings for a restaurant (owner/staff/admin).
 * @param {string} restaurantId
 * @param {object} params - optional filters (date, status, etc.)
 */
export function getRestaurantBookings(restaurantId, params = {}) {
  return apiClient.get(`/bookings/restaurant/${restaurantId}`, { params });
}

/**
 * Update booking status (owner/staff/admin).
 * @param {string} id
 * @param {string} status
 */
export function updateBookingStatus(id, status) {
  return apiClient.patch(`/bookings/${id}/status`, { status });
}
