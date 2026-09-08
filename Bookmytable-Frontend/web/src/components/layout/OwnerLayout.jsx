import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { Navbar } from "@/components/Navbar";
export function OwnerLayout() {
  return (
    <>
      <Navbar />
      <DashboardLayout sidebar={<OwnerSidebar />} showFooter={false}>
        <Outlet />
      </DashboardLayout>
    </>
  );
}
