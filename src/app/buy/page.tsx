"use client";

import React, { useState } from "react";
import { useBuyerAuth } from "@/context/BuyerContext";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button, cn } from "@/components/ui/Button";
import { Card } from "@/components/ui/FormElements";
import {
  ShoppingCart,
  Store,
  Package,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { Modal } from "@/components/ui/Modal";
import { Order } from "@/types";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", color: "border-amber-200 bg-amber-50 text-amber-700" },
  buying: { label: "กำลังซื้อ", color: "border-blue-200 bg-blue-50 text-blue-700" },
  sorting: { label: "กำลังคัดแยก", color: "border-violet-200 bg-violet-50 text-violet-700" },
  completed: { label: "เสร็จสิ้น", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "ยกเลิก", color: "border-red-200 bg-red-50 text-red-700" },
};

export default function BuyerDashboard() {
  const { buyer } = useBuyerAuth();
  const { orders, loading } = useOrders("orderer", buyer?.id);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!buyer) return null;

  return (
    <div className="mx-auto max-w-md space-y-6 pb-12">
      <MobileHeader title="หน้าผู้สั่งซื้อ" userName={buyer.name} />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/buy/new">
          <button className="flex w-full items-center gap-3 rounded-lg border border-primary bg-primary px-4 py-4 text-left text-slate-950">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white/50">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">สร้างคำขอซื้อ</div>
              <div className="text-xs text-slate-700">เริ่มออร์เดอร์ใหม่</div>
            </div>
          </button>
        </Link>

        <Link href="/buy/stores">
          <button className="flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-4 text-left text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
              <Store className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-semibold">ร้านค้า</div>
              <div className="text-xs text-slate-500">รายชื่อคู่ค้า</div>
            </div>
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="eyebrow mb-2">Recent Orders</div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
              รายการล่าสุดของคุณ
            </h2>
          </div>
          <Link href="/buy/history" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            ดูทั้งหมด
          </Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Package className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">ยังไม่มีประวัติการสั่งซื้อ</p>
            </div>
          ) : (
            orders.slice(0, 10).map((order) => {
              const status =
                STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
              const firstItem = order.items?.[0];
              const itemCount = order.items?.length || 0;

              return (
                <Card
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer border-slate-300 bg-white p-4 transition-colors hover:border-slate-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold tracking-[-0.02em] text-slate-900">
                        {order.storeName || "ไม่ระบุร้านค้า"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {firstItem
                          ? `${firstItem.name}${itemCount > 1 ? ` และอีก ${itemCount - 1} รายการ` : ""}`
                          : "ไม่มีรายการสินค้า"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("status-chip", status.color)}>{status.label}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.storeName || "รายละเอียดออร์เดอร์"}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="eyebrow mb-2">Order Status</div>
                <span
                  className={cn(
                    "status-chip",
                    (STATUS_MAP[selectedOrder.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending).color,
                  )}
                >
                  {(STATUS_MAP[selectedOrder.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending).label}
                </span>
              </div>
              <div className="text-right">
                <div className="eyebrow mb-2">Items</div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedOrder.items.length} รายการ
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {selectedOrder.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {item.qty} {item.unit}
                    </div>
                  </div>
                  <div>
                    {item.status === "bought" ? (
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">เรียบร้อย</span>
                      </div>
                    ) : item.status === "cancelled" || item.status === "out_of_stock" ? (
                      <div className="flex items-center gap-1.5 text-red-700">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">ไม่มี</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.12em]">รอซื้อ</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedOrder.note && (
              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 text-slate-400" />
                  หมายเหตุจากผู้จัดซื้อ
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {selectedOrder.note}
                </div>
              </div>
            )}

            <Button onClick={() => setSelectedOrder(null)} className="w-full">
              ปิดหน้าต่าง
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
