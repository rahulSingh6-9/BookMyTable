import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden relative">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh] w-full relative">
          <Topbar />
          <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 bg-background relative">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
