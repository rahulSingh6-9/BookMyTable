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
      // 1️⃣ Ensure user is authenticated (populated by protect middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // 3️⃣ Extract Branch Context
      // Priority: Headers > Params > Query > Body
      const branchId = 
        req.headers["x-branch-id"] || 
        req.params.branchId || 
        req.params.restaurantId ||
        req.query.branchId || 
        req.body.branchId || 
        req.body.restaurantId;

      console.log(`[RBAC] Checking Permission: ${permission} | User: ${req.user.id} | Branch: ${branchId}`);

      if (branchId) {
        req.branchId = branchId;
      }

      // 2️⃣ Bypass for Global Platform Roles
      const globalRoles = req.user.roles || [];
      if (globalRoles.includes("admin") || globalRoles.includes("super_admin")) {
        console.log(`[RBAC] Global Admin access granted: User ${req.user.id} to ${req.method} ${req.url}`);
        req.activeRole = "owner"; // Elevate platform admin/super admin to owner context for operations
        return next();
      }

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: "Branch context missing. Provide 'x-branch-id' header or 'branchId' parameter.",
        });
      }

      // 4️⃣ Resolve Branch Membership
      const membership = await BranchMembership.findOne({
        user: req.user.id,
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

      // 5️⃣ Check Permissions
      const isAuthorized = hasPermission(membership, permission);

      if (!isAuthorized) {
        console.warn(`[RBAC] User ${req.user.id} denied ${permission} at branch ${branchId}`);
        return res.status(403).json({
          success: false,
          message: `Access Denied: Insufficient permissions for ${permission}`,
          userRole: membership.role
        });
      }

      // 6️⃣ Inject context for downstream usage in controllers/services
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
