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
  LayoutDashboard,
  LogOut,
  Map,
  MenuSquare,
  Settings,
  Table2,
  Zap,
  Users,
  History,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Bell,
  Store,
  CreditCard,
  Activity,
  Mail,
  MapPin
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBrand } from "@/context/BrandContext";
import { useBranch } from "@/context/BranchContext";
import { cn } from "@/lib/utils";
import { BrandBranchSelector } from "@/components/rbac/BrandBranchSelector";

// Branch Panel Configuration
const branchSidebarConfig = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    end: true
  },
  {
    title: "Reservations",
    path: "/reservations",
    icon: CalendarCheck,
    permission: "MANAGE_BOOKINGS"
  },
  {
    title: "Branch Profile",
    path: "/profile",
    icon: Store,
    permission: "MANAGE_BRANCH"
  },
  {
    title: "Menu",
    path: "/menu",
    icon: MenuSquare,
    permission: "MANAGE_MENU"
  },
  {
    title: "Staff",
    path: "/staff",
    icon: Users,
    permission: "MANAGE_STAFF"
  },
  {
    title: "Operations",
    icon: Briefcase,
    items: [
      { title: "Tables", path: "/operations/tables", icon: Table2, permission: "MANAGE_TABLES" },
      { title: "Layouts", path: "/operations/layout", icon: Map, permission: "MANAGE_TABLES" },
      { title: "Availability & Schedule", path: "/operations/availability", icon: Zap, permission: "MANAGE_SETTINGS" },
      { title: "Pricing Management", path: "/operations/pricing", icon: CreditCard, permission: "MANAGE_TABLES" },
    ]
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    permission: "VIEW_ANALYTICS"
  },
  {
    title: "Compliance",
    icon: ShieldCheck,
    items: [
      { title: "Audit Logs", path: "/logs", icon: History, permission: "VIEW_REPORTS" }
    ]
  },
  {
    title: "Branch Settings",
    icon: Settings,
    items: [
      { title: "Booking Policies", path: "/settings/booking-policies", icon: CalendarCheck, permission: "MANAGE_SETTINGS", end: true },
      { title: "Contact Information", path: "/settings/contact-information", icon: Mail, permission: "MANAGE_SETTINGS" },
      { title: "Location", path: "/settings/location", icon: MapPin, permission: "MANAGE_SETTINGS" },
      { title: "Payments & Payouts", path: "/settings/payments", icon: CreditCard, permission: "MANAGE_SETTINGS" },
      { title: "Plan & Usage", path: "/settings/plan", icon: Activity, permission: "MANAGE_SETTINGS" },
      { title: "Notifications", path: "/settings/notifications", icon: Bell, permission: "MANAGE_SETTINGS" },
    ]
  }
];

export function BranchSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { activeBrandSlug } = useBrand();
  const { hasPermission, activeRole, activeBranchSlug } = useBranch();

  // Unified Expansion State for Sidebar Groups
  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("branchSidebarExpandedGroups")) || {
        "Operations": true,
        "Branch Settings": true
      };
    } catch {
      return {
        "Operations": true,
        "Branch Settings": true
      };
    }
  });

  const toggleGroup = (title) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem("branchSidebarExpandedGroups", JSON.stringify(next));
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

  const basePath = `/brand/${activeBrandSlug}/branch/${activeBranchSlug}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn(
        "border-b border-border py-2 transition-all",
        collapsed ? "flex flex-col items-center justify-center gap-3 px-2" : "px-3 flex flex-col gap-2"
      )}>
        <div className={cn(
          "flex w-full items-center gap-2",
          collapsed ? "flex-col justify-center" : "justify-between"
        )}>
          <BrandBranchSelector collapsed={collapsed} className={cn("flex-1 min-w-0", collapsed && "w-8 h-8 flex-none")} />
          <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Branch Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {branchSidebarConfig.map((item) => {
                // If it's a single link
                if (!item.items) {
                  if (item.permission && !hasPermission(item.permission)) return null;
                  if (item.showForRoles && !item.showForRoles.includes(activeRole)) return null;
                  
                  const url = `${basePath}${item.path}`;
                  const isActive = item.end 
                    ? location.pathname === url 
                    : location.pathname.startsWith(url);
                  
                  return (
                    <SidebarMenuItem key={item.title} className="px-1 py-0.5">
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink 
                          to={url} 
                          end={item.end}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                            isActive 
                              ? "bg-sidebar-accent/25 text-primary font-bold" 
                              : "text-sidebar-foreground/85 hover:bg-muted/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0")} />
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
                const isGroupActive = visibleSubItems.some(sub => location.pathname === `${basePath}${sub.path}` || location.pathname.startsWith(`${basePath}${sub.path}`));

                if (collapsed) {
                  return (
                    <SidebarMenuItem key={item.title} className="px-1 py-0.5">
                      <SidebarMenuButton 
                        tooltip={item.title} 
                        onClick={() => navigate(`${basePath}${visibleSubItems[0].path}`)}
                        className={cn(isGroupActive && "bg-sidebar-accent/25 text-primary")}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title} className="px-1 py-0.5">
                    <button
                      onClick={() => toggleGroup(item.title)}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md transition-colors",
                        isGroupActive 
                          ? "bg-sidebar-accent/25 text-primary font-bold" 
                          : "text-sidebar-foreground/85 hover:bg-muted/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
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
                          const url = `${basePath}${subItem.path}`;
                          return (
                          <NavLink 
                            key={subItem.title}
                            to={url}
                            end={subItem.end}
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
