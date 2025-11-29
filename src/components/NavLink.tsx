import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        style={({ isActive }) => ({
          ...props.style,
          ...(isActive ? {
            background: 'hsl(var(--primary)/0.2)',
            color: 'hsl(var(--primary))'
          } : {
            color: 'hsl(var(--foreground))'
          })
        })}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };