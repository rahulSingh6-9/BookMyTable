import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// Booking API
// ──────────────────────────────────────────────

/**
 * Create a new booking.
 * @param {{ restaurantId, tableId, date, time, guests, specialRequest? }} data
 */
export function createBooking(data) {
  return apiClient.post("/booking", data);
}

/**
 * Get available slots for a restaurant on a specific date.
 * @param {string} restaurantId
 * @param {string} date
 * @param {number} guests
 */
export function getRestaurantAvailability(branchSlug, date, guests, tableType) {
  return apiClient.get(`/booking/public/availability/${branchSlug}`, { params: { date, guests, tableType } });
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
 */
export function cancelBooking(id) {
  return apiClient.patch(`/bookings/${id}/cancel`);
}

/**
 * Get all bookings for a restaurant (owner/admin).
 * @param {string} restaurantId
 * @param {object} params - optional filters (date, status, etc.)
 */
export function getRestaurantBookings(restaurantId, params = {}) {
  return apiClient.get(`/bookings/restaurant/${restaurantId}`, { params });
}

/**
 * Update booking status (owner/admin).
 * @param {string} id
 * @param {string} status
 */
export function updateBookingStatus(id, status) {
  return apiClient.patch(`/bookings/${id}/status`, { status });
}
