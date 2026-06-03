import { useEffect } from "react";
import { useParams, Outlet, Navigate } from "react-router-dom";
import { useBranch } from "@/context/BranchContext";
import { useBrand } from "@/context/BrandContext";

export function BranchSync() {
  const { branchSlug } = useParams();
  const { activeBranchSlug, switchBranch, isLoading: branchLoading, branches } = useBranch();
  const { activeBrandSlug, isLoading: brandLoading } = useBrand();

  const isLoading = branchLoading || brandLoading;

  useEffect(() => {
    if (isLoading) return;
    
    // Sync branch if URL has different branch
    if (branchSlug && branchSlug !== "undefined" && branchSlug !== activeBranchSlug) {
      switchBranch(branchSlug);
    }
  }, [branchSlug, activeBranchSlug, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      </div>
    );
  }

  // If user hits /branch without params, redirect to their active branch or brand
  if (!branchSlug) {
    if (activeBranchSlug) {
      return <Navigate to={`/brand/${activeBrandSlug}/branch/${activeBranchSlug}/dashboard`} replace />;
    } else if (branches.length > 0) {
      return <Navigate to={`/brand/${activeBrandSlug}/branch/${branches[0].slug}/dashboard`} replace />;
    } else {
      return <Navigate to={`/brand/${activeBrandSlug}/details`} replace />;
    }
  }

  return <Outlet />;
}
