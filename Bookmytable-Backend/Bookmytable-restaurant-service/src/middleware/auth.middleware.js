/**
 * Middleware to populate req.user from headers passed by API Gateway
 */
export const protect = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const rolesHeader = req.headers["x-user-roles"];
  const gatewaySecret = req.headers["x-internal-gateway"];

  console.log(`[RestaurantService] Received headers - x-user-id: ${userId}, x-user-roles: ${rolesHeader}`);

  // 🔐 Verify request is from API Gateway
  if (gatewaySecret !== process.env.GATEWAY_SECRET) {
    console.error("[RestaurantService] ❌ Invalid gateway secret!");
    return res.status(403).json({
      success: false,
      message: "Forbidden: Request must come from API Gateway",
    });
  }

  if (!userId) {

    console.error("[RestaurantService] ❌ Missing x-user-id header!");
    return res.status(401).json({
      success: false,
      message: "Authentication failed: No user ID provided by gateway",
    });
  }

  let roles = [];
  try {
    roles = rolesHeader ? JSON.parse(rolesHeader) : [];
  } catch (err) {
    roles = rolesHeader ? rolesHeader.split(",") : [];
  }

  // Populate req.user for role middleware
  // Note: role.middleware.js currently checks req.user.role (singular)
  // We can take the first role or adjust role.middleware.js to handle arrays
  req.user = {
    id: userId,
    roles: roles,
    role: roles[0] || "user" // Fallback for singular role check
  };

  next();
};
