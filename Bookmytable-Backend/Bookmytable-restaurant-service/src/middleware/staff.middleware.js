import { createLog } from "../modules/log/log.service.js";
import { getStaffWithCache } from "../modules/staff/staff.service.js";

/**
 * Validates that the requesting user is an active staff member of the restaurant.
 * Requires req.headers["x-user-id"] and a way to identify the restaurant.
 */
export const requireStaff = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    // Restaurant ID can come from params, body, or query
    const restaurantId = req.params.restaurantId || req.body.restaurantId || req.query.restaurantId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    if (!restaurantId) {
      return res.status(400).json({ message: "Bad Request: Missing restaurant ID" });
    }

    // 🚀 Use cached staff fetch
    const staff = await getStaffWithCache(userId, restaurantId);

    if (!staff) {
      createLog({
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        performedBy: userId,
        role: req.headers["x-user-role"],
        restaurant: restaurantId,
        metadata: { path: req.originalUrl, method: req.method },
        ipAddress: req.ip,
      });
      return res.status(403).json({ message: "Forbidden: Not an active staff member for this restaurant" });
    }

    // Attach staff to request for further permission checks
    req.staff = staff;
    next();
  } catch (err) {
    console.error("[requireStaff] Error:", err);
    res.status(500).json({ message: "Internal server error during staff validation" });
  }
};

/**
 * Checks if the authenticated staff member has the required permission.
 * MUST be used after requireStaff.
 */
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    const { staff } = req;
    
    if (!staff) {
      return res.status(403).json({ message: "Forbidden: Staff validation required before permission check" });
    }

    if (!staff.permissions || !staff.permissions.includes(requiredPermission)) {
      createLog({
        action: "ACCESS_DENIED",
        performedBy: staff.user,
        role: staff.role,
        restaurant: staff.restaurant,
        metadata: { requiredPermission, path: req.originalUrl },
        ipAddress: req.ip,
      });
      return res.status(403).json({ message: `Forbidden: Missing required permission: ${requiredPermission}` });
    }

    next();
  };
};
