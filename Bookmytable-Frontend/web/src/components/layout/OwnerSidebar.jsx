import { NavLink } from "@/components/NavLink";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { cn } from "@/lib/utils";

const ownerLinks = [
  { title: "Dashboard", url: "/owner/dashboard", icon: LayoutDashboard, permission: "MANAGE_BRANCH" },
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


import { BranchSwitcher } from "@/components/rbac/BranchSwitcher";

export function OwnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasPermission } = useBranch();

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
              {filteredLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
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
