import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function DashboardLayout({ sidebar, children, title }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full pt-16">
        {sidebar}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            {title && <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>}
          </header>
          <main className="flex-1 p-4 lg:p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
