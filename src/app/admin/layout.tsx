"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import { useBuyerAuth } from "@/context/BuyerContext";

const navigation = [
  { name: "ภาพรวมระบบ", icon: LayoutDashboard, href: "/admin" },
  { name: "จัดการออร์เดอร์", icon: ShoppingCart, href: "/admin/orders" },
  { name: "พนักงาน", icon: Users, href: "/admin/staff" },
  { name: "ร้านค้า", icon: Store, href: "/admin/stores" },
  { name: "ประวัติ", icon: FileText, href: "/admin/history" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { buyer, logout } = useBuyerAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPage =
    navigation.find((item) => item.href === pathname)?.name ||
    (pathname === "/admin/settings" ? "ตั้งค่าระบบ" : "แผงควบคุม");
  const userInitial = buyer?.name?.trim()?.charAt(0) || "A";
  const roleLabel = buyer?.role === "admin" ? "ผู้ดูแลระบบ" : buyer?.role || "Administrator";
  const roleBadgeLabel = buyer?.role === "admin" ? "Admin" : roleLabel;

  return (
    <div className="admin-ui flex min-h-screen bg-[linear-gradient(180deg,#f6f8fb_0%,#f4f7fa_100%)] text-slate-900">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-amber-200/70 bg-[linear-gradient(180deg,#f8f2df_0%,#f0f6ef_100%)] shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)] transition-transform duration-200 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-3 py-2.5">
          <div className="rounded-[16px] border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,244,208,0.72)_0%,rgba(232,246,240,0.62)_100%)] p-2.5 shadow-[0_10px_24px_-24px_rgba(120,113,108,0.26)]">
          <div className="flex items-center justify-between gap-3">
            <div />
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-slate-200 bg-white/90 text-slate-500 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="ปิดเมนู"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2.5 rounded-[14px] border border-white/90 bg-white/90 p-2.5 shadow-[0_10px_22px_-24px_rgba(15,23,42,0.2)] backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-teal-700 text-sm font-semibold text-white">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-950">
                  {buyer?.name || "Administrator"}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-white/80 px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] text-amber-700">
                  <ShieldCheck className="h-3 w-3" />
                  {roleBadgeLabel}
                </div>
                <div className="mt-1.5 text-[11px] font-medium text-sky-700/85">{currentPage}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                aria-label="ออกจากระบบ"
                title="ออกจากระบบ"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        </div>

        <div className="overflow-y-auto px-3 py-4">
          <div className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            เมนูหลัก
          </div>

          <nav className="mt-3 rounded-[14px] border border-white/80 bg-white/60 p-1.5 shadow-[0_10px_22px_-28px_rgba(15,23,42,0.18)]">
            <div className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[14px] border px-3 py-2.5 text-sm transition-all",
                    isActive
                      ? "border-teal-700 bg-teal-700 text-white shadow-[0_14px_24px_-18px_rgba(15,118,110,0.7)]"
                      : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-950",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px]",
                      isActive
                        ? "bg-white/10 text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="truncate font-medium">{item.name}</span>
                </Link>
              );
            })}
            </div>
          </nav>

          <div className="mt-4 space-y-2 border-t border-slate-200/80 pt-4">
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-3 rounded-[14px] border px-3 py-2.5 text-sm transition-all",
                pathname === "/admin/settings"
                  ? "border-teal-700 bg-teal-700 text-white shadow-[0_14px_24px_-18px_rgba(15,118,110,0.7)]"
                  : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-950",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[12px]",
                  pathname === "/admin/settings"
                    ? "bg-white/10 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200",
                )}
              >
                <Settings className="h-4 w-4" />
              </div>
              <span className="font-medium">ตั้งค่าระบบ</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-amber-100/80 bg-[linear-gradient(135deg,rgba(255,253,247,0.96)_0%,rgba(247,251,249,0.92)_100%)] px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-slate-200 bg-white text-slate-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-950">{currentPage}</div>
              <div className="truncate text-xs text-slate-500">{buyer?.name || "Administrator"}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex h-9 items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>ออก</span>
          </button>
        </header>

        <main className="flex-1 px-4 py-5 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
