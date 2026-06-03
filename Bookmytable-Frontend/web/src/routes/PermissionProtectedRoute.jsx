import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBrand } from "@/context/BrandContext";
import { useBranch } from "@/context/BranchContext";
/**
 * Enterprise Permission-based Protected Route
 */
export default function PermissionProtectedRoute({ 
  children, 
  permission, 
  allPermissions = [], 
  requireAll = false 
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { activeBrand, activeBrandSlug, isLoading: brandLoading } = useBrand();
  const { hasPermission, activeMembership, activeBranchSlug, isLoading: branchLoading } = useBranch();
  const { brandSlug, branchSlug } = useParams();

  // Wait if we are syncing slugs
  const isSyncingBrand = brandSlug && brandSlug !== activeBrandSlug;
  const isSyncingBranch = branchSlug && branchSlug !== activeBranchSlug;

  if (authLoading || brandLoading || branchLoading || isSyncingBrand || isSyncingBranch) {
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

  // 3. Check for Active Brand or Branch Membership
  if (branchSlug && !activeMembership) {
    return <Navigate to="/discover" replace />;
  } else if (brandSlug && !activeBrand) {
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
