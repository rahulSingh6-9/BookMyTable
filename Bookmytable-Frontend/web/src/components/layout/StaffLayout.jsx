import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StaffSidebar } from "@/components/layout/StaffSidebar";
import { Navbar } from "@/components/Navbar";
export function StaffLayout() {
  return (
    <>
      <Navbar />
      <DashboardLayout sidebar={<StaffSidebar />} showFooter={false}>
        <Outlet />
      </DashboardLayout>
    </>
  );
}

