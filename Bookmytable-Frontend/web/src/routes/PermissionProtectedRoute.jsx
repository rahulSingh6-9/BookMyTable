import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";

/**
 * Enterprise Permission-based Protected Route
 * 
 * Checks for:
 * 1. Authentication (via AuthContext)
 * 2. Active Branch Membership (via BranchContext)
 * 3. Specific Permissions (via BranchContext)
 */
export default function PermissionProtectedRoute({ 
  children, 
  permission, 
  allPermissions = [], 
  requireAll = false 
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasPermission, activeMembership, isLoading: branchLoading } = useBranch();

  if (authLoading || branchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authorizing...</p>
        </div>
      </div>
    );
  }

  // 1. Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Global Admin Bypass
  const isGlobalAdmin = user.roles?.includes("admin") || user.roles?.includes("super_admin");
  if (isGlobalAdmin) return children;

  // 3. Check for Active Branch Membership
  if (!activeMembership) {
    // If user has memberships but none active, redirect to selection or dashboard
    return <Navigate to="/discover" replace />;
  }

  // 4. Check Permissions
  if (permission) {
    if (!hasPermission(permission)) {
      console.warn(`[RBAC] Access denied: Missing permission "${permission}"`);
      return <Navigate to="/not-authorized" replace />;
    }
  }

  if (allPermissions.length > 0) {
    const isAuthorized = requireAll
      ? allPermissions.every(p => hasPermission(p))
      : allPermissions.some(p => hasPermission(p));

    if (!isAuthorized) {
      console.warn(`[RBAC] Access denied: Missing required permissions`);
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return children;
}
