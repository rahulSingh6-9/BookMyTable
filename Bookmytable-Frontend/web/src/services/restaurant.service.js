import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// Restaurant API
// ──────────────────────────────────────────────

/**
 * Get all restaurants (public, supports query params for filtering).
 * @param {object} params - optional query params (city, cuisine, etc.)
 */
export function getRestaurants(params = {}) {
  return apiClient.get("/restaurants", { params });
}

/**
 * Get a single restaurant by ID.
 * @param {string} id
 */
export function getRestaurantById(id) {
  return apiClient.get(`/restaurants/${id}`);
}

/**
 * Create a new restaurant (owner only).
 * @param {object} data
 */
export function createRestaurant(data) {
  return apiClient.post("/restaurants", data);
}

/**
 * Update an existing restaurant (owner only).
 * @param {string} id
 * @param {object} data
 */
export function updateRestaurant(id, data) {
  return apiClient.put(`/restaurants/${id}`, data);
}

/**
 * Delete a restaurant (owner or admin).
 * @param {string} id
 */
export function deleteRestaurant(id) {
  return apiClient.delete(`/restaurants/${id}`);
}

/**
 * Get restaurant settings (opening hours, etc.)
 * @param {string} restaurantId
 */
export function getRestaurantSettings(restaurantId) {
  return apiClient.get(`/restaurants/${restaurantId}/settings`);
}

/**
 * Update restaurant settings.
 * @param {string} restaurantId
 * @param {object} data
 */
export function updateRestaurantSettings(restaurantId, data) {
  return apiClient.put(`/restaurants/${restaurantId}/settings`, data);
}

/**
 * Upload restaurant cover image.
 * @param {string} restaurantId
 * @param {FormData} formData
 */
export function uploadRestaurantImage(restaurantId, formData) {
  return apiClient.post(`/restaurants/${restaurantId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
