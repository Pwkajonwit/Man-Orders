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
  { name: "สินค้า", icon: Package, href: "/admin/products" },
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

  return (
    <div className="admin-ui flex min-h-screen bg-[#f3f6fb] text-slate-900">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-slate-200 bg-[#f8fafc] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="ปิดเมนู"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-900">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-950">
                {buyer?.name || "Administrator"}
              </div>
              <div className="truncate text-xs text-slate-600">{roleLabel}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
              aria-label="ออกจากระบบ"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
          เมนูหลัก
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    isActive
                      ? "bg-white/10 text-white"
                      : "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="truncate font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-200/80 px-3 py-4">
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all",
              pathname === "/admin/settings"
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                pathname === "/admin/settings"
                  ? "bg-white/10 text-white"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
              )}
            >
              <Settings className="h-4 w-4" />
            </div>
            <span className="font-medium">ตั้งค่าระบบ</span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700"
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
            className="flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-all active:scale-95"
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
