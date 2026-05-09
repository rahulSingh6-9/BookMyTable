export const verifyAdmin = (req, res, next) => {
  const roles = req.user?.roles;

  if (!roles || !Array.isArray(roles)) {
    return res.status(403).json({
      success: false,
      message: "Access denied: roles missing",
    });
  }

  // normalize roles (case safety)
  const normalizedRoles = roles.map(r => r.toLowerCase().trim());

  const isAdmin =
    normalizedRoles.includes("admin") ||
    normalizedRoles.includes("super_admin") ||
    normalizedRoles.includes("system_admin");

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied: admin role required",
    });
  }

  next();
};