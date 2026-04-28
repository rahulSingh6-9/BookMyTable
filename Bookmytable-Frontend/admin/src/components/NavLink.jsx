import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NavLink({ to, end, className, activeClassName, children, ...props }) {
  return (
    <RouterNavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          typeof className === "function" ? className({ isActive }) : className,
          isActive && activeClassName
        )
      }
      {...props}
    >
      {children}
    </RouterNavLink>
  );
}
