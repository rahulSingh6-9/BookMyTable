import { ROLES } from "../config/roles.js";

/**
 * Check if a user object has the ADMIN role.
 */
export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

/**
 * Check if a user object has the OWNER role.
 */
export function isOwner(user) {
  return user?.role === ROLES.OWNER;
}

/**
 * Check if a user object has the USER (customer) role.
 */
export function isUser(user) {
  return user?.role === ROLES.USER;
}

/**
 * Check if a user has any one of the given roles.
 */
export function hasRole(user, roles) {
  if (!user?.role) return false;
  return roles.includes(user.role);
}

/**
 * Check if a user can manage restaurants
 */
export function canManageRestaurant(user) {
  return isOwner(user) || isAdmin(user);
}
