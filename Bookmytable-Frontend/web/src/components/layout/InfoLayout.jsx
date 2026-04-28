import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { InfoSidebar } from "@/components/layout/InfoSidebar";
import { Navbar } from "@/components/Navbar";

export function InfoLayout() {
  return (
    <>
      <Navbar />
      <DashboardLayout sidebar={<InfoSidebar />} showFooter={false}>
        <Outlet />
      </DashboardLayout>
    </>
  );
}
