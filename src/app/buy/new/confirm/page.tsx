"use client";

import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Card, Label } from "@/components/ui/FormElements";
import { useOrderContext } from "@/context/OrderContext";
import { useRouter } from "next/navigation";
import { useBuyerAuth } from "@/context/BuyerContext";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { useState } from "react";
import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";

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
            location: orderData.location || "",
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
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        requesterId: buyer.id,
        requesterName: buyer.name,
        requesterUsername: buyer.username || "",
      });

      resetOrder();
      router.push("/buy");
    } catch (err) {
      console.error(err);
      alert("Failed to send order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 pb-12">
      <MobileHeader title="ยืนยันคำขอซื้อ" userName={buyer.name} />

      <div className="px-1">
        <div className="eyebrow mb-2">Step 3 of 3</div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
          ตรวจสอบก่อนส่งคำขอ
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          ตรวจข้อมูลร้านค้า รายการสินค้า และเพิ่มหมายเหตุถ้าจำเป็น
        </p>
      </div>

      <Card className="space-y-5 border-slate-300 bg-white p-5">
        <div className="grid gap-4 border-b border-slate-200 pb-5">
          <div>
            <Label>ร้านค้าที่ต้องการซื้อ</Label>
            <div className="text-sm text-slate-900">
              {orderData.storeName || "ไม่ระบุ"}
            </div>
          </div>
          <div>
            <Label>สถานที่จัดส่ง</Label>
            <div className="text-sm text-slate-900">
              {orderData.location || "ไม่ระบุ"}
            </div>
          </div>
          <div>
            <Label>ข้อมูลผู้ติดต่อ</Label>
            <div className="text-sm text-slate-900">
              {orderData.contact || "ไม่ระบุ"}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="mb-0">รายการสินค้า</Label>
            <div className="text-xs text-slate-500">
              {orderData.items.length} รายการ
            </div>
          </div>

          <div className="space-y-2">
            {orderData.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="text-sm text-slate-900">{item.name}</div>
                <div className="text-xs text-slate-500">
                  {item.quantity} {item.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>หมายเหตุเพิ่มเติม</Label>
          <textarea
            placeholder="ข้อมูลเพิ่มเติมสำหรับผู้จัดซื้อ"
            className="min-h-[96px] w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            value={orderData.note}
            onChange={(e) =>
              setOrderData({ ...orderData, note: e.target.value })
            }
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={() => router.push("/buy/new/items")}
          variant="secondary"
          className="flex-1"
        >
          ย้อนกลับ
        </Button>
        <Button
          variant="accent"
          disabled={submitting}
          onClick={handleSendOrder}
          className="flex-[1.5]"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              ส่งคำขอซื้อ
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
