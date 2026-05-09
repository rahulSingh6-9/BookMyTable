export const protect = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const rolesHeader = req.headers["x-user-roles"];
  const gatewaySecret = req.headers["x-internal-gateway"];

  console.log(`[UserService] Received headers - x-user-id: ${userId}, x-user-roles: ${rolesHeader}`);

  // 🔐 Verify request is from API Gateway or Admin Service
  if (gatewaySecret !== process.env.GATEWAY_SECRET) {
    console.error("[UserService] ❌ Invalid gateway secret!");
    return res.status(403).json({
      success: false,
      message: "Forbidden: Request must come from API Gateway",
    });
  }

  if (!userId) {
    console.error("[UserService] ❌ Missing x-user-id header!");
    return res.status(401).json({
      success: false,
      message: "Authentication failed: No user ID provided",
    });
  }

  let roles = [];
  if (rolesHeader) {
    try {
      roles = JSON.parse(rolesHeader);
    } catch (err) {
      roles = rolesHeader.split(",").map((r) => r.trim());
    }
  }

  req.user = {
    id: userId,
    _id: userId, // backwards-compatible alias
    roles,
  };

  next();
};