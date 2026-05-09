import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Store, CalendarCheck, MessageSquare, CreditCard, Bell, BarChart3, Settings, LogOut, ShieldAlert } from "lucide-react";

import { useAdminAuth } from "../../context/AuthContext";

export function AppSidebar() {
  const { logout, user } = useAdminAuth();

  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      localStorage.removeItem("token");
      toast.success("Logged out");
      navigate("/", { replace: true });
    }
  };

  const location = useLocation();

  const navGroups = [
    {
      label: "Overview",
      items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Management",
      items: [
        { title: "Users", url: "/admin/users", icon: Users },
        { title: "Restaurants", url: "/admin/restaurants", icon: Store },
        { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck },
        { title: "Reviews", url: "/admin/reviews", icon: MessageSquare },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Payments", url: "/admin/payments", icon: CreditCard },
        { title: "Notifications", url: "/admin/notifications", icon: Bell },
        { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
        { title: "System Logs", url: "/admin/logs", icon: ShieldAlert },
      ],
    },

    {
      label: "Settings",
      items: [
        { title: "Platform Settings", url: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="py-4 border-b">
        <div className="flex items-center gap-2 px-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            BMT
          </div>
          <span className="font-bold text-lg truncate sidebar-expanded-only text-foreground">Admin Portal</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-muted-foreground">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link to={item.url} className={`transition-colors flex items-center gap-3 ${isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
            asChild 
            tooltip="Logout"
            onClick={handleLogout}
            >
              <Link to="/logout" className="text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
