import { useEffect } from "react";
import { useParams, Outlet, Navigate } from "react-router-dom";
import { useBrand } from "@/context/BrandContext";

export function BrandSync() {
  const { brandSlug } = useParams();
  const { activeBrandSlug, switchBrand, isLoading, brands } = useBrand();

  useEffect(() => {
    if (isLoading) return;
    
    // Sync context if URL has different context
    if (brandSlug && brandSlug !== "undefined" && brandSlug !== activeBrandSlug) {
      switchBrand(brandSlug);
    }
  }, [brandSlug, activeBrandSlug, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      </div>
    );
  }

  // If user hits /brand without params, redirect to their active context
  if (!brandSlug) {
    if (activeBrandSlug) {
      return <Navigate to={`/brand/${activeBrandSlug}/details`} replace />;
    } else if (brands.length > 0) {
      return <Navigate to={`/brand/${brands[0].slug}/details`} replace />;
    } else {
      // If no memberships at all
      return <Navigate to="/discover" replace />;
    }
  }

  return <Outlet />;
}
