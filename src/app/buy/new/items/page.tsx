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
    <div className="mx-auto max-w-md space-y-5 pb-12">
      <MobileHeader title="รายการสินค้า" userName={buyer.name} />

      <div className="px-1">
        <div className="eyebrow mb-2">Step 2 of 3</div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
          เพิ่มสินค้าที่ต้องการซื้อ
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          กรอกสินค้าแบบสั้น กระชับ และเพิ่มเข้ารายการได้ต่อเนื่อง
        </p>
      </div>

      <Card className="space-y-5 border-slate-300 bg-white p-5">
        <div>
          <Label>ชื่อสินค้า</Label>
          <Input
            placeholder="เช่น ปูนซีเมนต์ หรือ เหล็กเส้น"
            className="h-11"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>จำนวน</Label>
            <Input
              type="number"
              placeholder="0"
              className="h-11"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({ ...newItem, quantity: e.target.value })
              }
            />
          </div>
          <div>
            <Label>หน่วยนับ</Label>
            <Select
              className="h-11"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            >
              {settings.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Button variant="accent" onClick={addItem} className="w-full">
          <Plus className="h-4 w-4" />
          เพิ่มสินค้า
        </Button>
      </Card>

      <Card className="space-y-4 border-slate-300 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow mb-2">Selected Items</div>
            <div className="text-sm text-slate-900">
              ทั้งหมด {orderData.items.length} รายการ
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {orderData.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">ยังไม่มีสินค้าในรายการ</p>
            </div>
          ) : (
            orderData.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-slate-900">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.quantity} {item.unit}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="rounded-md border border-transparent p-2 text-red-500 transition-colors hover:border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          onClick={() => router.push("/buy/new")}
          variant="secondary"
          className="flex-1"
        >
          ย้อนกลับ
        </Button>
        <Button
          disabled={orderData.items.length === 0}
          onClick={() => router.push("/buy/new/confirm")}
          className="flex-[1.4]"
        >
          ถัดไป
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
