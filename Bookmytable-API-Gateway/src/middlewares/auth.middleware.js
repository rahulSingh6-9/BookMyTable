import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()


export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`[Gateway] Incoming Auth Header: ${authHeader ? (authHeader.substring(0, 15) + "...") : "MISSING"}`);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    // 🔥 Pass clean structured data
    req.headers["x-user-id"] = decoded._id;
    req.headers["x-user-roles"] = JSON.stringify(decoded.roles || []);
    req.headers["x-permissions"] = JSON.stringify(decoded.permissions || []);
    req.headers["x-scope"] = decoded.scope || "web";

    console.log(`✅ Token verified for user: ${decoded._id}, roles: ${req.headers["x-user-roles"]}`);

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.headers["x-user-id"] = decoded._id;
    req.headers["x-user-roles"] = JSON.stringify(decoded.roles || []);
    req.headers["x-permissions"] = JSON.stringify(decoded.permissions || []);
    req.headers["x-scope"] = decoded.scope || "web";
    next();
  } catch (err) {
    console.error("❌ Optional Token verification failed:", err.message);
    next();
  }
};

export const verifyAdmin = (req, res, next) => {
  try {
    // 🔥 Get roles from header (sent by verifyToken)
    const rolesHeader = req.headers["x-user-roles"];

    if (!rolesHeader) {
      return res.status(403).json({
        success: false,
        message: "Access denied: No roles found",
      });
    }

    // 🔥 Parse roles safely
    let roles = [];

    try {
      roles = JSON.parse(rolesHeader); // ✅ expected format
    } catch {
      // fallback (if old string format like "admin,customer")
      roles = rolesHeader.split(",");
    }

    // 🔥 Check admin roles
    const adminRoles = [
      "admin", "super_admin", "SUPER_ADMIN", "PLATFORM_ADMIN", 
      "SUPPORT_ADMIN", "FINANCE_ADMIN", "OPERATIONS_ADMIN", 
      "CONTENT_MODERATOR", "ANALYTICS_ADMIN", "RESTAURANT_APPROVAL_MANAGER", 
      "STAFF_MANAGEMENT_ADMIN"
    ];

    const hasAdminRole = roles.some(role => adminRoles.includes(role));

    if (!hasAdminRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin role required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};


