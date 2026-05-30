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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Store, CalendarCheck, MessageSquare, CreditCard, Bell, BarChart3, Settings, LogOut, ShieldAlert, Briefcase, PanelLeft } from "lucide-react";

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
        { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard, permission: "payments.view" },
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
      <SidebarHeader className="h-14 border-b border-sidebar-border flex flex-row items-center justify-end px-3">
        <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors" />
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-muted-foreground">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.title}
                        className={isActive ? "bg-sidebar-accent/25 text-primary font-bold hover:bg-sidebar-accent/25 hover:text-primary" : "text-sidebar-foreground/85 hover:bg-muted/50 hover:text-sidebar-foreground"}
                      >
                        <Link to={item.url} className="flex items-center gap-3 w-full">
                          <item.icon className="w-4 h-4 shrink-0" />
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
