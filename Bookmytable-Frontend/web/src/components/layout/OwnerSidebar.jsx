import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  CalendarCheck,
  Crown,
  LayoutDashboard,
  LogOut,
  Map,
  MenuSquare,
  Settings,
  Table2,
  Zap,
  Users,
  History,
  Building2,
  Store,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { cn } from "@/lib/utils";
import { BranchSwitcher } from "@/components/rbac/BranchSwitcher";

// Remaining links after manually rendering Dashboard & Business Workspace nested accordion
const ownerLinks = [
  { title: "Tables", url: "/owner/tables", icon: Table2, permission: "MANAGE_TABLES" },
  { title: "Layout", url: "/owner/layout", icon: Map, permission: "MANAGE_TABLES" },
  { title: "Reservations", url: "/owner/reservations", icon: CalendarCheck, permission: "MANAGE_BOOKINGS" },
  { title: "Availability (Live)", url: "/owner/availability", icon: Zap, permission: "MANAGE_SETTINGS" },
  { title: "Menu", url: "/owner/menu", icon: MenuSquare, permission: "MANAGE_MENU" },
  { title: "Analytics", url: "/owner/analytics", icon: BarChart3, permission: "VIEW_ANALYTICS" },
  { title: "Staff", url: "/owner/staff", icon: Users, permission: "MANAGE_STAFF" },
  { title: "Audit Logs", url: "/owner/logs", icon: History, permission: "VIEW_REPORTS" },
  { title: "Settings", url: "/owner/settings", icon: Settings, permission: "MANAGE_SETTINGS" },
  { title: "Subscription", url: "/owner/subscription", icon: Crown }, // Publicly visible to all owners
];

export function OwnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { hasPermission, activeRole } = useBranch();

  // Collapsible Workspace Sub-Menu state
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(() => {
    return localStorage.getItem("isWorkspaceOpen") === "true";
  });

  const toggleWorkspace = () => {
    setIsWorkspaceOpen((prev) => {
      const next = !prev;
      localStorage.setItem("isWorkspaceOpen", String(next));
      return next;
    });
  };

  const filteredLinks = useMemo(() => {
    return ownerLinks.filter(link => !link.permission || hasPermission(link.permission));
  }, [hasPermission]);

  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      localStorage.removeItem("token");
      toast.success("Logged out");
      navigate("/", { replace: true });
    }
  };

  const showVerification = activeRole === "owner" || activeRole === "co_owner";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-20 border-b border-border flex flex-row items-center gap-2 px-3 group-data-[collapsible=icon]:px-2">
        <BranchSwitcher collapsed={collapsed} />
        {!collapsed && (
           <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" />
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Restaurant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              
              {/* 1. Dashboard Link (Manual Setup) */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/owner/dashboard" 
                    end 
                    className={({ isActive }) => cn(
                      "hover:bg-muted/50 flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/80"
                    )}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 2. Collapsible Business Workspace section */}
              {!collapsed ? (
                <SidebarMenuItem className="px-1 py-0.5">
                  <button
                    onClick={toggleWorkspace}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50 transition-colors text-sidebar-foreground/85 hover:text-sidebar-foreground",
                      location.pathname.startsWith("/owner/business-workspace") && "bg-sidebar-accent/25 text-sidebar-accent-foreground font-bold"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Business Workspace</span>
                    </div>
                    {isWorkspaceOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  
                  {isWorkspaceOpen && (
                    <div className="pl-6 mt-1.5 space-y-1 border-l border-border/60 ml-5">
                      <NavLink 
                        to="/owner/business-workspace/branding"
                        className={({ isActive }) => cn(
                          "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-muted/50 transition-colors",
                          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-extrabold" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Store className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Branding</span>
                      </NavLink>
                      
                      {showVerification && (
                        <NavLink 
                          to="/owner/business-workspace/verification"
                          className={({ isActive }) => cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-muted/50 transition-colors",
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-extrabold" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>Verification</span>
                        </NavLink>
                      )}
                    </div>
                  )}
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Business Workspace" 
                    onClick={() => navigate("/owner/business-workspace/branding")}
                    className={cn(location.pathname.startsWith("/owner/business-workspace") && "bg-sidebar-accent text-sidebar-accent-foreground")}
                  >
                    <Building2 className="mr-2 h-4 w-4 text-primary shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* 3. General Links (Filtered Links) */}
              {filteredLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => cn(
                        "hover:bg-muted/50 flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors",
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/80"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
