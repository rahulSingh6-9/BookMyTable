import React from "react";
import { useAdminAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export const PermissionGuard = ({ 
  permission, 
  allPermissions, 
  anyPermission, 
  fallback = null, 
  children 
}) => {
  const { hasPermission, hasAnyPermission, isLoading } = useAdminAuth();

  if (isLoading) return null;

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (allPermissions) {
    allowed = allPermissions.every(p => hasPermission(p));
  } else if (anyPermission) {
    allowed = hasAnyPermission(anyPermission);
  }

  if (!allowed) {
    return fallback;
  }

  return <>{children}</>;
};

export const PermissionProtectedRoute = ({ 
  permission, 
  allPermissions, 
  anyPermission, 
  children 
}) => {
  const { isLoggedIn, isLoading } = useAdminAuth();

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PermissionGuard 
      permission={permission} 
      allPermissions={allPermissions} 
      anyPermission={anyPermission} 
      fallback={<Navigate to="/admin" replace />}
    >
      {children}
    </PermissionGuard>
  );
};
