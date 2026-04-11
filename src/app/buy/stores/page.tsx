"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { useStores } from "@/hooks/useStores";
import { Button } from "@/components/ui/Button";
import { Card, Input } from "@/components/ui/FormElements";
import { getStoreMapLink, getStoreOrderSeed, getStorePhoneLink } from "@/lib/storeUtils";
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
    const q = searchTerm.toLowerCase();
    return (
      store.name.toLowerCase().includes(q) ||
      store.type?.toLowerCase().includes(q) ||
      store.location?.toLowerCase().includes(q)
    );
  });

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
    <div className="mx-auto max-w-md space-y-5 pb-12">
      <MobileHeader
        title="รายชื่อร้านค้า"
        userName={buyer.name}
        onBack={() => router.push("/buy")}
      />

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ค้นหาชื่อร้านค้า หรือพื้นที่"
            className="h-11 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="eyebrow mb-2">Available Stores</div>
            <div className="text-sm text-slate-500">{filteredStores.length} ร้านค้าในระบบ</div>
          </div>
          <Link href="/buy/stores/new">
            <Button variant="accent" size="sm" className="px-4">
              <Plus className="h-4 w-4" />
              เพิ่มร้านค้าใหม่
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">กำลังโหลดข้อมูลร้านค้า...</span>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Store className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-900">ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
              <p className="mt-1 text-xs text-slate-500">
                คุณสามารถเพิ่มร้านค้าใหม่เข้าระบบได้ทันที
              </p>
            </div>
          ) : (
            filteredStores.map((store) => {
              const mapLink = getStoreMapLink(store);
              const phoneLink = getStorePhoneLink(store);

              return (
                <Card
                  key={store.id}
                  onClick={() => handleOpenStore(store.id)}
                  className="cursor-pointer space-y-4 border-slate-300 bg-white p-4 transition-colors hover:border-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base text-slate-900">{store.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                        {store.type || "ทั่วไป"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenStore(store.id);
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{store.location || "ไม่ระบุสถานที่"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{store.phone || "ไม่ระบุเบอร์โทร"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={phoneLink || "#"}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!phoneLink) event.preventDefault();
                      }}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                        phoneLink
                          ? "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                          : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                      โทร
                    </a>

                    <a
                      href={mapLink || "#"}
                      target={mapLink ? "_blank" : undefined}
                      rel={mapLink ? "noreferrer" : undefined}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!mapLink) event.preventDefault();
                      }}
                      className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors ${
                        mapLink
                          ? "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                          : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      แผนที่
                    </a>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectStore(store);
                      }}
                      className="flex items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 py-2 text-xs text-slate-950 transition-colors hover:border-[#c7ef36] hover:bg-[#c7ef36]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      สั่งซื้อ
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

