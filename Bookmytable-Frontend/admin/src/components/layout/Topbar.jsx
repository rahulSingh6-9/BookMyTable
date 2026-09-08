import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Bell, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { useAdminAuth } from "../../context/AuthContext";

export default function Topbar() {
  const { admin } = useAdminAuth()

  const recentNotifications = [
    {
      id: 1,
      title: "Suspicious Activity",
      message: "Multiple failed login attempts.",
      time: "2 mins ago",
      icon: ShieldAlert,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      id: 2,
      title: "New Restaurant Approved",
      message: "'The Spice Lounge' onboarded.",
      time: "3 hours ago",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 md:px-6 border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative w-64 lg:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search anywhere..." 
            className="w-full bg-muted/50 pl-9 rounded-full border-transparent focus-visible:ring-primary h-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary border-2 border-background"></span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-xl overflow-hidden shadow-lg border-border/40">
            <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
              <span className="font-semibold text-foreground">Notifications</span>
              <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all read</span>
            </div>
            <div className="max-h-80 overflow-y-auto bg-card">
              {recentNotifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-border/40 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 items-start">
                  <div className={`mt-0.5 shrink-0 rounded-full w-8 h-8 flex items-center justify-center ${n.bgColor}`}>
                    <n.icon className={`w-4 h-4 ${n.color}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium leading-none text-foreground">{n.title}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">{n.message}</span>
                    <span className="text-xs text-muted-foreground mt-1">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 bg-muted/30 border-t border-border/40">
              <Button asChild variant="ghost" className="w-full justify-center h-8 text-xs font-medium text-muted-foreground hover:text-foreground">
                <Link to="/admin/operations/notifications">View all notifications</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none">
              <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                <AvatarImage src={admin.avatar || "" } alt="Admin" className="object-cover" />
                <AvatarFallback className="text-2xl">{admin.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/40">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive font-medium cursor-pointer">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
