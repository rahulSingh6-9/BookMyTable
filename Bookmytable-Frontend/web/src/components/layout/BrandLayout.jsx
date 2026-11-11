import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BrandSidebar } from "@/components/layout/BrandSidebar";
import { useBranch } from "@/context/BranchContext";
import { useBranchScrollReveal } from "@/hooks/useBranchScrollReveal";

export function BrandLayout() {
  const { switchBranch } = useBranch();
  const mainRef = useRef(null);
  useBranchScrollReveal(mainRef);

  useEffect(() => {
    // When in Brand Panel, clear any active branch context
    switchBranch(null);
  }, []);

  return (
    <DashboardLayout 
      sidebar={<BrandSidebar />} 
      showFooter={false} 
      showNavbarPadding={false}
      mainRef={mainRef}
    >
      <Outlet />
    </DashboardLayout>
  );
}
