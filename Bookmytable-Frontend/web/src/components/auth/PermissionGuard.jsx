import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

/**
 * 🔒 PermissionGuard
 * High-order component to protect UI elements or routes based on permissions.
 * Supports both "some" (OR) and "every" (AND) logic.
 */
export const PermissionGuard = ({ 
  permissions = [], 
  requireAll = false, 
  fallback = null, 
  children,
  redirectTo = null
}) => {
  const { user } = useAuth();
  
  if (!user) return redirectTo ? <Navigate to={redirectTo} replace /> : fallback;

  // Owners and Admins usually have all permissions bypass
  const isAdmin = user.roles?.includes("owner") || user.roles?.includes("admin");
  if (isAdmin) return <>{children}</>;

  const userPermissions = user.permissions || [];
  
  const hasPermission = requireAll
    ? permissions.every(p => userPermissions.includes(p))
    : permissions.some(p => userPermissions.includes(p));

  if (!hasPermission) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback;
  }

  return <>{children}</>;
};

/**
 * Hook version for logic-heavy components
 */
export const usePermission = () => {
  const { user } = useAuth();
  
  const hasPermission = (permissions, requireAll = false) => {
    if (!user) return false;
    
    const isAdmin = user.roles?.includes("owner") || user.roles?.includes("admin");
    if (isAdmin) return true;

    const userPermissions = user.permissions || [];
    const perms = Array.isArray(permissions) ? permissions : [permissions];

    return requireAll
      ? perms.every(p => userPermissions.includes(p))
      : perms.some(p => userPermissions.includes(p));
  };

  return { hasPermission, user };
};
