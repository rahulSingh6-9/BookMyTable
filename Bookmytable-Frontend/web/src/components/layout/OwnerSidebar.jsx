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
  TvMinimalPlay,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ownerLinks = [
  { title: "Dashboard", url: "/owner/dashboard", icon: LayoutDashboard },
  { title: "Tables", url: "/owner/tables", icon: Table2 },
  { title: "Layout", url: "/owner/layout", icon: Map },
  { title: "Reservations", url: "/owner/reservations", icon: CalendarCheck },
  { title: "Availability (Live)", url: "/owner/availability", icon: Zap },
  { title: "Menu", url: "/owner/menu", icon: MenuSquare },
  { title: "Analytics", url: "/owner/analytics", icon: BarChart3 },
  { title: "Settings", url: "/owner/settings", icon: Settings },
  { title: "Subscription", url: "/owner/subscription", icon: Crown },
];

export function OwnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const restaurantName = useMemo(() => user?.restaurant?.name || "Your Restaurant", [user?.restaurant?.name]);

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
        <div className={cn("min-w-0", collapsed && "sr-only")}>
          <span className="font-semibold text-foreground truncate">{restaurantName}</span>
        </div>
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Restaurant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ownerLinks.map((item) => (
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
