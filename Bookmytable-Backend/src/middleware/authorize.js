import BranchMembership from "../models/branchmemberships.model.js";
import { hasPermission } from "../utils/rbac/hasPermission.js";

/**
 * Enterprise Multi-tenant RBAC Middleware
 * 
 * Validates user access based on:
 * 1. Global Platform Roles (admin, super_admin)
 * 2. Active Branch Membership
 * 3. Role-based permissions
 * 
 * @param {string} permission - The required permission string (e.g., 'MANAGE_BOOKINGS')
 */
export const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      // 1️⃣ Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Extract Branch Context
      const branchId = 
        req.headers["x-branch-id"] || 
        req.params.branchId || 
        req.params.restaurantId ||
        req.params.id ||
        req.query.branchId || 
        req.body?.branchId || 
        req.body?.restaurantId;

      if (branchId) {
        req.branchId = branchId;
      }

      // Bypass for Global Platform Roles
      const globalRoles = req.user.roles || [];
      if (globalRoles.includes("admin") || globalRoles.includes("super_admin")) {
        req.activeRole = "owner";
        return next();
      }

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: "Branch context missing. Provide 'x-branch-id' header or 'branchId' parameter.",
        });
      }

      // Resolve Branch Membership
      const userId = req.user.id || req.user._id;
      const membership = await BranchMembership.findOne({
        user: userId,
        branch: branchId,
        status: "active",
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: No active membership for this branch.",
          details: "Restaurant operational access is restricted to authorized branch members only."
        });
      }

      // Check Permissions
      const isAuthorized = hasPermission(membership, permission);

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Insufficient permissions for ${permission}`,
          userRole: membership.role
        });
      }

      // Inject context
      req.membership = membership;
      req.branchId = branchId;
      req.activeRole = membership.role;

      next();
    } catch (error) {
      console.error("[RBAC Middleware Error]:", error);
      return res.status(500).json({
        success: false,
        message: "Internal authorization processing error",
      });
    }
  };
};

export default authorize;
