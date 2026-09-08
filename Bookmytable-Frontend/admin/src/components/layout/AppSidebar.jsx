import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, Users, Store, CalendarCheck, MessageSquare, 
  CreditCard, Bell, BarChart3, Settings, LogOut, ShieldAlert, 
  Briefcase, PanelLeft, CheckCircle, ShieldCheck, AlertTriangle, 
  Compass, LifeBuoy, Server, ChevronDown, ChevronRight
} from "lucide-react";

import { useAdminAuth } from "../../context/AuthContext";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { logout, admin, hasPermission } = useAdminAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout?.();
  };

  const navGroups = [
    {
      label: "Dashboard",
      items: [{ title: "Dashboard", url: "/admin", icon: LayoutDashboard }],
    },
    {
      label: "Management",
      icon: Briefcase,
      items: [
        { title: "Users", url: "/admin/management/users", icon: Users, permission: "users.view" },
        { title: "Brands", url: "/admin/management/brands", icon: Briefcase, permission: "brands.view" },
        { title: "Restaurants", url: "/admin/management/restaurants", icon: Store, permission: "restaurants.view" },
        { title: "Bookings", url: "/admin/management/bookings", icon: CalendarCheck, permission: "bookings.view" },
        { title: "Reviews", url: "/admin/management/reviews", icon: MessageSquare, permission: "content.moderate" },
      ],
    },
    {
      label: "Moderation",
      icon: ShieldCheck,
      items: [
        { title: "Approval Queue", url: "/admin/moderation/approvals", icon: CheckCircle, permission: "restaurants.manage" },
        { title: "Verification Center", url: "/admin/moderation/verifications", icon: ShieldCheck, permission: "users.manage" },
        { title: "Reports & Abuse", url: "/admin/moderation/reports", icon: AlertTriangle, permission: "content.moderate" },
      ],
    },
    {
      label: "Business",
      icon: CreditCard,
      items: [
        { title: "Payments", url: "/admin/business/payments", icon: CreditCard, permission: "payments.view" },
        { title: "Subscriptions", url: "/admin/business/subscriptions", icon: CreditCard, permission: "payments.view" },
        { title: "Discovery Management", url: "/admin/business/discovery", icon: Compass, permission: "brands.manage" },
      ],
    },
    {
      label: "Operations",
      icon: Settings,
      items: [
        { title: "Notifications", url: "/admin/operations/notifications", icon: Bell, permission: "settings.manage" },
        { title: "Analytics", url: "/admin/operations/analytics", icon: BarChart3, permission: "analytics.view" },
        { title: "Support / Issues", url: "/admin/operations/support", icon: LifeBuoy, permission: "settings.manage" },
      ],
    },
    {
      label: "Administration",
      icon: Server,
      items: [
        { title: "System Logs", url: "/admin/system/logs", icon: Server, permission: "audit_logs.view" },
        { title: "Audit Logs", url: "/admin/system/audit", icon: ShieldAlert, permission: "audit_logs.view" },
        { title: "Admins", url: "/admin/system/invitations", icon: Users, permission: "admins.manage" },
        { title: "Platform Settings", url: "/admin/system/settings", icon: Settings, permission: "settings.manage" },
      ],
    },
  ];

  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("adminSidebarExpandedGroups")) || {
        "Management": true,
      };
    } catch {
      return {
        "Management": true,
      };
    }
  });

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem("adminSidebarExpandedGroups", JSON.stringify(next));
      return next;
    });
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 border-b border-sidebar-border flex flex-row items-center justify-end px-3">
        <SidebarTrigger className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors" />
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.map((group) => {
                // Determine visible items based on permissions
                const visibleSubItems = group.items.filter(item => !item.permission || hasPermission(item.permission));
                
                if (visibleSubItems.length === 0) return null;

                // Dashboard (single link behavior)
                if (group.label === "Dashboard") {
                  const item = visibleSubItems[0];
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title} className="px-1 py-0.5">
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink 
                          to={item.url} 
                          end={item.url === "/admin"}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                            isActive 
                              ? "bg-sidebar-accent/25 text-primary font-bold" 
                              : "text-sidebar-foreground/85 hover:bg-muted/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Group (accordion behavior)
                const isGroupOpen = expandedGroups[group.label];
                const isGroupActive = visibleSubItems.some(sub => location.pathname === sub.url || location.pathname.startsWith(sub.url));

                if (collapsed) {
                  return (
                    <SidebarMenuItem key={group.label} className="px-1 py-0.5">
                      <SidebarMenuButton 
                        tooltip={group.label} 
                        onClick={() => navigate(visibleSubItems[0].url)}
                        className={cn(isGroupActive && "bg-sidebar-accent/25 text-primary")}
                      >
                        <group.icon className="h-4 w-4 shrink-0" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={group.label} className="px-1 py-0.5">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                        isGroupActive 
                          ? "bg-sidebar-accent/25 text-primary font-bold" 
                          : "text-sidebar-foreground/85 hover:bg-muted/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <group.icon className="h-4 w-4 shrink-0" />
                        <span>{group.label}</span>
                      </div>
                      {isGroupOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                    
                    {isGroupOpen && (
                      <div className="pl-6 mt-1.5 space-y-1 border-l border-border/60 ml-5">
                        {visibleSubItems.map((subItem) => {
                          return (
                          <NavLink 
                            key={subItem.title}
                            to={subItem.url}
                            className={({ isActive }) => cn(
                              "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                              isActive 
                                ? "bg-sidebar-accent/25 text-primary font-extrabold" 
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{subItem.title}</span>
                          </NavLink>
                        )})}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
            asChild 
            tooltip="Logout"
            onClick={handleLogout}
            >
              <button className="text-destructive hover:bg-destructive/10 transition-colors w-full flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
