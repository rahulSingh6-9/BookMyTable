import { ROLES } from "../config/roles.js";

// ──────────────────────────────────────────────
// Role Authorization Middleware
// Uses ROLES constants — no hardcoded strings
// ──────────────────────────────────────────────

/**
 * Express middleware factory.
 * Checks that req.user.role is one of the allowed roles.
 *
 * Must be used AFTER the `protect` middleware (which sets req.user).
 *
 * Usage:
 *   router.post("/", protect, authorize(ROLES.OWNER, ROLES.ADMIN), controller)
 *
 * @param {...string} roles - allowed roles from ROLES constant
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};