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
import { Phone, Navigation, ShoppingCart } from "lucide-react";

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
    <div className="mx-auto max-w-md pb-20 text-slate-950">
      <MobileHeader
        title={store?.name || "ข้อมูลร้านค้า"}
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy/stores")}
      />

      {loading ? (
        <div className="px-4 py-16">
          <p className="text-sm font-semibold text-slate-700">กำลังโหลดข้อมูล...</p>
        </div>
      ) : !store ? (
        <div className="space-y-4 px-4 pt-6 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-slate-950">
              ไม่พบร้านค้าในระบบ
            </div>
            <p className="text-xs font-semibold text-slate-700">DATA NOT FOUND</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/buy/stores")}
            className="flex h-11 w-full items-center justify-center rounded-md border border-slate-900 bg-slate-900 text-sm font-bold text-white"
          >
            กลับไปรายการร้านค้า
          </button>
        </div>
      ) : (
        <div className="space-y-5 px-4 pt-4">
          <div className="space-y-5">
            <div>
              <h1 className="truncate text-lg font-bold leading-tight text-slate-950">
                {store.name}
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {store.type || "ทั่วไป"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-950">
                    ที่อยู่ร้านค้า
                  </span>
                  <span className="mt-1 block break-words text-sm font-semibold leading-relaxed text-slate-800">
                    {store.location || "ไม่ระบุที่อยู่ร้านค้า"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-950">
                    เบอร์ติดต่อ
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {store.phone || "ไม่ระบุเบอร์ติดต่อ"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-950">
                    ยอดออร์เดอร์
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-800">
                    {store.orders || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-950">
                    ลิงก์แผนที่
                  </span>
                  <span className="mt-1 block break-all text-sm font-semibold leading-relaxed text-slate-800">
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
                "flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-bold",
                phoneLink
                  ? "border-slate-300 bg-white text-slate-950"
                  : "cursor-not-allowed border-slate-200 bg-white text-slate-400",
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
                "flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-bold",
                mapLink
                  ? "border-slate-300 bg-white text-slate-950"
                  : "cursor-not-allowed border-slate-200 bg-white text-slate-400",
              )}
            >
              <Navigation className="h-4 w-4" />
              แผนที่
            </a>

            <button
              type="button"
              onClick={handleOrder}
              className="col-span-2 mt-1 flex h-11 items-center justify-center gap-2 rounded-md border border-slate-900 bg-slate-900 text-sm font-bold text-white"
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
