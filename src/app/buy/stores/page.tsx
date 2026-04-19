"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { useStores } from "@/hooks/useStores";
import { cn } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormElements";
import {
  getStoreMapLink,
  getStoreOrderSeed,
  getStorePhoneLink,
} from "@/lib/storeUtils";
import {
  Store,
  MapPin,
  Phone,
  Search,
  ChevronRight,
  Loader2,
  Plus,
  Navigation,
  ShoppingCart,
  Building2,
} from "lucide-react";
import { NetworkStore } from "@/types";

export default function StoreListPage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { stores, loading } = useStores();
  const { setOrderData, resetOrder } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");

  if (!buyer) return null;

  const filteredStores = stores.filter((store) => {
    const query = searchTerm.toLowerCase();
    return (
      store.name.toLowerCase().includes(query) ||
      store.type?.toLowerCase().includes(query) ||
      store.location?.toLowerCase().includes(query)
    );
  });

  const totalOrders = stores.reduce((sum, store) => sum + (store.orders || 0), 0);

  const handleSelectStore = (store: NetworkStore) => {
    resetOrder();
    setOrderData((prev) => ({
      ...prev,
      ...getStoreOrderSeed(store),
    }));
    router.push("/buy/new/items");
  };

  const handleOpenStore = (storeId: string) => {
    router.push(`/buy/stores/${storeId}`);
  };

  return (
    <div className="mx-auto max-w-md space-y-3 pb-20">
      <MobileHeader
        title="ระบบจัดการร้านค้า"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy")}
      />

      <div className="grid grid-cols-2 gap-2 px-1">
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-3.5 py-2.5 transition-all">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-950">
            ร้านค้าทั้งหมด
          </div>
          <div className="text-lg font-bold text-slate-950">{stores.length}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition-all">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-950">
            ออร์เดอร์สะสม
          </div>
          <div className="text-lg font-bold text-slate-950">{totalOrders}</div>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="group relative">
          <div className="absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center justify-center">
            <Search className="h-4 w-4 text-slate-500 transition-colors group-focus-within:text-slate-700" />
          </div>
          <Input
            placeholder="ค้นหาชื่อร้านค้า ประเภท หรือที่อยู่ร้าน..."
            className="h-11 rounded-xl border-2 border-slate-200 bg-white pl-10 text-sm font-semibold text-slate-950 shadow-sm transition-all placeholder:text-slate-500 focus:border-slate-400 focus:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Link href="/buy/stores/new" className="block">
          <div className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold leading-tight text-white">
                  เพิ่มร้านค้าใหม่
                </div>
                <div className="text-xs font-semibold uppercase leading-none tracking-widest text-white/70">
                  Register New Partner
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-white/30" />
          </div>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 border-b border-slate-100 px-2 pb-1.5 pt-1">
          <Building2 className="h-3 w-3 text-slate-600" />
          <h2 className="text-xs font-bold uppercase leading-none tracking-[0.2em] text-slate-950">
            รายชื่อร้านค้า
          </h2>
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <div className="animate-in fade-in flex flex-col items-center justify-center py-20 text-slate-400 transition-all">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="mt-4 text-sm font-semibold leading-none tracking-widest text-slate-700">
                กำลังโหลดข้อมูลชั่วคราว...
              </p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="animate-in zoom-in-95 mx-1 rounded-2xl border-2 border-dashed border-slate-200 bg-white/70 py-20 text-center duration-300">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                <Store className="h-8 w-8 text-slate-200" />
              </div>
              <p className="text-lg font-bold text-slate-950 underline decoration-primary decoration-4 underline-offset-4">
                ไม่พบร้านค้าในระบบ
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-700">
                ลองค้นหาด้วยคำอื่น หรือเพิ่มร้านค้าใหม่
              </p>
            </div>
          ) : (
            filteredStores.map((store) => {
              const mapLink = getStoreMapLink(store);
              const phoneLink = getStorePhoneLink(store);

              return (
                <div
                  key={store.id}
                  onClick={() => handleOpenStore(store.id)}
                  className="animate-in slide-in-from-bottom-2 relative mx-1 cursor-pointer select-none rounded-xl border border-slate-200 border-l-4 border-l-primary bg-white p-3 shadow-sm transition-all duration-300 active:scale-[0.99] hover:border-slate-400"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 truncate text-lg font-bold leading-tight text-slate-950">
                        {store.name}
                      </div>
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase leading-none tracking-widest text-slate-700">
                        {store.type || "ทั่วไป"}
                      </span>
                    </div>

                    <div className="flex shrink-0 gap-1.5">
                      <a
                        href={phoneLink || "#"}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!phoneLink) event.preventDefault();
                        }}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg border transition-all active:scale-90",
                          phoneLink
                            ? "border-slate-200 bg-white text-slate-600 shadow-sm"
                            : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-200",
                        )}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>

                      <a
                        href={mapLink || "#"}
                        target={mapLink ? "_blank" : undefined}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!mapLink) event.preventDefault();
                        }}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg border transition-all active:scale-90",
                          mapLink
                            ? "border-slate-200 bg-white text-slate-600 shadow-sm"
                            : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-200",
                        )}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-4 border-t border-slate-100 pt-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-950">
                            ที่อยู่ร้านค้า
                          </div>
                          <div className="truncate text-sm font-semibold leading-snug text-slate-800">
                            {store.location || "ไม่ระบุที่อยู่ร้านค้า"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="h-3 w-3 shrink-0 text-slate-300" />
                        <span className="text-sm font-semibold leading-none text-slate-800">
                          {store.phone || "ไม่ระบุเบอร์ติดต่อ"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <ShoppingCart className="h-3 w-3 shrink-0 text-slate-300" />
                        <span className="text-sm font-semibold leading-none text-slate-800">
                          ออร์เดอร์สะสม {store.orders || 0}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectStore(store);
                      }}
                      className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-primary bg-primary px-4 text-slate-950 shadow-md shadow-primary/20 transition-all active:scale-95 hover:bg-[#b0f53d]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span className="text-sm font-bold tracking-tight">
                        สั่งสินค้า
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
