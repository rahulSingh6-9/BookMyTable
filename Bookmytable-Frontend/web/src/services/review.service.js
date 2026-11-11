import apiClient from "../lib/api.js";

/**
 * ─────────────────────────────────────────────────────────────
 * RATING & REVIEW API SERVICE
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Submit a customer review for an eligible booking.
 * @param {{ bookingId: string, ratings: { food: number, ambience: number, service: number }, review?: string }} data
 */
export function submitReview(data) {
  return apiClient.post("/reviews", data);
}

/**
 * Get review and eligibility status for a specific booking.
 * @param {string} bookingId
 */
export function getBookingReview(bookingId) {
  return apiClient.get(`/reviews/booking/${bookingId}`);
}

/**
 * Get public reviews and ratings aggregate for a restaurant.
 * @param {string} restaurantIdOrSlug
 * @param {{ page?: number, limit?: number, sort?: string }} params
 */
export function getRestaurantReviews(restaurantIdOrSlug, params = {}) {
  return apiClient.get(`/reviews/restaurant/${restaurantIdOrSlug}`, { params });
}

/**
 * Update an existing review.
 * @param {string} reviewId
 * @param {{ ratings: { food: number, ambience: number, service: number }, review?: string }} data
 */
export function updateReview(reviewId, data) {
  return apiClient.put(`/reviews/${reviewId}`, data);
}

/**
 * Delete a review.
 * @param {string} reviewId
 */
export function deleteReview(reviewId) {
  return apiClient.delete(`/reviews/${reviewId}`);
}

/**
 * Get branch reviews for authorized restaurant staff/owners.
 * @param {string} branchId
 * @param {{ page?: number, limit?: number, minRating?: number }} params
 */
export function getBranchReviews(branchId, params = {}) {
  return apiClient.get(`/reviews/branch/${branchId}`, { params });
}

/**
 * Administrative recalculation of restaurant aggregate.
 * @param {string} restaurantId
 */
export function recalculateRestaurantRating(restaurantId) {
  return apiClient.post(`/reviews/restaurant/${restaurantId}/recalculate`);
}
