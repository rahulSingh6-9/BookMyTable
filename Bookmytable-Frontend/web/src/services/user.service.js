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
 * Update profile (name, phone, etc.) via atomic partial updates.
 * @param {object} data
 */
export function updateProfile(data) {
  return apiClient.patch("/users/me", data);
}

/**
 * Upload avatar image file to Cloudinary.
 * @param {FormData} formData
 */
export function uploadAvatar(formData) {
  return apiClient.patch("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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

/**
 * Request verification OTP to change phone number.
 */
export function requestPhoneChange(phone) {
  return apiClient.post("/users/me/phone/request", { phone });
}

/**
 * Verify OTP code to confirm phone number change.
 */
export function verifyPhoneOtp(otp) {
  return apiClient.post("/users/me/phone/verify", { otp });
}

/**
 * Resend phone OTP code.
 */
export function resendPhoneOtp() {
  return apiClient.post("/users/me/phone/resend");
}

/**
 * Request email change verification code.
 */
export function requestEmailChange(email) {
  return apiClient.post("/users/me/email/request", { email });
}

/**
 * Verify email code to confirm email address change.
 */
export function verifyEmailToken(token) {
  return apiClient.post("/users/me/email/verify", { token });
}

/**
 * Deactivate user account (soft delete).
 */
export function deactivateAccount(password) {
  return apiClient.post("/users/me/deactivate", { password });
}
