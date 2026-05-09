export const protect = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  const rolesHeader = req.headers["x-user-roles"];
  const gatewaySecret = req.headers["x-internal-gateway"];

  console.log(`[Service] Auth headers received`);

  // 🔐 Verify request is from API Gateway
  if (gatewaySecret !== process.env.GATEWAY_SECRET) {
    return res.status(403).json({
      success: false,
      message: "Invalid gateway request",
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Missing user identity",
    });
  }

  let roles = [];

  if (rolesHeader) {
    try {
      roles = JSON.parse(rolesHeader);
    } catch (err) {
      roles = rolesHeader.split(",").map(r => r.trim());
    }
  }

  req.user = {
    id: userId,
    roles, // keep full array
  };

  next();
};