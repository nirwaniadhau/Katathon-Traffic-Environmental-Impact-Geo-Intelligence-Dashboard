import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-lg active:scale-95 border-2 border-primary/20 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:scale-105 hover:shadow-lg active:scale-95 border-2 border-red-500/20 shadow-sm",
        outline: "border-2 border-foreground/30 bg-background/80 text-foreground hover:bg-foreground/10 hover:border-foreground/50 hover:scale-105 active:scale-95 backdrop-blur-sm",
        secondary: "bg-foreground/10 text-foreground hover:bg-foreground/20 hover:scale-105 active:scale-95 border-2 border-foreground/20 backdrop-blur-sm",
        ghost: "hover:bg-foreground/10 hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 font-semibold",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 hover:shadow-lg active:scale-95 border-2 border-emerald-500/20 shadow-sm",
        warning: "bg-amber-600 text-white hover:bg-amber-700 hover:scale-105 hover:shadow-lg active:scale-95 border-2 border-amber-500/20 shadow-sm",
        premium: "bg-gradient-to-r from-primary to-primary/70 text-white hover:from-primary/90 hover:to-primary/60 hover:scale-105 hover:shadow-xl active:scale-95 border-2 border-primary/30 shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-3 text-base",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-13 rounded-lg px-10 py-4 text-lg",
        xl: "h-15 rounded-lg px-12 py-5 text-xl",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-13 w-13 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

// Additional Button Components
const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  ),
);
ButtonGroup.displayName = "ButtonGroup";

const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "icon", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      className={cn("rounded-full", className)}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";

const LoadingButton = React.forwardRef<HTMLButtonElement, ButtonProps & { loading?: boolean }>(
  ({ className, loading, children, disabled, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn("relative", className)}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={cn(loading && "opacity-0")}>
        {children}
      </span>
    </Button>
  ),
);
LoadingButton.displayName = "LoadingButton";

export { Button, ButtonGroup, IconButton, LoadingButton, buttonVariants };