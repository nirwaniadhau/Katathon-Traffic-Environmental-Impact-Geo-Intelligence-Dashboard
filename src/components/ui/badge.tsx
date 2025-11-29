import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/20 text-primary-foreground hover:bg-primary/30 hover:border-primary/50 hover:scale-105",
        secondary: "border-foreground/20 bg-foreground/10 text-foreground hover:bg-foreground/20 hover:border-foreground/30 hover:scale-105",
        destructive: "border-red-500/30 bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-500/30 hover:border-red-500/50 hover:scale-105",
        outline: "border-foreground/30 text-foreground hover:bg-foreground/10 hover:border-foreground/50 hover:scale-105",
        success: "border-emerald-500/30 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-500/50 hover:scale-105",
        warning: "border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 hover:border-amber-500/50 hover:scale-105",
        info: "border-blue-500/30 bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/50 hover:scale-105",
        premium: "border-purple-500/30 bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30 hover:border-purple-500/50 hover:scale-105",
        neutral: "border-gray-500/30 bg-gray-500/20 text-gray-700 dark:text-gray-300 hover:bg-gray-500/30 hover:border-gray-500/50 hover:scale-105",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
      rounded: {
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "full",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, rounded, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size, rounded }), className)} {...props} />;
}

// Additional Badge Components
const BadgeGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  ),
);
BadgeGroup.displayName = "BadgeGroup";

const StatusBadge = React.forwardRef<HTMLDivElement, BadgeProps & { 
  status?: "online" | "offline" | "busy" | "away" | "pending" | "completed" | "error" 
}>(
  ({ className, status = "online", ...props }, ref) => {
    const statusConfig = {
      online: { variant: "success" as const, label: "Online" },
      offline: { variant: "neutral" as const, label: "Offline" },
      busy: { variant: "warning" as const, label: "Busy" },
      away: { variant: "warning" as const, label: "Away" },
      pending: { variant: "warning" as const, label: "Pending" },
      completed: { variant: "success" as const, label: "Completed" },
      error: { variant: "destructive" as const, label: "Error" },
    };

    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        <div 
          className={cn("w-2 h-2 rounded-full", {
            "bg-emerald-500": status === "online" || status === "completed",
            "bg-gray-500": status === "offline",
            "bg-amber-500": status === "busy" || status === "away" || status === "pending",
            "bg-red-500": status === "error",
          })} 
        />
        {config.label}
      </Badge>
    );
  },
);
StatusBadge.displayName = "StatusBadge";

const CountBadge = React.forwardRef<HTMLDivElement, BadgeProps & { count: number; max?: number }>(
  ({ className, count, max = 99, variant = "destructive", ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count.toString();
    
    return (
      <Badge
        ref={ref}
        variant={variant}
        className={cn("min-w-6 h-6 px-1.5 justify-center", className)}
        {...props}
      >
        {displayCount}
      </Badge>
    );
  },
);
CountBadge.displayName = "CountBadge";

const IconBadge = React.forwardRef<HTMLDivElement, BadgeProps & { icon?: React.ReactNode }>(
  ({ className, icon, children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </Badge>
    );
  },
);
IconBadge.displayName = "IconBadge";

export { Badge, BadgeGroup, StatusBadge, CountBadge, IconBadge, badgeVariants };