import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactNode, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS variables for light theme
    const lightTheme = {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--primary': '221.2 83.2% 53.3%',
      '--primary-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%',
    };

    // Set CSS variables for dark theme
    const darkTheme = {
      '--background': '222.2 84% 4.9%',
      '--foreground': '210 40% 98%',
      '--primary': '217.2 91.2% 59.8%',
      '--primary-foreground': '222.2 47.4% 11.2%',
      '--border': '217.2 32.6% 17.5%',
      '--muted': '217.2 32.6% 17.5%',
      '--muted-foreground': '215 20.2% 65.1%',
    };

    // Apply the selected theme
    const theme = isDark ? darkTheme : lightTheme;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Add/remove dark class for Tailwind dark mode if needed
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full bg-background text-foreground relative overflow-hidden"
        style={{
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))'
        }}
      >
        <div 
          className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" 
          style={{ opacity: 0.1 }}
        />
        <div 
          className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, hsl(var(--primary)/0.05) 0%, transparent 50%, hsl(142, 76%, 36%/0.05) 100%)`
          }}
        />
        <AppSidebar />
        <main className="flex-1 flex flex-col relative z-0">
          <header 
            className="h-14 border-b flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm backdrop-blur-sm"
            style={{
              borderColor: 'hsl(var(--border))',
              background: 'hsla(var(--background)/0.8)'
            }}
          >
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sun className="h-4 w-4" />
              <Switch 
                checked={isDark} 
                onCheckedChange={setIsDark}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="h-4 w-4" />
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