import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "@/components/Footer";

export function DashboardLayout({ sidebar, children, title, showFooter = true, showHeader = true }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full pt-16">
        {sidebar}
        <div className="flex-1 flex flex-col min-w-0">
          
          <main className="flex-1 p-4 lg:p-6 bg-background overflow-auto">
            {children}
          </main>
          {showFooter && <Footer />}
        </div>
      </div>
    </SidebarProvider>
  );
}
