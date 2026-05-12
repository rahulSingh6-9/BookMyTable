import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StaffSidebar } from "@/components/layout/StaffSidebar";
import { Navbar } from "@/components/Navbar";
export function StaffLayout() {
  return (
    <DashboardLayout sidebar={<StaffSidebar />} showFooter={false}>
      <Navbar />
      <Outlet />
    </DashboardLayout>
  );
}

