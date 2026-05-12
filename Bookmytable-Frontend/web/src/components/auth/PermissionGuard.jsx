import React from "react";
import { useBranch } from "@/context/BranchContext";

/**
 * Hook for functional permission checks inside components.
 * Compatible with legacy lowercase permission strings.
 */
export const usePermission = () => {
  const { hasPermission: baseHasPermission, activeRole, permissions } = useBranch();
  
  const hasPermission = (required) => {
    if (!required) return true;
    
    // Normalize to array
    const requiredList = Array.isArray(required) ? required : [required];
    
    // Check if any of the required permissions are met
    return requiredList.some(p => {
      // Try exact match
      if (baseHasPermission(p)) return true;
      
      // Try uppercase match (migration support)
      if (baseHasPermission(p.toUpperCase())) return true;
      
      // Try specialized mapping if needed
      if (p === "view_logs" && baseHasPermission("VIEW_REPORTS")) return true;
      if (p === "check_in_customers" && baseHasPermission("MANAGE_BOOKINGS")) return true;
      
      return false;
    });
  };

  return {
    hasPermission,
    role: activeRole,
    permissions
  };
};

/**
 * Component for conditional rendering based on permissions.
 * Usage: <PermissionGuard permissions={["manage_staff"]}> ... </PermissionGuard>
 */
export const PermissionGuard = ({ permissions, children, fallback = null }) => {
  const { hasPermission } = usePermission();

  if (hasPermission(permissions)) {
    return children;
  }

  return fallback;
};
