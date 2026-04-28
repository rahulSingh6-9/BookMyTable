import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// User API
// ──────────────────────────────────────────────

/**
 * Get currently logged-in user profile.
 */
export function getMe() {
  return apiClient.get("/users/me");
}

/**
 * Update profile (name, phone, etc.).
 * @param {object} data
 */
export function updateProfile(data) {
  return apiClient.put("/users/me", data);
}

/**
 * Change password.
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data
 */
export function changePassword(data) {
  return apiClient.put("/users/change-password", data);
}

/**
 * Delete the currently logged-in user's account.
 */
export function deleteAccount() {
  return apiClient.delete("/users/me");
}


/**
 * Get user's favorite restaurants.
 */
export function getFavorites() {
  return apiClient.get("/users/favorites");
}

/**
 * Add a restaurant to favorites.
 * @param {string} restaurantId
 */
export function addFavorite(restaurantId) {
  return apiClient.post(`/users/favorites/${restaurantId}`);
}

/**
 * Remove a restaurant from favorites.
 * @param {string} restaurantId
 */
export function removeFavorite(restaurantId) {
  return apiClient.delete(`/users/favorites/${restaurantId}`);
}
