import * as React from "react";
import { cn } from "./Button";
export const Card = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "surface p-5",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
export const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label
    className={cn(
      "field-label",
      className,
    )}
  >
    {children}
  </label>
);
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full appearance-none rounded-md border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
