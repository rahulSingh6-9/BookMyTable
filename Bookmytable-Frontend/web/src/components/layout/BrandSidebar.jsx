import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
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
  Crown,
  LogOut,
  Settings,
  Building2,
  Store,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  User,
  CreditCard,
  Bell,
  Blocks,
  Shield,
  Key,
  FolderOpen,
  Plus,
  History
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBrand } from "@/context/BrandContext";
import { useBranch } from "@/context/BranchContext";
import { cn } from "@/lib/utils";
import { BrandBranchSelector } from "@/components/rbac/BrandBranchSelector";

// Brand Panel Configuration
const brandSidebarConfig = [
  {
    title: "Brand Management",
    icon: Building2,
    items: [
      { title: "Brand Details", path: "/details", icon: Store, allowedRoles: [] }, // Safe
      { title: "Active Branches", path: "/active", icon: FolderOpen, allowedRoles: [] }, // Safe
      { title: "Deactivated Branches", path: "/deactivated", icon: ShieldCheck, allowedRoles: ["owner", "co_owner", "manager"] },
      { title: "Brand Logs", path: "/logs", icon: History, allowedRoles: ["owner", "co_owner", "manager"] },
      { title: "Create Branch", path: "/partner/register", isAbsolute: true, icon: Plus, allowedRoles: ["owner", "co_owner"] },
    ]
  },
  {
    title: "Subscription",
    path: "/subscription",
    icon: Crown,
    allowedRoles: ["owner", "co_owner"]
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Account", path: "/settings/account", icon: User, allowedRoles: ["owner", "co_owner"] },
      { title: "Billing", path: "/billing", icon: CreditCard, allowedRoles: ["owner", "co_owner"] },
      { title: "Integrations", path: "/integrations", icon: Blocks, allowedRoles: ["owner", "co_owner"] },
      { title: "Security", path: "/security", icon: Shield, allowedRoles: ["owner", "co_owner"] },
      { title: "Roles & Access", path: "/roles", icon: Key, allowedRoles: ["owner", "co_owner"] },
    ]
  }
];

export function BrandSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { activeBrandSlug, hasBrandRole, activeBrand } = useBrand();
  const { hasPermission, activeRole } = useBranch();

  // Unified Expansion State for Sidebar Groups
  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("brandSidebarExpandedGroups")) || {
        "Brand Management": true,
        "Settings": true
      };
    } catch {
      return {
        "Brand Management": true,
        "Settings": true
      };
    }
  });

  const toggleGroup = (title) => {
    setExpandedGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem("brandSidebarExpandedGroups", JSON.stringify(next));
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

  const basePath = `/brand/${activeBrandSlug}`;

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
          <SidebarGroupLabel>Brand Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {brandSidebarConfig.map((item) => {
                // If it's a single link
                if (!item.items) {
                  if (item.allowedRoles && !hasBrandRole(item.allowedRoles)) return null;
                  
                  // Handle absolute vs relative paths
                  const url = item.isAbsolute 
                    ? `${item.path}?brandId=${activeBrand?.id || ''}&brandName=${encodeURIComponent(activeBrand?.name || '')}&brandSlug=${activeBrandSlug}&mode=create-branch` 
                    : `${basePath}${item.path}`;
                    
                  const isActive = item.end 
                    ? location.pathname === (item.isAbsolute ? item.path : url) 
                    : location.pathname.startsWith(item.isAbsolute ? item.path : url);
                  
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
                  if (subItem.allowedRoles && !hasBrandRole(subItem.allowedRoles)) return false;
                  return true;
                });

                if (visibleSubItems.length === 0) return null;

                const isGroupOpen = expandedGroups[item.title];
                const isGroupActive = visibleSubItems.some(sub => {
                  const urlPath = sub.isAbsolute ? sub.path : `${basePath}${sub.path}`;
                  return location.pathname === urlPath || location.pathname.startsWith(urlPath);
                });

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
                          const url = subItem.isAbsolute 
                            ? `${subItem.path}?brandId=${activeBrand?.id || ''}&brandName=${encodeURIComponent(activeBrand?.name || '')}&brandSlug=${activeBrandSlug}&mode=create-branch` 
                            : `${basePath}${subItem.path}`;
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
