import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useBrand } from "@/context/BrandContext";

/**
 * Enterprise Brand-level Protected Route
 * Validates if the user has a membership within the specified brand.
 * Can optionally enforce a set of allowed roles for sensitive brand features.
 */
export default function BrandProtectedRoute({ 
  children, 
  allowedRoles = [] // Empty array means ANY valid membership role is allowed
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { activeBrand, activeBrandSlug, isLoading: brandLoading, hasBrandRole } = useBrand();
  const { brandSlug } = useParams();

  const isSyncingBrand = brandSlug && brandSlug !== activeBrandSlug;

  if (authLoading || brandLoading || isSyncingBrand) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Authorizing Brand Access...</p>
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

  // 3. Must have a brand selected (meaning they have at least one membership under this brand)
  if (brandSlug && !activeBrand) {
    return <Navigate to="/discover" replace />;
  }

  // 4. Role-based enforcement for sensitive brand routes
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = hasBrandRole(allowedRoles);
    
    if (!isAuthorized) {
      console.warn(`[RBAC] Access denied: User lacks required brand roles: ${allowedRoles.join(", ")}`);
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return children;
}
