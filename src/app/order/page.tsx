"use client";

import React, { useEffect, useState } from "react";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button, cn } from "@/components/ui/Button";
import { Card } from "@/components/ui/FormElements";
import {
  Package,
  Loader2,
  UserX,
  XCircle,
  RotateCcw,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
} from "lucide-react";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { Modal } from "@/components/ui/Modal";
import { Order, Item } from "@/types";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", color: "border-amber-200 bg-amber-50 text-amber-700" },
  buying: { label: "กำลังซื้อ", color: "border-blue-200 bg-blue-50 text-blue-700" },
  sorting: { label: "กำลังคัดแยก", color: "border-violet-200 bg-violet-50 text-violet-700" },
  completed: { label: "เสร็จสิ้น", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "ยกเลิก", color: "border-red-200 bg-red-50 text-red-700" },
};

export default function OrderSupportPage() {
  const { buyer, loading: authLoading } = useBuyerAuth();
  const { orders, loading: ordersLoading, updateItemStatus, updateOrderStatus, updateOrder } =
    useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const router = useRouter();

  useEffect(() => {
    if (selectedOrder) {
      setNoteText(selectedOrder.note || "");
    }
  }, [selectedOrder]);

  const handleSaveNote = async () => {
    if (!selectedOrder) return;
    await updateOrder(selectedOrder.id, { note: noteText });
    setSelectedOrder({ ...selectedOrder, note: noteText });
  };

  const handleUpdateItemStatus = async (
    itemIndex: number,
    newStatus: Item["status"],
  ) => {
    if (!selectedOrder) return;

    const currentItems = selectedOrder.items || [];
    const newItems = [...currentItems];
    if (newItems[itemIndex]) {
      newItems[itemIndex] = { ...newItems[itemIndex], status: newStatus };
    }

    await updateItemStatus(selectedOrder.id, newItems);
    setSelectedOrder({ ...selectedOrder, items: newItems });

    const isProcessed = (i: Item) =>
      i.status === "bought" || i.status === "cancelled" || i.status === "out_of_stock";
    const hasBoughtAll = newItems.every(isProcessed);
    const hasStartedBuying = newItems.some(isProcessed);

    if (hasBoughtAll && selectedOrder.status !== "sorting" && selectedOrder.status !== "completed") {
      await updateOrderStatus(selectedOrder.id, "sorting");
    } else if (hasStartedBuying && selectedOrder.status === "pending") {
      await updateOrderStatus(selectedOrder.id, "buying");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-300 bg-white">
          <UserX className="h-10 w-10 text-slate-300" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            สำหรับเจ้าหน้าที่ที่จัดซื้อและอัปเดตสถานะออร์เดอร์
          </p>
        </div>
        <Button onClick={() => router.push("/order/login")} className="w-full max-w-sm">
          เข้าสู่ระบบเจ้าหน้าที่
        </Button>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );
  const completedOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "cancelled",
  );
  const displayOrders = activeTab === "active" ? activeOrders : completedOrders;

  return (
    <div className="mx-auto max-w-md space-y-4 pb-20">
      <MobileHeader title="หน้าจัดซื้อ" userName={buyer.name} />

      <div className="flex rounded-lg border border-slate-300 bg-white p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm transition-colors",
            activeTab === "active"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          งานค้าง ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm transition-colors",
            activeTab === "history"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
          )}
        >
          ประวัติ ({completedOrders.length})
        </button>
      </div>

      <div className="px-1">
        <div className="eyebrow mb-2">
          {activeTab === "active" ? "Open Workload" : "Processed Orders"}
        </div>
        <h2 className="text-[1.7rem] font-semibold tracking-[-0.03em] text-slate-900">
          {activeTab === "active" ? "รายการที่ต้องจัดซื้อ" : "ออร์เดอร์ย้อนหลัง"}
        </h2>
      </div>

      <div className="space-y-2.5">
        {ordersLoading ? (
          <div className="flex min-h-[220px] items-center justify-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">ยังไม่มีรายการในส่วนนี้</p>
          </div>
        ) : (
          displayOrders.map((order) => {
            const status =
              STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
            const items = order.items || [];
            const itemCount = items.length;
            const progress = items.filter((i) =>
              ["bought", "cancelled", "out_of_stock"].includes(i.status),
            ).length;

            return (
              <Card
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="cursor-pointer border-slate-300 bg-white p-3.5 transition-colors hover:border-slate-900"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className={cn("status-chip", status.color)}>{status.label}</span>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {progress}/{itemCount}
                  </div>
                </div>

                <div className="mb-3 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{
                      width: `${itemCount > 0 ? (progress / itemCount) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold tracking-[-0.02em] text-slate-900">
                      {order.storeName || "ไม่ระบุร้านค้า"}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      ผู้สั่ง: {order.requesterName || "-"}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.storeName || "จัดการรายการสินค้า"}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="eyebrow mb-2">Location</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedOrder.location || "ไม่ระบุ"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {(selectedOrder.items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-white p-3.5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        {item.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {item.qty} {item.unit}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "status-chip",
                        item.status === "bought"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : item.status === "cancelled"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-slate-200 bg-slate-50 text-slate-600",
                      )}
                    >
                      {item.status === "bought"
                        ? "เรียบร้อย"
                        : item.status === "cancelled"
                          ? "ไม่มี"
                          : "รอซื้อ"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleUpdateItemStatus(idx, "to_buy")}
                      className={cn(
                        "rounded-md border px-3 py-2.5 text-xs uppercase tracking-[0.08em] transition-colors",
                        item.status === "to_buy" || !item.status
                          ? "border-amber-300 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                      )}
                    >
                      <RotateCcw className="mx-auto mb-1 h-4 w-4" />
                      รอซื้อ
                    </button>
                    <button
                      onClick={() => handleUpdateItemStatus(idx, "cancelled")}
                      className={cn(
                        "rounded-md border px-3 py-2.5 text-xs uppercase tracking-[0.08em] transition-colors",
                        item.status === "cancelled"
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                      )}
                    >
                      <XCircle className="mx-auto mb-1 h-4 w-4" />
                      ไม่มี
                    </button>
                    <button
                      onClick={() => handleUpdateItemStatus(idx, "bought")}
                      className={cn(
                        "rounded-md border px-3 py-2.5 text-xs uppercase tracking-[0.08em] transition-colors",
                        item.status === "bought"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300",
                      )}
                    >
                      <Check className="mx-auto mb-1 h-4 w-4" />
                      ซื้อแล้ว
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-slate-400" />
                หมายเหตุถึงผู้ขอซื้อ
              </div>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                placeholder="บันทึกข้อมูลเพิ่มเติม เช่น ไม่มีสินค้าบางรายการ หรือเสนอสินค้าทดแทน"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={handleSaveNote}
              />
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={async () => {
                  await updateOrderStatus(selectedOrder.id, "completed");
                  setSelectedOrder(null);
                }}
                className="w-full"
              >
                ปิดงานออร์เดอร์นี้
              </Button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full text-sm text-slate-500"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
