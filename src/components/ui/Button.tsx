import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-800",
      secondary:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
      accent:
        "border border-primary bg-primary text-slate-950 hover:bg-[#c7ef36] hover:border-[#c7ef36]",
      danger:
        "border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400",
      ghost: "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    };
    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-md",
      md: "h-11 px-5 text-sm rounded-md",
      lg: "h-12 px-6 text-sm rounded-lg",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button, cn };
