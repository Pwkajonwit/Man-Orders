"use client";

import React, { useEffect, useRef, useState } from "react";
import { useBuyerAuth } from "@/context/BuyerContext";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Card, Input, Label } from "@/components/ui/FormElements";
import { useOrderContext } from "@/context/OrderContext";
import { useRouter } from "next/navigation";
import { useStores } from "@/hooks/useStores";
import {
  Store,
  Search,
  X,
  Check,
  Loader2,
  MapPin,
  Phone,
  ChevronRight,
} from "lucide-react";

export default function StoreInfoPage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { stores, loading: storesLoading } = useStores();
  const { orderData, setOrderData } = useOrderContext();

  const [searchTerm, setSearchTerm] = useState(orderData.storeName || "");
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!buyer) return null;

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStoreSelect = (storeId: string) => {
    const store = stores.find((item) => item.id === storeId);
    if (!store) return;

    setOrderData({
      ...orderData,
      storeId: store.id,
      storeName: store.name,
      storeLocation: store.location || "",
      mapUrl: store.mapUrl || "",
      contact: store.phone,
    });
    setSearchTerm(store.name);
    setShowResults(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(true);
    setOrderData({
      ...orderData,
      storeId: "",
      storeName: value,
      storeLocation: "",
      mapUrl: "",
      contact: "",
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    setShowResults(false);
    setOrderData({
      ...orderData,
      storeId: "",
      storeName: "",
      storeLocation: "",
      location: "",
      contact: "",
      mapUrl: "",
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-12">
      <MobileHeader
        title="ร้านค้าที่จะสั่งซื้อ"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy")}
      />

      <div className="px-1 space-y-4">
        <div className="relative" ref={dropdownRef}>
          <div className="mb-2 px-1">
             <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">ค้นหาร้านค้าที่เคยสั่ง</span>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-900" />
            <input
              placeholder="พิมพ์ชื่อร้านค้าที่ต้องการ..."
              className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-12 text-[15px] font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowResults(true)}
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {showResults && (searchTerm || filteredStores.length > 0) && (
            <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl scale-in-center">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                {filteredStores.length > 0
                   ? `ร้านค้าที่พบในระบบ (${filteredStores.length})`
                   : "ไม่พบข้อมูล กรุณากรอกด้านล่าง"}
              </div>

              {filteredStores.length > 0 ? (
                <div className="max-h-72 overflow-y-auto py-1">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onMouseDown={() => handleStoreSelect(store.id)}
                      className="flex w-full items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-bold text-slate-900 leading-tight">
                          {store.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                   <span className="truncate">
                            {store.location || "ไม่ระบุที่อยู่ร้าน"}
                          </span>
                        </div>
                      </div>
                      {orderData.storeId === store.id && (
                        <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                           <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center bg-white">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                     <Store className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-[14px] font-bold text-slate-900 mb-1">ยังไม่มีข้อมูลร้านนี้ในระบบ</p>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-[150px] mx-auto">
                    ระบบจะบันทึกร้านค้านี้ให้เป็นร้านใหม่ทันทีเมื่อจบงาน
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
           <div className="mb-1 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">รายละเอียดเพิ่มเติม</span>
           </div>

           <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-0.5">ชื่อร้านค้า (ระบุเองได้)</label>
             <input
               placeholder="ระบุชื่อร้านค้า"
               className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
               value={orderData.storeName}
               onChange={(e) =>
                 setOrderData({
                   ...orderData,
                   storeId: "",
                   storeName: e.target.value,
                   storeLocation: "",
                   mapUrl: "",
                 })
               }
             />
           </div>

           <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-0.5">เบอร์ติดต่อหรือแมสเซนเจอร์</label>
             <div className="relative">
               <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
               <input
                 placeholder="08X-XXX-XXXX"
                 className="h-12 w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                 value={orderData.contact}
                 onChange={(e) =>
                   setOrderData({ ...orderData, contact: e.target.value })
                 }
               />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-0.5">ที่อยู่ร้าน</label>
             <div className="relative">
               <MapPin className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
               <textarea
                 placeholder="ระบุที่อยู่ร้านค้า หรือเลือกร้านจากรายการด้านบน"
                 className="min-h-[88px] w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-bold text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                 value={orderData.storeLocation}
                 onChange={(e) =>
                   setOrderData({ ...orderData, storeLocation: e.target.value })
                 }
               />
             </div>
           </div>

        </div>

        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 h-14 rounded-2xl border-2 border-slate-300 bg-white text-sm font-black text-slate-700 shadow-sm transition-all active:scale-[0.98] uppercase tracking-widest hover:border-slate-400 hover:bg-slate-50"
            onClick={() => router.push("/buy")}
          >
            ยกเลิก
          </button>
          <button
            disabled={!orderData.storeName}
            onClick={() => router.push("/buy/new/items")}
            className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 bg-slate-900 text-[15px] font-black text-white shadow-lg shadow-slate-900/15 transition-all active:scale-[0.98] uppercase tracking-[0.1em] disabled:border-slate-300 disabled:bg-slate-300 disabled:opacity-100"
          >
            ถัดไป
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {storesLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">กำลังดาวน์โหลดข้อมูล</span>
          </div>
        </div>
      )}
    </div>
  );
}
