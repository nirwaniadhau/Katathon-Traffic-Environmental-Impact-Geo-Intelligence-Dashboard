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
    <Sidebar 
      collapsible="icon" 
      className="border-r bg-background/95 backdrop-blur-md transition-all duration-300 border-border/50"
    >
      <SidebarContent>
        <div className="p-4 border-b border-border/50 transition-colors duration-300">
          <h2 
            className={`font-bold transition-all duration-500 ${
              isCollapsed ? 'text-center text-lg' : 'text-xl'
            } bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}
          >
            {isCollapsed ? '🌍' : '🌍 GeoSense'}
          </h2>
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground mt-1 transition-colors duration-300">
              Environmental Intelligence
            </p>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground transition-colors duration-300">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-sm text-foreground/80 hover:text-foreground"
                      activeClassName="bg-primary/15 text-primary font-medium shadow-sm scale-[1.02] border-r-2 border-primary"
                    >
                      <item.icon className="h-4 w-4 transition-colors duration-300" />
                      {!isCollapsed && (
                        <span className="transition-all duration-300">{item.title}</span>
                      )}
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