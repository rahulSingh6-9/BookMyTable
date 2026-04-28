import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ShieldCheck, Lock, FileText, LifeBuoy, AlertTriangle, BookOpen } from "lucide-react";

const infoLinks = [
  { title: "Privacy", url: "/privacy", icon: ShieldCheck },
  { title: "Security", url: "/security", icon: Lock },
  { title: "Terms of Service", url: "/terms", icon: FileText },
  { title: "Help & Support", url: "/support", icon: LifeBuoy },
  { title: "Report a Fraud", url: "/report-fraud", icon: AlertTriangle },
  { title: "Blog", url: "/blog", icon: BookOpen },
];

export function InfoSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 border-b border-border flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:px-2">
        {!collapsed && <span className="font-semibold text-foreground truncate">Learn More</span>}
        <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learn More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {infoLinks.map((item) => (
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
    </Sidebar>
  );
}
