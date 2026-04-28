import { ROLES } from "../config/roles.js";
import { isTokenExpired } from "./jwt.js";

// ──────────────────────────────────────────────
// Role-based Auth Helpers
// ──────────────────────────────────────────────

/**
 * Check if a user object has the ADMIN role.
 * @param {{ role: string }|null|undefined} user
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

/**
 * Check if a user object has the OWNER role.
 * @param {{ role: string }|null|undefined} user
 * @returns {boolean}
 */
export function isOwner(user) {
  return user?.role === ROLES.OWNER;
}

/**
 * Check if a user object has the USER (customer) role.
 * @param {{ role: string }|null|undefined} user
 * @returns {boolean}
 */
export function isUser(user) {
  return user?.role === ROLES.USER;
}

/**
 * Check if the user is authenticated:
 * — user object exists
 * — current token in localStorage is not expired
 * @param {{ role: string }|null|undefined} user
 * @returns {boolean}
 */
export function isAuthenticated(user) {
  if (!user) return false;
  if (typeof window === "undefined") return !!user; // SSR: trust the user object

  const token = localStorage.getItem("token");
  if (!token) return false;

  return !isTokenExpired(token);
}

/**
 * Check if a user has any one of the given roles.
 * @param {{ role: string }|null|undefined} user
 * @param {string[]} roles
 * @returns {boolean}
 */
export function hasRole(user, roles) {
  if (!user?.role) return false;
  return roles.includes(user.role);
}

/**
 * Check if a user can manage restaurants
 * (owners and admins can)
 * @param {{ role: string }|null|undefined} user
 * @returns {boolean}
 */
export function canManageRestaurant(user) {
  return isOwner(user) || isAdmin(user);
}
