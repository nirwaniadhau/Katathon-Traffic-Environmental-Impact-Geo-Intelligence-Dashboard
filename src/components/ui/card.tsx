import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "rounded-xl border-2 bg-background/80 backdrop-blur-sm text-foreground shadow-sm transition-all duration-300 hover:shadow-lg border-foreground/20",
      className
    )} 
    {...props} 
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex flex-col space-y-2 p-6 pb-4", className)} 
      {...props} 
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 
      ref={ref} 
      className={cn(
        "text-2xl font-bold leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent",
        className
      )} 
      {...props} 
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p 
      ref={ref} 
      className={cn("text-base font-medium text-foreground/80 leading-relaxed", className)} 
      {...props} 
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      {...props} 
    />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex items-center p-6 pt-0", className)} 
      {...props} 
    />
  ),
);
CardFooter.displayName = "CardFooter";

// Additional Card Variants
const CardMetric = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "rounded-xl border-2 bg-background/90 backdrop-blur-md text-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-foreground/20 hover:border-primary/30",
        className
      )} 
      {...props} 
    />
  ),
);
CardMetric.displayName = "CardMetric";

const CardHighlight = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "rounded-xl border-2 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm text-foreground shadow-sm transition-all duration-300 hover:shadow-xl border-primary/30 hover:border-primary/50",
        className
      )} 
      {...props} 
    />
  ),
);
CardHighlight.displayName = "CardHighlight";

const CardAlert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "rounded-xl border-2 bg-red-500/10 backdrop-blur-sm text-foreground shadow-sm transition-all duration-300 border-red-500/30 hover:border-red-500/50",
        className
      )} 
      {...props} 
    />
  ),
);
CardAlert.displayName = "CardAlert";

const CardSuccess = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "rounded-xl border-2 bg-emerald-500/10 backdrop-blur-sm text-foreground shadow-sm transition-all duration-300 border-emerald-500/30 hover:border-emerald-500/50",
        className
      )} 
      {...props} 
    />
  ),
);
CardSuccess.displayName = "CardSuccess";

const CardWarning = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "rounded-xl border-2 bg-amber-500/10 backdrop-blur-sm text-foreground shadow-sm transition-all duration-300 border-amber-500/30 hover:border-amber-500/50",
        className
      )} 
      {...props} 
    />
  ),
);
CardWarning.displayName = "CardWarning";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardMetric,
  CardHighlight,
  CardAlert,
  CardSuccess,
  CardWarning
};