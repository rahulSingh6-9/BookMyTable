import { useState, useMemo, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  CalendarCheck,
  Heart,
  Wallet,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  UserRound,
  X,
  SlidersHorizontal,
  ChevronRightSquare,
  ShieldCheck,
  KeyRound,
  Trash2,
  ChevronDown,
  PanelLeft
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";

export function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [settingsExpanded, setSettingsExpanded] = useState(
    location.pathname.startsWith("/profile/settings")
  );

  // Sync settings expanded state when location changes (e.g. on direct navigation)
  useEffect(() => {
    if (location.pathname.startsWith("/profile/settings")) {
      setSettingsExpanded(true);
    }
  }, [location.pathname]);

  const settingsChildren = [
    { title: "Contact & Verification", url: "/profile/settings/contact-verification", icon: ShieldCheck },
    { title: "Update Password", url: "/profile/settings/update-password", icon: KeyRound },
    { title: "Deactivate Account", url: "/profile/settings/deactivate-account", icon: Trash2 },
  ];

  const displayName = useMemo(() => user?.name || "Premium Diner", [user?.name]);
  const userAvatar = useMemo(() => user?.avatar || user?.profileImage || null, [user]);

  const navigationItems = [
    { title: "Home", url: "/profile/home", icon: Home },
    { title: "Discover", url: "/profile/discover", icon: Compass },
    { title: "My Bookings", url: "/profile/bookings", icon: CalendarCheck, badge: "2" },
    { title: "Favorites", url: "/profile/favorites", icon: Heart },
    { title: "Rewards & Wallet", url: "/profile/rewards", icon: Wallet, highlight: true },
    { title: "Activity", url: "/profile/activity", icon: History },
    { title: "Notifications", url: "/profile/notifications", icon: Bell, badge: "New" },
    { title: "Profile Info", url: "/profile/preferences", icon: User },
    { title: "Settings", url: "/profile/settings", icon: Settings },
  ];

  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 pt-16">
      <Navbar />

      {/* CORE WORKSPACE container WITH SIDEBAR & CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR - COLLAPSIBLE */}
        <aside 
          className={cn(
            "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 fixed left-0 top-16 bottom-0 z-30 select-none",
            collapsed ? "w-20" : "w-64"
          )}
        >
          {/* Sidebar Header with Toggle */}
          <div className={cn("h-14 border-b border-sidebar-border flex items-center px-3 shrink-0", collapsed ? "justify-center" : "justify-end")}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors shrink-0"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links inside sidebar */}
          <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
            {navigationItems.map((item) => {
              const isSettings = item.title === "Settings";
              
              if (isSettings) {
                const isActive = location.pathname.startsWith("/profile/settings");
                return (
                  <div key={item.title} className="space-y-1">
                    {/* Parent Settings Button */}
                    <button
                      onClick={() => {
                        if (collapsed) {
                          setCollapsed(false);
                          setSettingsExpanded(true);
                        } else {
                          setSettingsExpanded(!settingsExpanded);
                        }
                        navigate("/profile/settings/contact-verification");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative text-left select-none border-none outline-none",
                        isActive
                          ? "bg-sidebar-accent/25 text-primary font-bold shadow-sm"
                          : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon 
                        className={cn(
                          "h-4 w-4 transition-colors shrink-0", 
                          isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                        )} 
                      />
                      
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{item.title}</span>
                          <ChevronDown 
                            className={cn(
                              "h-3.5 w-3.5 text-sidebar-foreground/45 transition-transform duration-200 shrink-0", 
                              settingsExpanded && "rotate-180"
                            )} 
                          />
                        </>
                      )}

                    </button>

                    {/* Sub-navigation Children links */}
                    {!collapsed && settingsExpanded && (
                      <div className="pl-4 space-y-1 mt-1 border-l border-sidebar-border/60 ml-5">
                        {settingsChildren.map((child) => {
                          const isChildActive = location.pathname === child.url;
                          return (
                            <NavLink
                              key={child.title}
                              to={child.url}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all group",
                                isChildActive
                                  ? "text-primary font-bold bg-primary/5"
                                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/35"
                              )}
                            >
                              <child.icon 
                                className={cn(
                                  "h-3.5 w-3.5 transition-colors shrink-0",
                                  isChildActive ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60"
                                )} 
                              />
                              <span className="truncate">{child.title}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Else render default items
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative select-none",
                      isActive
                        ? "bg-sidebar-accent/25 text-primary font-bold shadow-sm"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      collapsed && "justify-center px-0"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon 
                        className={cn(
                          "h-4 w-4 transition-colors shrink-0", 
                          isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                        )} 
                      />
                      
                      {!collapsed && (
                        <span className="truncate">{item.title}</span>
                      )}

                      {/* Badge notification overlay */}
                      {item.badge && !collapsed && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "ml-auto text-[10px] px-1.5 h-4.5 min-w-4.5 rounded-full flex items-center justify-center border-none",
                            item.badge === "New" ? "bg-primary/20 text-primary-foreground font-extrabold" : "bg-sidebar-accent text-sidebar-accent-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}

                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Logout Section inside sidebar */}
          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/75 hover:bg-destructive/10 hover:text-destructive justify-start transition",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4 text-sidebar-foreground/50 group-hover:text-destructive" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </aside>

        {/* CONTAINER FOR MAIN VIEWS - SCROLLABLE */}
        <main 
          className={cn(
            "flex-1 flex flex-col overflow-y-auto bg-slate-50/50 pb-20 lg:pb-0 transition-all duration-300",
            collapsed ? "lg:ml-20" : "lg:ml-64"
          )}
        >
          <Outlet />
        </main>

      </div>

      {/* MOBILE SHEET/DRAWER MENU */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SheetHeader className="p-4 border-b border-sidebar-border flex flex-row items-center gap-3 justify-start text-left">
            <Avatar className="h-10 w-10 border border-sidebar-border">
              <AvatarImage src={userAvatar || ""} />
              <AvatarFallback className="bg-sidebar-accent font-bold text-sm text-sidebar-accent-foreground">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-sm font-bold text-sidebar-foreground">{displayName}</SheetTitle>
              <p className="text-xs text-primary font-semibold">Gold Diner</p>
            </div>
          </SheetHeader>

          <div className="py-4 px-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
            {navigationItems.map((item) => {
              const isSettings = item.title === "Settings";
              
              if (isSettings) {
                const isActive = location.pathname.startsWith("/profile/settings");
                return (
                  <div key={item.title} className="space-y-1">
                    {/* Mobile Settings Item toggler */}
                    <button
                      onClick={() => {
                        setSettingsExpanded(!settingsExpanded);
                        navigate("/profile/settings/contact-verification");
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left select-none border-none outline-none",
                        isActive
                          ? "bg-sidebar-accent/25 text-primary font-bold shadow-sm"
                          : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
                      <span className="flex-1">{item.title}</span>
                      <ChevronDown 
                        className={cn(
                          "h-3.5 w-3.5 text-sidebar-foreground/45 transition-transform duration-200 shrink-0", 
                          settingsExpanded && "rotate-180"
                        )} 
                      />
                    </button>
                    
                    {/* Mobile Settings Children */}
                    {settingsExpanded && (
                      <div className="pl-4 space-y-1 mt-1 border-l border-sidebar-border/60 ml-5">
                        {settingsChildren.map((child) => {
                          const isChildActive = location.pathname === child.url;
                          return (
                            <Link
                              key={child.title}
                              to={child.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all group",
                                isChildActive
                                  ? "text-primary font-bold bg-primary/5"
                                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/35"
                              )}
                            >
                              <child.icon 
                                className={cn(
                                  "h-3.5 w-3.5 transition-colors shrink-0",
                                  isChildActive ? "text-primary" : "text-sidebar-foreground/40"
                                )} 
                              />
                              <span className="truncate">{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all select-none",
                    location.pathname === item.url
                      ? "bg-sidebar-accent/25 text-primary font-bold shadow-sm"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 text-sidebar-foreground/50 shrink-0" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px] bg-sidebar-accent text-sidebar-accent-foreground border-none shrink-0">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-sidebar-border mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 justify-start"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-around px-2 z-40 lg:hidden shadow-lg shadow-slate-200">
        {[
          { title: "Home", url: "/profile/home", icon: Home },
          { title: "Discover", url: "/profile/discover", icon: Compass },
          { title: "Bookings", url: "/profile/bookings", icon: CalendarCheck },
          { title: "Wallet", url: "/profile/rewards", icon: Wallet },
          { title: "Settings", url: "/profile/settings", icon: Settings },
        ].map((tab) => {
          const active = location.pathname === tab.url;
          return (
            <Link
              key={tab.title}
              to={tab.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors text-[10px] font-medium",
                active ? "text-primary font-bold" : "text-slate-500"
              )}
            >
              <tab.icon className={cn("h-4.5 w-4.5 transition-transform", active && "scale-110 text-primary")} />
              <span>{tab.title}</span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
