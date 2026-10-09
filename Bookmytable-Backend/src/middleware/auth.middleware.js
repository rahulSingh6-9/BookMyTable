import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;

    // Support both header-based (microservice legacy) and req.user access
    const userId = decoded._id || decoded.id;
    req.user.id = userId;
    req.headers["x-user-id"] = userId;
    req.headers["x-user-roles"] = JSON.stringify(decoded.roles || []);
    req.headers["x-permissions"] = JSON.stringify(decoded.permissions || []);
    req.headers["x-scope"] = decoded.scope || "web";

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const protect = verifyToken;

export const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    const userId = decoded._id || decoded.id;
    req.user.id = userId;
    req.headers["x-user-id"] = userId;
    req.headers["x-user-roles"] = JSON.stringify(decoded.roles || []);
    req.headers["x-permissions"] = JSON.stringify(decoded.permissions || []);
    req.headers["x-scope"] = decoded.scope || "web";
    next();
  } catch (err) {
    next();
  }
};

export const optionalProtect = optionalVerifyToken;

export const verifyAdmin = (req, res, next) => {
  try {
    const user = req.user;
    let roles = [];

    if (user?.roles && Array.isArray(user.roles)) {
      roles = user.roles;
    } else if (req.headers["x-user-roles"]) {
      try {
        roles = JSON.parse(req.headers["x-user-roles"]);
      } catch (e) {
        roles = [];
      }
    }

    const adminRoles = [
      "admin",
      "super_admin",
      "SUPER_ADMIN",
      "PLATFORM_ADMIN",
      "SUPPORT_ADMIN",
      "FINANCE_ADMIN",
      "OPERATIONS_ADMIN",
      "CONTENT_MODERATOR",
      "ANALYTICS_ADMIN",
      "RESTAURANT_APPROVAL_MANAGER",
      "STAFF_MANAGEMENT_ADMIN",
    ];

    const hasAdminRole = roles.some((role) => adminRoles.includes(role));

    if (!hasAdminRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error verifying admin privileges" });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient role permissions" });
    }
    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];
    if (!permissions.includes(permission) && !permissions.includes("*")) {
      return res.status(403).json({ success: false, message: `Forbidden: Missing permission ${permission}` });
    }
    next();
  };
};

export const authorize = (permission) => requirePermission(permission);
