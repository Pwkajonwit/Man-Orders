"use client";

import React, { useState } from "react";
import { useBuyerAuth } from "@/context/BuyerContext";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button, cn } from "@/components/ui/Button";
import {
  Package,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function PurchaseHistoryPage() {
  const { buyer } = useBuyerAuth();
  const { orders, loading } = useOrders("orderer", buyer?.id);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  if (!buyer) return null;

  const filteredOrders = orders.filter(
    (order) =>
      order.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  return (
    <div className="mx-auto max-w-md space-y-5 pb-24">
      <MobileHeader title="ประวัติการสั่งซื้อ" userName={buyer.name} onBack={() => router.push("/buy")} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาร้านค้า หรือสินค้า"
          className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3.5 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <div className="eyebrow mb-2">Order Archive</div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            ทั้งหมด {filteredOrders.length} รายการ
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">ไม่พบประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status =
              STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
            const firstItem = order.items?.[0];
            const itemCount = order.items?.length || 0;
            const date = order.createdAt?.seconds
              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })
              : "-";

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-4 text-left transition-colors hover:border-slate-900"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="eyebrow text-slate-500">{date}</span>
                  <span className={cn("status-chip", status.color)}>{status.label}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
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
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            );
          })
        )}
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
                <div className="eyebrow mb-2">วันที่สั่ง</div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedOrder.createdAt?.seconds
                    ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleString("th-TH")
                    : "-"}
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
                  หมายเหตุ
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
