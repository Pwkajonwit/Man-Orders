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
      location: store.location,
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
    });
  };

  const handleClear = () => {
    setSearchTerm("");
    setShowResults(false);
    setOrderData({
      ...orderData,
      storeId: "",
      storeName: "",
      location: "",
      contact: "",
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-5 pb-12">
      <MobileHeader
        title="ข้อมูลร้านค้า"
        userName={buyer.name}
        onBack={() => router.push("/buy")}
      />

      <Card className="space-y-5 border-slate-300 bg-white p-5 overflow-visible">
        <div className="relative" ref={dropdownRef}>
          <Label>ค้นหาร้านค้า</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="พิมพ์ชื่อร้านค้า"
              className="h-11 pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowResults(true)}
            />
            {searchTerm && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showResults && (searchTerm || filteredStores.length > 0) && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] rounded-lg border border-slate-300 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                {filteredStores.length > 0
                  ? `ร้านค้าที่พบ ${filteredStores.length} รายการ`
                  : "ไม่พบร้านค้าที่ตรงกัน"}
              </div>

              {filteredStores.length > 0 ? (
                <div className="max-h-64 overflow-y-auto py-1">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onMouseDown={() => handleStoreSelect(store.id)}
                      className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-slate-900">
                          {store.name}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {store.location || "ไม่ระบุสถานที่"}
                          </span>
                        </div>
                      </div>
                      {orderData.storeId === store.id && (
                        <Check className="mt-0.5 h-4 w-4 text-slate-900" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-5 text-center">
                  <Store className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  <p className="text-sm text-slate-900">ใช้ชื่อที่พิมพ์เป็นร้านค้าใหม่</p>
                  <p className="mt-1 text-xs text-slate-500">
                    ระบบจะสร้างร้านค้าให้อัตโนมัติเมื่อยืนยันส่งคำขอ
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-slate-200 pt-5">
          <div>
            <Label>ชื่อร้านค้า</Label>
            <Input
              placeholder="ระบุชื่อร้านค้า"
              className="h-11"
              value={orderData.storeName}
              onChange={(e) =>
                setOrderData({ ...orderData, storeName: e.target.value })
              }
            />
          </div>

          <div>
            <Label>เบอร์โทรหรือผู้ติดต่อ</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ระบุเบอร์โทร"
                className="h-11 pl-10"
                value={orderData.contact}
                onChange={(e) =>
                  setOrderData({ ...orderData, contact: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>จุดรับของหรือสถานที่จัดส่ง</Label>
            <textarea
              placeholder="ระบุสถานที่รับของ"
              className="min-h-[96px] w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              value={orderData.location}
              onChange={(e) =>
                setOrderData({ ...orderData, location: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => router.push("/buy")}
        >
          ย้อนกลับ
        </Button>
        <Button
          className="flex-[1.4]"
          disabled={!orderData.storeName}
          onClick={() => router.push("/buy/new/items")}
        >
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {storesLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        </div>
      )}
    </div>
  );
}
