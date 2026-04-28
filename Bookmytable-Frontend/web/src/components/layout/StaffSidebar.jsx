import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, LogOut, PanelsTopLeft, UserRound } from "lucide-react";
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
import { cn } from "@/lib/utils";

const staffLinks = [
  { title: "Live Tables", url: "/staff/live-tables", icon: PanelsTopLeft },
  { title: "Walk-in Booking", url: "/staff/walkin-booking", icon: ClipboardList },
];

export function StaffSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const displayName = useMemo(() => user?.name || "Staff", [user?.name]);

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
      <SidebarHeader className="h-14 border-b border-border flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:px-2">
        <div className={cn("flex items-center gap-2 min-w-0", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">Staff Panel</div>
            </div>
          )}
        </div>
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Staff</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {staffLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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

