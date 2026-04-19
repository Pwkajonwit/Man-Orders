"use client";

import { useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import MobileHeader from "@/components/mobile/MobileNav";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useOrderContext } from "@/context/OrderContext";
import { db } from "@/lib/firebase";
import {
  buildNewOrderMessage,
  sendLineGroupNotification,
} from "@/lib/lineNotify";
import { useRouter } from "next/navigation";

export default function SummaryPage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { orderData, setOrderData, resetOrder } = useOrderContext();
  const [submitting, setSubmitting] = useState(false);

  if (!buyer) return null;

  const handleSendOrder = async () => {
    if (orderData.items.length === 0) return;

    setSubmitting(true);

    try {
      let finalStoreId = orderData.storeId;

      if (!finalStoreId && orderData.storeName) {
        const storesRef = collection(db, "stores");
        const storeQuery = query(
          storesRef,
          where("name", "==", orderData.storeName),
          limit(1),
        );
        const querySnapshot = await getDocs(storeQuery);

        if (!querySnapshot.empty) {
          finalStoreId = querySnapshot.docs[0].id;
        } else {
          const newStoreRef = await addDoc(collection(db, "stores"), {
            name: orderData.storeName,
            location: orderData.storeLocation || "",
            phone: orderData.contact || "",
            type: "ทั่วไป",
            orders: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          finalStoreId = newStoreRef.id;
        }
      }

      await addDoc(collection(db, "orders"), {
        ...orderData,
        items: orderData.items.map((item) => ({
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          name: item.name,
          qty: Number(item.quantity) || 0,
          unit: item.unit,
          status: "to_buy",
        })),
        storeId: finalStoreId,
        mapUrl: orderData.mapUrl || "",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requesterId: buyer.id,
        requesterName: buyer.name,
        requesterUsername: buyer.username || "",
      });

      try {
        const msg = buildNewOrderMessage({
          requesterName: buyer.name,
          storeName: orderData.storeName || "",
          storeLocation: orderData.storeLocation || "",
          location: orderData.location || "",
          contact: orderData.contact || "",
          note: orderData.note || "",
          mapUrl: orderData.mapUrl || "",
          itemCount: orderData.items.length,
          items: orderData.items.map((item) => ({
            name: item.name,
            qty: Number(item.quantity) || 0,
            unit: item.unit,
          })),
          mode: "new",
        });
        await sendLineGroupNotification("new_order", msg);
      } catch (notifyErr) {
        console.error("LINE notification error:", notifyErr);
      }

      resetOrder();
      router.push("/buy");
    } catch (err) {
      console.error(err);
      alert("ส่งคำสั่งซื้อไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-12">
      <MobileHeader
        title="ตรวจสอบและยืนยัน"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy/new/items")}
      />

      <div className="space-y-4 px-1.5">
        <div className="space-y-1">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-1.5 w-8 rounded-full bg-slate-900" />
            <div className="h-1.5 w-8 rounded-full bg-slate-900" />
            <div className="h-1.5 w-8 rounded-full bg-slate-900" />
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-950">
            ยืนยันรายการสั่งซื้อ
          </h2>
          <p className="text-sm font-semibold leading-relaxed text-slate-700">
            ตรวจสอบข้อมูลให้ถูกต้องก่อนส่งให้เจ้าหน้าที่จัดซื้อ
          </p>
        </div>

        <div className="space-y-5 rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-950">
                รายการสินค้า ({orderData.items.length})
              </span>
            </div>

            <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
              {orderData.items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center justify-between rounded-xl border-2 border-slate-50 bg-slate-50/50 p-3.5"
                >
                  <div className="mr-2 truncate text-sm font-bold leading-tight text-slate-950">
                    {item.name}
                  </div>
                  <div className="shrink-0 rounded-md border border-slate-100 bg-white px-2 py-0.5 text-xs font-bold text-slate-800">
                    {item.quantity} {item.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="px-0.5 text-xs font-bold uppercase tracking-widest text-slate-950">
              ที่อยู่จัดส่ง
            </label>
            <textarea
              placeholder="ระบุที่อยู่หรือจุดส่งของที่คนซื้อจะนำไปส่ง..."
              className="min-h-[100px] w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-950 outline-none ring-0 transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white"
              value={orderData.location}
              onChange={(e) =>
                setOrderData({ ...orderData, location: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="px-0.5 text-xs font-bold uppercase tracking-widest text-slate-950">
              หมายเหตุเพิ่มเติมถึงจัดซื้อ
            </label>
            <textarea
              placeholder="ระบุรายละเอียดเพิ่มเติมถ้ามี เช่น ยี่ห้อสำรอง หรือความเร่งด่วน..."
              className="min-h-[100px] w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-950 outline-none ring-0 transition-all placeholder:text-slate-500 focus:border-slate-300 focus:bg-white"
              value={orderData.note}
              onChange={(e) =>
                setOrderData({ ...orderData, note: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push("/buy/new/items")}
            className="flex-1 h-14 rounded-2xl border-2 border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800 transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            ย้อนกลับ
          </button>
          <button
            disabled={submitting || orderData.items.length === 0}
            onClick={handleSendOrder}
            className="flex h-14 flex-[1.8] items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-slate-900/15 transition-all active:scale-[0.98] disabled:grayscale disabled:opacity-30"
          >
            {submitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                ยืนยันส่งคำสั่งซื้อ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
