import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (is3D) {
      root.classList.add("theme-3d");
    } else {
      root.classList.remove("theme-3d");
    }
  }, [is3D]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 pointer-events-none" />
        <AppSidebar />
        <main className="flex-1 flex flex-col relative z-0" data-3d>
          <header className="h-14 border-b border-border glass-strong flex items-center justify-between px-4 sticky top-0 z-10 shadow-glow">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>3D</span>
              <Switch checked={is3D} onCheckedChange={setIs3D} />
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
