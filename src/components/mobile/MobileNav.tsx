"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ClipboardList,
  History,
  LogOut,
  Plus,
  ShoppingCart,
  User,
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { useBuyerAuth } from "@/context/BuyerContext";

export default function MobileHeader({
  title = "POWERTECH LIMITED",
  userName = "ผู้ใช้งานระบบ",
  userAvatar,
  userRole = "ผู้ใช้งานระบบ",
  onBack,
}: {
  title?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  onBack?: () => void;
}) {
  const { logout } = useBuyerAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImageFailed(false);
  }, [userAvatar]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className="sticky top-0 z-40 mx-auto -mx-4 max-w-md border-b-2 border-primary/20 bg-white px-4 py-2.5">
      {/* Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-emerald-500 rounded-t-xl" />
      
      <div className="flex items-center justify-between gap-3 mt-1">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-0.5">
              Powertech Ltd.
            </div>
            <div className="truncate text-sm font-bold text-slate-900 leading-tight">
              {title}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="min-w-0 text-right">
            <div className="truncate text-[12px] font-bold text-slate-900 leading-none">
              {userName}
            </div>
            <div className="truncate text-[10px] font-medium text-slate-400 mt-0.5">{userRole}</div>
          </div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 transition-all hover:border-primary/50"
            >
              {userAvatar && !imageFailed ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  onError={() => setImageFailed(true)}
                  unoptimized
                />
              ) : (
                <User className="h-4 w-4 text-slate-300" />
              )}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </button>
              </div>
            )}
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
