"use client";

import type { LucideIcon } from "lucide-react";
import { Search, Loader2 } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";

type Tone = "slate" | "blue" | "emerald" | "amber" | "red" | "purple";

const toneStyles: Record<Tone, { icon: string; chip: string }> = {
  slate: {
    icon: "border-slate-200 bg-slate-50 text-slate-700",
    chip: "border-slate-200 bg-slate-50 text-slate-700",
  },
  blue: {
    icon: "border-blue-200 bg-blue-50 text-blue-700",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
  },
  emerald: {
    icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  amber: {
    icon: "border-amber-200 bg-amber-50 text-amber-700",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
  },
  red: {
    icon: "border-red-200 bg-red-50 text-red-700",
    chip: "border-red-200 bg-red-50 text-red-700",
  },
  purple: {
    icon: "border-violet-200 bg-violet-50 text-violet-700",
    chip: "border-violet-200 bg-violet-50 text-violet-700",
  },
};

export function AdminPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-6 pb-12", className)}>{children}</div>;
}

export function AdminHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-3xl text-slate-950">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-600 md:text-[15px]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function AdminSearch({
  placeholder,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative min-w-[17rem]", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input {...props} className="pl-9" placeholder={placeholder} />
    </div>
  );
}

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  submitting?: boolean;
}

export function AdminPrimaryButton({
  children,
  className,
  icon: Icon,
  submitting,
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || submitting}
      className={cn(
        "h-10 rounded-lg border-slate-900 bg-slate-900 px-4 text-sm text-white hover:bg-slate-800 hover:text-white disabled:bg-slate-700 disabled:opacity-70",
        className,
      )}
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </Button>
  );
}

export function AdminSecondaryButton({
  children,
  className,
  icon: Icon,
  submitting,
  disabled,
  ...props
}: AdminButtonProps) {
  return (
    <Button
      {...props}
      variant="secondary"
      disabled={disabled || submitting}
      className={cn(
        "h-10 rounded-lg border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50",
        className,
      )}
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </Button>
  );
}

export function AdminStatGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const styles = toneStyles[tone as Tone] || toneStyles.slate;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-slate-500">{label}</p>
          <div className="text-3xl leading-none text-slate-950">{value}</div>
          {detail ? <p className="text-sm text-slate-600">{detail}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            styles.icon,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}>
      {title || subtitle || action ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="min-w-0 space-y-1">
            {title ? <h2 className="text-base text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminStatusChip({
  label,
  tone = "slate",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const styles = toneStyles[tone as Tone] || toneStyles.slate;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs",
        styles.chip,
        className,
      )}
    >
      {label}
    </span>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <div className="text-base text-slate-950">{title}</div>
        {description ? <p className="max-w-md text-sm text-slate-600">{description}</p> : null}
      </div>
    </div>
  );
}
