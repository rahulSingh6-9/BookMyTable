import jwt from "jsonwebtoken";


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
    req.headers["x-scope"] = decoded.scope || "web";

    console.log(`✅ Token verified for user: ${decoded._id}, roles: ${req.headers["x-user-roles"]}`);

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token" });
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

    // 🔥 Check admin role
    if (!roles.includes("admin")) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Not an admin",
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


