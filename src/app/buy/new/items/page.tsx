"use client";

import { useEffect, useState } from "react";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { useOrderContext } from "@/context/OrderContext";
import { useSettings } from "@/hooks/useSettings";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Package, ChevronRight } from "lucide-react";

export default function AddItemsPage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const { orderData, setOrderData } = useOrderContext();

  const [newItem, setNewItem] = useState({ name: "", quantity: "", unit: "" });

  useEffect(() => {
    if (!settingsLoading && settings.units.length > 0 && !newItem.unit) {
      setNewItem((prev) => ({ ...prev, unit: settings.units[0] }));
    }
  }, [settingsLoading, settings.units, newItem.unit]);

  if (!buyer) return null;

  const addItem = () => {
    if (!newItem.name || !newItem.quantity) return;

    setOrderData({
      ...orderData,
      items: [...orderData.items, newItem],
    });
    setNewItem({
      name: "",
      quantity: "",
      unit: settings.units[0] || "",
    });
  };

  const removeItem = (idx: number) => {
    setOrderData({
      ...orderData,
      items: orderData.items.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-12">
      <MobileHeader
        title="รายการที่ต้องซื้อ"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy/new")}
      />

      <div className="px-1.5 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-1.5 w-8 rounded-full bg-slate-900" />
             <div className="h-1.5 w-8 rounded-full bg-slate-900" />
             <div className="h-1.5 w-8 rounded-full bg-slate-100" />
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-slate-900 leading-tight">
            ระบุชื่อสินค้าที่จะสั่งซื้อ
          </h2>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest leading-none mt-2">
            กรอกสินค้าทีละรายการและจำนวนที่ต้องการ
          </p>
        </div>

        <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-5 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-0.5">ระบุชื่อสินค้า (Item Description)</label>
            <input
              placeholder="เช่น ปูนตราเสือ, เหล็ก 4 หุน..."
              className="h-12 w-full px-4 rounded-xl border-2 border-slate-50 bg-slate-50/50 text-sm font-bold text-slate-950 outline-none shadow-sm"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-0.5">จำนวน (Qty)</label>
              <input
                type="number"
                placeholder="0"
                className="h-12 w-full px-4 rounded-xl border-2 border-slate-50 bg-slate-50/50 text-sm font-bold text-slate-950 outline-none shadow-sm"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-0.5">หน่วยนับ (Unit)</label>
              <select
                className="h-12 w-full px-4 rounded-xl border-2 border-slate-50 bg-slate-50/50 text-sm font-bold text-slate-950 outline-none appearance-none shadow-sm"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              >
                {settings.units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
             onClick={addItem} 
             className="w-full h-12 rounded-xl bg-slate-900 text-white text-[14px] font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/15 uppercase tracking-widest"
          >
            <Plus className="h-5 w-5 stroke-[3px]" />
            เพิ่มเข้ารายการ
          </button>
        </div>

        <div className="space-y-3 pt-2">
           <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600 leading-none">รายการที่เพิ่มแล้ว ({orderData.items.length})</span>
           </div>

           <div className="space-y-2">
             {orderData.items.length === 0 ? (
               <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-white/50 py-12 text-center">
                 <Package className="mx-auto mb-3 h-10 w-10 text-slate-200" />
                 <p className="text-[13px] font-black text-slate-500 uppercase tracking-widest">เพิ่มสินค้าก่อนไปต่อ</p>
               </div>
             ) : (
               orderData.items.map((item, index) => (
                 <div
                   key={`${item.name}-${index}`}
                   className="flex items-center justify-between rounded-xl border-2 border-slate-50 bg-white p-4 shadow-sm group animate-in slide-in-from-right-3 duration-300"
                 >
                   <div className="min-w-0">
                     <div className="truncate text-base font-bold text-slate-950 leading-tight mb-1 uppercase tracking-tight">{item.name}</div>
                     <div className="text-xs font-bold text-slate-600 bg-slate-50 inline-block px-2.5 py-1 rounded-md border border-slate-100 uppercase tracking-widest">
                       {item.quantity} {item.unit}
                     </div>
                   </div>
                   <button
                     onClick={() => removeItem(index)}
                     className="h-10 w-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-[0.9]"
                   >
                     <Trash2 className="h-5 w-5" />
                   </button>
                 </div>
               ))
             )}
           </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.push("/buy/new")}
            className="flex-1 h-14 rounded-2xl border-2 border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] uppercase tracking-widest"
          >
            ย้อนกลับ
          </button>
          <button
            disabled={orderData.items.length === 0}
            onClick={() => router.push("/buy/new/confirm")}
            className="flex-[1.5] h-14 rounded-2xl bg-slate-900 text-white text-[15px] font-black shadow-lg shadow-slate-900/15 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-[0.1em] flex items-center justify-center gap-2"
          >
            ไปหน้ายืนยัน
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
