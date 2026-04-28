import { ROLES } from "../config/roles.js";

/**
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

export const verifyAdmin = (req, res, next) => {
  const rolesHeader = req.headers["x-user-roles"];

  if (!rolesHeader) {
    return res.status(403).json({ message: "No roles found" });
  }

  let roles = [];

  try {
    roles = JSON.parse(rolesHeader);
  } catch {
    roles = rolesHeader.split(",");
  }

  if (!roles.includes("admin")) {
    return res.status(403).json({ message: "Access denied: Not an admin" });
  }

  next();
};