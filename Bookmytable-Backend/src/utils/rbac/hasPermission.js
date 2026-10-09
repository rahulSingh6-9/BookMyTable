import { ROLE_PERMISSIONS } from "../../config/roles.js";

/**
 * Checks if a membership has a specific permission.
 * 
 * @param {Object} membership - The BranchMembership object
 * @param {string} requiredPermission - The permission to check
 * @returns {boolean}
 */
export const hasPermission = (membership, requiredPermission) => {
  if (!membership || membership.status !== "active") return false;

  const role = membership.role;
  const permissions = ROLE_PERMISSIONS[role] || [];

  // Wildcard check
  if (permissions.includes("*")) return true;

  // Exact match
  if (permissions.includes(requiredPermission)) return true;

  // Custom permission override check (if membership has specific permissions array)
  if (membership.permissions && Array.isArray(membership.permissions)) {
    return membership.permissions.some(p => p.action === requiredPermission || p === requiredPermission);
  }

  return false;
};

