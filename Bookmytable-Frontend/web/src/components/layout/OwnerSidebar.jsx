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
  Briefcase,
  User,
  CreditCard,
  Bell,
  Blocks,
  Shield,
  Key
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBranch } from "@/context/BranchContext";
import { cn } from "@/lib/utils";
import { BranchSwitcher } from "@/components/rbac/BranchSwitcher";

// Centralized Sidebar Configuration
const sidebarConfig = [
  {
    title: "Dashboard",
    url: "/owner/dashboard",
    icon: LayoutDashboard,
    end: true
  },
  {
    title: "Operations",
    icon: Briefcase,
    items: [
      { title: "Tables", url: "/owner/tables", icon: Table2, permission: "MANAGE_TABLES" },
      { title: "Layout", url: "/owner/layout", icon: Map, permission: "MANAGE_TABLES" },
      { title: "Reservations", url: "/owner/reservations", icon: CalendarCheck, permission: "MANAGE_BOOKINGS" },
      { title: "Availability & Schedule", url: "/owner/operations/availability-schedule", icon: Zap, permission: "MANAGE_SETTINGS" },
    ]
  },
  {
    title: "Business Profile",
    icon: Building2,
    items: [
      { title: "Branding", url: "/owner/business-workspace/branding", icon: Store, permission: "MANAGE_BRANCH" },
      { title: "Verification", url: "/owner/business-workspace/verification", icon: ShieldCheck, permission: "MANAGE_BRANCH", showForRoles: ["owner", "co_owner"] }
    ]
  },
  {
    title: "Menu",
    url: "/owner/menu",
    icon: MenuSquare,
    permission: "MANAGE_MENU"
  },
  {
    title: "Staff",
    url: "/owner/staff",
    icon: Users,
    permission: "MANAGE_STAFF"
  },
  {
    title: "Analytics",
    url: "/owner/analytics",
    icon: BarChart3,
    permission: "VIEW_ANALYTICS"
  },
  {
    title: "Compliance",
    icon: ShieldCheck,
    items: [
      { title: "Audit Logs", url: "/owner/logs", icon: History, permission: "VIEW_REPORTS" }
    ]
  },
  {
    title: "Subscription",
    url: "/owner/subscription",
    icon: Crown
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Booking Policies", url: "/owner/settings/booking-policies", icon: CalendarCheck, permission: "MANAGE_SETTINGS", end: true },
      { title: "Account", url: "/owner/settings/account", icon: User, permission: "MANAGE_SETTINGS" },
      { title: "Billing", url: "/owner/settings/billing", icon: CreditCard, permission: "MANAGE_SETTINGS" },
      { title: "Notifications", url: "/owner/settings/notifications", icon: Bell, permission: "MANAGE_SETTINGS" },
      { title: "Integrations", url: "/owner/settings/integrations", icon: Blocks, permission: "MANAGE_SETTINGS" },
      { title: "Security", url: "/owner/settings/security", icon: Shield, permission: "MANAGE_SETTINGS" },
      { title: "Roles & Access", url: "/owner/settings/roles", icon: Key, permission: "MANAGE_SETTINGS" },
    ]
  }
];

export function OwnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { hasPermission, activeRole } = useBranch();

  // Unified Expansion State for Sidebar Groups
  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebarExpandedGroups")) || {};
    } catch {
      return {};
    }
  });

  const toggleGroup = (title) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem("sidebarExpandedGroups", JSON.stringify(next));
      return next;
    });
  };

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
              {sidebarConfig.map((item) => {
                // If it's a single link
                if (!item.items) {
                  if (item.permission && !hasPermission(item.permission)) return null;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.end}
                          className={({ isActive }) => cn(
                            "hover:bg-muted/50 flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors",
                            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/80"
                          )}
                        >
                          <item.icon className="mr-2 h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // If it's a group (accordion)
                const visibleSubItems = item.items.filter(subItem => {
                  if (subItem.permission && !hasPermission(subItem.permission)) return false;
                  if (subItem.showForRoles && !subItem.showForRoles.includes(activeRole)) return false;
                  return true;
                });

                if (visibleSubItems.length === 0) return null;

                const isGroupOpen = expandedGroups[item.title];
                const isGroupActive = visibleSubItems.some(sub => location.pathname === sub.url || location.pathname.startsWith(sub.url));

                if (collapsed) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        tooltip={item.title} 
                        onClick={() => navigate(visibleSubItems[0].url)}
                        className={cn(isGroupActive && "bg-sidebar-accent text-sidebar-accent-foreground")}
                      >
                        <item.icon className="mr-2 h-4 w-4 text-primary shrink-0" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title} className="px-1 py-0.5">
                    <button
                      onClick={() => toggleGroup(item.title)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50 transition-colors text-sidebar-foreground/85 hover:text-sidebar-foreground",
                        isGroupActive && "bg-sidebar-accent/25 text-sidebar-accent-foreground font-bold"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={cn("h-4 w-4 shrink-0", isGroupActive ? "text-primary" : "text-muted-foreground")} />
                        <span>{item.title}</span>
                      </div>
                      {isGroupOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    
                    {isGroupOpen && (
                      <div className="pl-6 mt-1.5 space-y-1 border-l border-border/60 ml-5">
                        {visibleSubItems.map((subItem) => (
                          <NavLink 
                            key={subItem.title}
                            to={subItem.url}
                            end={subItem.end}
                            className={({ isActive }) => cn(
                              "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md hover:bg-muted/50 transition-colors",
                              isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-extrabold" : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <subItem.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{subItem.title}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
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
