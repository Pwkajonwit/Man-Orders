"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { useStores } from "@/hooks/useStores";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/FormElements";
import { getStoreMapLink, getStoreOrderSeed, getStorePhoneLink } from "@/lib/storeUtils";
import {
  Store,
  MapPin,
  Phone,
  Navigation,
  ShoppingCart,
  Loader2,
  Building2,
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
    <div className="mx-auto max-w-md space-y-4 pb-12">
      <MobileHeader
        title={store?.name || "ข้อมูลร้านค้า"}
        userName={buyer.name}
        onBack={() => router.push("/buy/stores")}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">กำลังโหลดข้อมูลร้านค้า...</span>
        </div>
      ) : !store ? (
        <Card className="space-y-4 border-slate-300 bg-white p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
            <Store className="h-6 w-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <div className="text-base text-slate-900">ไม่พบข้อมูลร้านค้า</div>
            <p className="text-sm text-slate-500">รายการนี้อาจถูกลบหรือยังไม่พร้อมใช้งาน</p>
          </div>
          <Button variant="secondary" onClick={() => router.push("/buy/stores")} className="w-full">
            กลับไปหน้ารายการร้านค้า
          </Button>
        </Card>
      ) : (
        <>
          <Card className="space-y-4 border-slate-300 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="eyebrow mb-2">Store Profile</div>
                <h1 className="text-xl text-slate-900">{store.name}</h1>
                <div className="mt-1 text-sm text-slate-500">{store.type || "ร้านค้าทั่วไป"}</div>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{store.location || "ไม่ระบุสถานที่"}</span>
              </div>
              <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{store.phone || "ไม่ระบุเบอร์โทร"}</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 border-slate-300 bg-white p-4">
            <div className="eyebrow">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={phoneLink || "#"}
                onClick={(event) => {
                  if (!phoneLink) event.preventDefault();
                }}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors ${
                  phoneLink
                    ? "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                    : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <Phone className="h-4 w-4" />
                โทรหาร้าน
              </a>

              <a
                href={mapLink || "#"}
                target={mapLink ? "_blank" : undefined}
                rel={mapLink ? "noreferrer" : undefined}
                onClick={(event) => {
                  if (!mapLink) event.preventDefault();
                }}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm transition-colors ${
                  mapLink
                    ? "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                    : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <Navigation className="h-4 w-4" />
                เปิดแผนที่
              </a>
            </div>

            <Button variant="accent" onClick={handleOrder} className="w-full">
              <ShoppingCart className="h-4 w-4" />
              สั่งซื้อจากร้านนี้
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
