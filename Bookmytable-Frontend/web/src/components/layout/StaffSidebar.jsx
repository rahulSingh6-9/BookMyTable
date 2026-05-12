import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ClipboardList, 
  LogOut, 
  PanelsTopLeft, 
  UserRound, 
  CalendarDays, 
  LayoutDashboard,
  History
} from "lucide-react";
import { toast } from "sonner";

import { NavLink } from "@/components/NavLink";
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
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { cn } from "@/lib/utils";

const staffLinks = [
  { 
    title: "Dashboard", 
    url: "/staff/dashboard", 
    icon: LayoutDashboard,
    permission: "VIEW_BOOKINGS"
  },
  { 
    title: "Bookings", 
    url: "/staff/bookings", 
    icon: CalendarDays,
    permission: "VIEW_BOOKINGS"
  },
  { 
    title: "Live Tables", 
    url: "/staff/live-tables", 
    icon: PanelsTopLeft,
    permission: "MANAGE_TABLES"
  },
  { 
    title: "Walk-in Booking", 
    url: "/staff/walkin-booking", 
    icon: ClipboardList,
    permission: "MANAGE_BOOKINGS"
  },
  { 
    title: "Audit Logs", 
    url: "/staff/logs", 
    icon: History,
    permission: "VIEW_REPORTS"
  },
];

import { BranchSwitcher } from "@/components/rbac/BranchSwitcher";

export function StaffSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { hasPermission } = useBranch();

  const filteredLinks = useMemo(() => {
    return staffLinks.filter(link => !link.permission || hasPermission(link.permission));
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
          <SidebarGroupLabel>Staff Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
