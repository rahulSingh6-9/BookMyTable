export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const roles = req.user?.roles;

    if (!roles || !Array.isArray(roles)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Roles missing",
      });
    }

    const hasRole = roles.some(role => 
      allowedRoles.includes(role) || 
      role === "SUPER_ADMIN" || 
      role === "super_admin"
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied: One of these roles required: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Permissions missing",
      });
    }

    // Super Admin check (wildcard)
    if (permissions.includes("*")) {
      return next();
    }

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Permission '${permission}' required`,
      });
    }

    next();
  };
};

export const requireAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const permissions = req.user?.permissions;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Permissions missing",
      });
    }

    // Super Admin check (wildcard)
    if (permissions.includes("*")) {
      return next();
    }

    const hasAny = requiredPermissions.some(p => permissions.includes(p));

    if (!hasAny) {
      return res.status(403).json({
        success: false,
        message: `Access denied: One of these permissions required: ${requiredPermissions.join(", ")}`,
      });
    }

    next();
  };
};

// Legacy compatibility
export const verifyAdmin = (req, res, next) => {
  const roles = req.user?.roles || [];
  const adminRoles = [
    "admin", "super_admin", "SUPER_ADMIN", "PLATFORM_ADMIN", 
    "SUPPORT_ADMIN", "FINANCE_ADMIN", "OPERATIONS_ADMIN", 
    "CONTENT_MODERATOR", "ANALYTICS_ADMIN", "RESTAURANT_APPROVAL_MANAGER", 
    "STAFF_MANAGEMENT_ADMIN"
  ];

  const isAdmin = roles.some(role => adminRoles.includes(role));

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin role required",
    });
  }

  next();
};