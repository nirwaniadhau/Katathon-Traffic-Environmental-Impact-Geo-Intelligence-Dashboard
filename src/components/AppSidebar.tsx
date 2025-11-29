import { LayoutDashboard, LineChart, Sparkles, FileText, Navigation } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Predictions", url: "/predictions", icon: Sparkles },
  { title: "Eco Report", url: "/eco-report", icon: FileText },
  { title: "Routes", url: "/routes", icon: Navigation },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="glass-strong border-r-2 border-primary/20">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <h2 className={`font-bold text-sidebar-primary transition-all drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] ${isCollapsed ? 'text-center text-lg' : 'text-xl'}`}>
            {isCollapsed ? '🌍' : '🌍 GeoSense'}
          </h2>
          {!isCollapsed && (
            <p className="text-xs text-sidebar-foreground/70 mt-1">Environmental Intelligence</p>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
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
