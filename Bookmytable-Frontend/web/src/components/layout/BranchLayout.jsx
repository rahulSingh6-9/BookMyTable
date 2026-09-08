import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BranchSidebar } from "@/components/layout/BranchSidebar";
import { Navbar } from "@/components/Navbar";

export function BranchLayout() {
  return (
    <>
      <Navbar />
      <DashboardLayout sidebar={<BranchSidebar />} showFooter={false}>
        <Outlet />
      </DashboardLayout>
    </>
  );
}
