"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/components/ui/Button";
import {
  getStoreMapLink,
  getStoreOrderSeed,
  getStorePhoneLink,
} from "@/lib/storeUtils";
import {
  Store,
  MapPin,
  Phone,
  Navigation,
  ShoppingCart,
  Loader2,
  Building2,
  ChevronLeft,
  Link2,
} from "lucide-react";

export default function StoreDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { stores, loading } = useStores();
  const { resetOrder, setOrderData } = useOrderContext();

  const store = useMemo(
    () => stores.find((item) => item.id === params.id),
    [params.id, stores],
  );

  if (!buyer) return null;

  const handleOrder = () => {
    if (!store) return;
    resetOrder();
    setOrderData((prev) => ({
      ...prev,
      ...getStoreOrderSeed(store),
    }));
    router.push("/buy/new/items");
  };

  const mapLink = store ? getStoreMapLink(store) : "";
  const phoneLink = store ? getStorePhoneLink(store) : "";

  return (
    <div className="mx-auto max-w-md space-y-4 pb-20">
      <MobileHeader
        title={store?.name || "ข้อมูลร้านค้า"}
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy/stores")}
      />

      {loading ? (
        <div className="flex animate-pulse flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
          <p className="mt-4 text-[12px] font-black tracking-[0.2em]">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      ) : !store ? (
        <div className="mx-2 space-y-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Store className="h-8 w-8 text-slate-200" />
          </div>
          <div className="space-y-1">
            <div className="text-[17px] font-black text-slate-900">
              ไม่พบร้านค้าในระบบ
            </div>
            <p className="text-[13px] text-slate-400">DATA NOT FOUND</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/buy/stores")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-black text-white transition-all active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับไปรายการร้านค้า
          </button>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-2 fade-in space-y-3 px-2 duration-300">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-slate-950 shadow-inner">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="mb-1 truncate text-[18px] font-black leading-tight text-slate-900">
                  {store.name}
                </h1>
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-black text-slate-500">
                  {store.type || "ทั่วไป"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                    ที่อยู่ร้านค้า
                  </span>
                  <span className="break-words text-[13px] leading-snug text-slate-900">
                    {store.location || "ไม่ระบุที่อยู่ร้านค้า"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                    เบอร์ติดต่อ
                  </span>
                  <span className="text-[13px] text-slate-900">
                    {store.phone || "ไม่ระบุเบอร์ติดต่อ"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <ShoppingCart className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                    ยอดออร์เดอร์
                  </span>
                  <span className="text-[13px] text-slate-900">
                    {store.orders || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <Link2 className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <span className="mb-1 block text-[10px] font-black uppercase tracking-wide text-slate-400">
                    ลิงก์แผนที่
                  </span>
                  <span className="break-all text-[13px] leading-snug text-slate-900">
                    {store.mapUrl || "ไม่ระบุลิงก์แผนที่"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={phoneLink || "#"}
              onClick={(event) => {
                if (!phoneLink) event.preventDefault();
              }}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-[12px] font-black transition-all active:scale-95",
                phoneLink
                  ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
              )}
            >
              <Phone className="h-4 w-4" />
              ติดต่อ
            </a>

            <a
              href={mapLink || "#"}
              target={mapLink ? "_blank" : undefined}
              onClick={(event) => {
                if (!mapLink) event.preventDefault();
              }}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-xl border-2 text-[12px] font-black transition-all active:scale-95",
                mapLink
                  ? "border-slate-200 bg-white text-slate-900 shadow-sm"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
              )}
            >
              <Navigation className="h-4 w-4" />
              แผนที่
            </a>

            <button
              type="button"
              onClick={handleOrder}
              className="col-span-2 mt-1 flex h-14 items-center justify-center gap-3 rounded-xl border-b-4 border-slate-900/10 bg-primary text-[14px] font-black text-slate-950 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="h-5 w-5" />
              สร้างออร์เดอร์ใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
