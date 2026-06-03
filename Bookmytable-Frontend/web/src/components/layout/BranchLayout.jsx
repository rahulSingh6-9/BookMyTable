import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BranchSidebar } from "@/components/layout/BranchSidebar";
import { Navbar } from "@/components/Navbar";

export function BranchLayout() {
  return (
    <DashboardLayout sidebar={<BranchSidebar />} showFooter={false}>
      <Navbar />
      <Outlet />
    </DashboardLayout>
  );
}
