"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ChevronLeft, ShoppingCart, History, Plus, ClipboardList } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";

export default function MobileHeader({
  title = "POWERTECH LIMITED",
  userName = "ผู้ใช้งานระบบ",
  onBack,
}: {
  title?: string;
  userName?: string;
  onBack?: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 mx-auto -mx-4 mb-6 max-w-md border-b border-slate-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-md border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <div className="eyebrow mb-2">Powertech Limited</div>
            <div className="text-lg font-semibold leading-none tracking-[-0.02em] text-slate-900">
              {title}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              ระบบจัดซื้อและงานยืม
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-semibold text-slate-900">{userName}</div>
            <div className="text-[11px] text-slate-500">ตำแหน่ง: ผู้สั่ง</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-slate-700">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[92%] max-w-sm -translate-x-1/2 items-center justify-around rounded-xl border border-slate-300 bg-white p-2">
      <Link href="/buy" className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full flex-col gap-1 rounded-lg py-2 text-[11px] font-semibold",
            pathname === "/buy"
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              : "text-slate-500",
          )}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>สั่งสินค้า</span>
        </Button>
      </Link>

      <div className="relative">
        <Link href="/buy/new">
          <div className="absolute -top-11 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl border border-primary bg-primary">
            <Plus className="h-7 w-7 text-black" strokeWidth={3} />
          </div>
        </Link>
      </div>

      <Link href="/order" className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full flex-col gap-1 rounded-lg py-2 text-[11px] font-semibold",
            pathname === "/order"
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              : "text-slate-500",
          )}
        >
          <ClipboardList className="h-5 w-5" />
          <span>จัดซื้อ</span>
        </Button>
      </Link>

      <Link href="/buy/history" className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full flex-col gap-1 rounded-lg py-2 text-[11px] font-semibold",
            pathname === "/buy/history"
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
              : "text-slate-500",
          )}
        >
          <History className="h-5 w-5" />
          <span>ประวัติ</span>
        </Button>
      </Link>
    </div>
  );
}
