import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Footer } from "@/components/Footer";

export function DashboardLayout({ sidebar, children, title, showFooter = true, showHeader = true, showNavbarPadding = true, mainRef }) {
  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full ${showNavbarPadding ? "pt-16" : ""}`}>
        {sidebar}
        <div className="flex-1 flex flex-col min-w-0">
          
          <main ref={mainRef} className="flex-1 p-4 lg:p-6 bg-background overflow-auto">
            {/* Mobile sidebar trigger — only visible below md breakpoint */}
            <div className="md:hidden flex items-center mb-3">
              <SidebarTrigger className="h-9 w-9 text-muted-foreground hover:text-foreground border border-border/60 rounded-lg shadow-sm bg-background" />
            </div>
            {children}
          </main>
          {showFooter && <Footer />}
        </div>
      </div>
    </SidebarProvider>
  );
}
