"use client";

import { useState, useEffect } from "react";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Package,
  ShoppingBag,
  Check,
  Store,
  Loader2,
} from "lucide-react";
import { useLiff } from "@/lib/liff";
import { useOrders } from "@/hooks/useOrders";
import { useSettings } from "@/hooks/useSettings";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const { profile } = useLiff();
  const { createOrder } = useOrders();
  const { settings, loading: settingsLoading } = useSettings();

  const [step, setStep] = useState(1);
  const [store, setStore] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    qty: "",
    unit: "ชิ้น",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!settingsLoading && settings.units.length > 0 && !currentItem.unit) {
      setCurrentItem((prev) => ({ ...prev, unit: settings.units[0] }));
    }
  }, [settingsLoading, settings.units, currentItem.unit]);

  const addItem = () => {
    if (currentItem.name && currentItem.qty) {
      setItems([
        ...items,
        {
          ...currentItem,
          id: Date.now().toString(),
          qty: Number(currentItem.qty),
          status: "to_buy",
        },
      ]);
      setCurrentItem({
        name: "",
        qty: "",
        unit: settings.units[0] || "ชิ้น",
      });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!profile) {
      alert("Please login via LINE to submit an order.");
      return;
    }
    setSubmitting(true);
    try {
      await createOrder({
        requesterId: profile.userId,
        requesterName: profile.displayName,
        storeName: store,
        items,
        status: "pending",
      });
      setSuccess(true);
      setTimeout(() => router.push("/order"), 1800);
    } catch (error) {
      alert("Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl border border-primary bg-primary">
          <Check className="h-10 w-10 text-slate-950" strokeWidth={3} />
        </div>
        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
          ส่งคำขอเรียบร้อย
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          ระบบได้รับรายการของคุณแล้ว และจะพากลับไปหน้าหลักอัตโนมัติ
        </p>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <MobileHeader title="สร้างคำขอซื้อใหม่" />

      <div className="mx-auto max-w-md space-y-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-center",
                step >= s
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-400",
              )}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.12em]">
                Step {s}
              </div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-3.5">
            <div className="px-1">
              <div className="eyebrow mb-2">Store Information</div>
              <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-900">
                ระบุร้านค้าหรือแหล่งซื้อ
              </h2>
            </div>

            <Card className="space-y-4 border-slate-300 bg-white p-4">
              <div>
                <Label>ชื่อร้านค้า</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="เช่น โฮมโปร หรือร้านวัสดุก่อสร้าง"
                    className="pl-10"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5">
            <div className="px-1">
              <div className="eyebrow mb-2">Order Items</div>
              <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-900">
                เพิ่มรายการสินค้า
              </h2>
            </div>

            <Card className="space-y-4 border-slate-300 bg-white p-4">
              <div>
                <Label>ชื่อสินค้า</Label>
                <Input
                  placeholder="ระบุชื่อสินค้า"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label>จำนวน</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={currentItem.qty}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, qty: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>หน่วย</Label>
                  <Select
                    value={currentItem.unit}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, unit: e.target.value })
                    }
                  >
                    {settings.units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4" />
                เพิ่มเข้ารายการ
              </Button>
            </Card>

            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-500">ยังไม่มีสินค้าในรายการ</p>
                </div>
              ) : (
                items.map((item) => (
                  <Card
                    key={item.id}
                    className="flex items-center justify-between border-slate-300 bg-white p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                        <Package className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                          {item.qty} {item.unit}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-md border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3.5">
            <div className="px-1">
              <div className="eyebrow mb-2">Review</div>
              <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-900">
                ตรวจสอบก่อนส่งคำขอ
              </h2>
            </div>

            <Card className="space-y-4 border-slate-300 bg-white p-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div className="eyebrow mb-2">ร้านค้า</div>
                <div className="text-sm font-semibold text-slate-900">{store}</div>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5"
                  >
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {item.qty} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4">
        <div className="mx-auto flex max-w-md gap-2.5 rounded-xl border border-slate-300 bg-white p-2.5">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} className="px-4">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !store) || (step === 2 && items.length === 0)}
              className="flex-1"
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  ส่งคำขอซื้อ
                  <ShoppingBag className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
