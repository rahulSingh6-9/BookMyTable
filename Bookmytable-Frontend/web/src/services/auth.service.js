import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// Auth API — login, signup, password reset
// ──────────────────────────────────────────────

/**
 * Login with email and password.
 * @param {string} email
 * @param {string} password
 */
export function login(email, password) {
  return apiClient.post("/auth/login/web", { email, password });
}

/**
 * Sign up a new user.
 * @param {{ name: string, email: string, password: string, phone: string }} data
 */
export function signup(data) {
  return apiClient.post("/auth/signup", data);
}

/**
 * Request a password reset email.
 * @param {string} email
 */
export function forgotPassword(email) {
  return apiClient.post("/auth/forgot-password", { email });
}

/**
 * Reset password using a token from the reset email.
 * @param {{ token: string, newPassword: string }} data
 */
export function resetPassword(data) {
  return apiClient.post("/auth/reset-password", data);
}

/**
 * Verify that a password reset token is valid (not expired).
 * @param {string} token
 */
export function verifyResetToken(token) {
  return apiClient.get(`/auth/verify-reset-token?token=${token}`);
}
