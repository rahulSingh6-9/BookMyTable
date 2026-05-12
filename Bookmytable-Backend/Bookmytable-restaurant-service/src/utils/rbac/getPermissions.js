import { ROLE_PERMISSIONS } from "../../config/roles.js";

/**
 * Resolves permissions for a given role.
 * Handles wildcard ["*"] for administrative roles.
 * 
 * @param {string} role - The role to get permissions for
 * @returns {string[]} - Array of permission strings
 */
export const getPermissions = (role) => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  // If role has wildcard, it theoretically has all possible permissions
  // In a real system, you might want to return all keys from ROLE_PERMISSIONS or a special flag
  return permissions;
};
