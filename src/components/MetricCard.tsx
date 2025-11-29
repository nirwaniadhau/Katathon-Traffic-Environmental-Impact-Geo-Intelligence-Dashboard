import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function MetricCard({ title, value, subtitle, icon: Icon, variant = "default" }: MetricCardProps) {
  const variantStyles = {
    default: "border-border bg-card",
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    destructive: "border-red-500/30 bg-red-500/5",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-green-600",
    warning: "text-yellow-600",
    destructive: "text-red-600",
  };

  return (
    <Card 
      className={cn(
        "border-2 transition-all hover:scale-105 hover:shadow-lg backdrop-blur-sm",
        variantStyles[variant]
      )}
      style={{
        background: variant === 'default' ? 'hsla(var(--card)/0.8)' : undefined,
        borderColor: variant === 'default' ? 'hsl(var(--border))' : undefined,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle 
          className="text-sm font-medium"
          style={{
            color: 'hsl(var(--muted-foreground))'
          }}
        >
          {title}
        </CardTitle>
        <Icon className={cn("h-5 w-5", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div 
          className="text-2xl font-bold"
          style={{
            color: 'hsl(var(--foreground))'
          }}
        >
          {value}
        </div>
        <p 
          className="text-xs mt-1"
          style={{
            color: 'hsl(var(--muted-foreground))'
          }}
        >
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );
}