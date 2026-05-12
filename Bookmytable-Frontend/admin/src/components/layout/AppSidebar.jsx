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
import { LayoutDashboard, Users, Store, CalendarCheck, MessageSquare, CreditCard, Bell, BarChart3, Settings, LogOut, ShieldAlert, Briefcase } from "lucide-react";

import { useAdminAuth } from "../../context/AuthContext";

export function AppSidebar() {
  const { logout, admin, hasPermission, hasAnyPermission } = useAdminAuth();

  const handleLogout = () => {
    logout?.();
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
        { title: "Users", url: "/admin/users", icon: Users, permission: "users.view" },
        { title: "Brands", url: "/admin/brands", icon: Briefcase, permission: "brands.view" },
        { title: "Restaurants", url: "/admin/restaurants", icon: Store, permission: "restaurants.view" },
        { title: "Bookings", url: "/admin/bookings", icon: CalendarCheck, permission: "bookings.view" },
        { title: "Reviews", url: "/admin/reviews", icon: MessageSquare, permission: "content.moderate" },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Payments", url: "/admin/payments", icon: CreditCard, permission: "payments.view" },
        { title: "Notifications", url: "/admin/notifications", icon: Bell, permission: "settings.manage" },
        { title: "Analytics", url: "/admin/analytics", icon: BarChart3, permission: "analytics.view" },
        { title: "System Logs", url: "/admin/logs", icon: ShieldAlert, permission: "audit_logs.view" },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "Admins", url: "/admin/management", icon: Users, permission: "admins.manage" },
        { title: "Platform Settings", url: "/admin/settings", icon: Settings, permission: "settings.manage" },
      ],
    },
  ];

  // Filter groups and items based on permissions
  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => !item.permission || hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

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
        {filteredNavGroups.map((group) => (
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
