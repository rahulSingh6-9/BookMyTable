import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileSidebar } from "@/components/layout/ProfileSidebar";
import { Navbar } from "@/components/Navbar";

export function ProfileLayout() {
  return (
    <>
      <Navbar />
      <DashboardLayout sidebar={<ProfileSidebar />} showFooter={false} >
        <Outlet />
      </DashboardLayout>
    </>
  );
}

