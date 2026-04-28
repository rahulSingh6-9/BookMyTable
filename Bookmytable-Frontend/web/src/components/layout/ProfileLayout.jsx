import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar";
import { Navbar } from "@/components/Navbar";

export function ProfileLayout() {
  return (
    <DashboardLayout sidebar={<ProfileSidebar />} showFooter={false} >
      <Navbar />
      <Outlet />
    </DashboardLayout>
  );
}

