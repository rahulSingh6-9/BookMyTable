import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BrandSidebar } from "@/components/layout/BrandSidebar";
import { Navbar } from "@/components/Navbar";
import { useBranch } from "@/context/BranchContext";

export function BrandLayout() {
  const { switchBranch } = useBranch();

  useEffect(() => {
    // When in Brand Panel, clear any active branch context
    switchBranch(null);
  }, []);

  return (
    <DashboardLayout sidebar={<BrandSidebar />} showFooter={false}>
      <Navbar />
      <Outlet />
    </DashboardLayout>
  );
}
