"use client";

import { useState } from "react";
import {
  Users,
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Settings,
  FileText,
  Store,
  Menu,
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "ภาพรวม", icon: LayoutDashboard, href: "/admin" },
  { name: "พนักงาน", icon: Users, href: "/admin/staff" },
  { name: "ร้านค้า", icon: Store, href: "/admin/stores" },
  { name: "สินค้า", icon: Package, href: "/admin/products" },
  { name: "ออร์เดอร์", icon: ShoppingCart, href: "/admin/orders" },
  { name: "ประวัติ", icon: FileText, href: "/admin/history" },
  { name: "ตั้งค่า", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-transparent">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 gradient-sidebar px-5 py-6 transition-transform lg:sticky lg:translate-x-0 lg:h-screen",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 border-b border-slate-200 px-1 pb-5">
          <div className="eyebrow mb-3">Enterprise Workspace</div>
          <div className="text-xl font-semibold leading-tight text-slate-900">
            POWERTECH LIMITED
          </div>
          <div className="mt-1 text-sm text-slate-500">ระบบจัดซื้อและงานยืม</div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-sm font-medium tracking-[0.04em] transition-colors",
                pathname === item.href
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 pt-5">
          <button className="flex w-full items-center gap-3 rounded-md border border-transparent px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          className="fixed left-4 top-4 z-30 rounded-md border border-slate-300 bg-white p-2 text-slate-700 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-16 lg:px-8 lg:pt-8">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
