import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BranchSidebar } from "@/components/layout/BranchSidebar";
import { useBranchScrollReveal } from "@/hooks/useBranchScrollReveal";

export function BranchLayout() {
  const mainRef = useRef(null);
  useBranchScrollReveal(mainRef);

  return (
    <DashboardLayout 
      sidebar={<BranchSidebar />} 
      showFooter={false} 
      showNavbarPadding={false}
      mainRef={mainRef}
    >
      <Outlet />
    </DashboardLayout>
  );
}
