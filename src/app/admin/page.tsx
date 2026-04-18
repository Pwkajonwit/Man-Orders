"use client";

import { Activity, Clock, Loader2, Package, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useOrders } from "@/hooks/useOrders";
import {
  AdminEmptyState,
  AdminPage,
  AdminSecondaryButton,
  AdminStatusChip,
} from "@/components/admin/AdminUI";

const statusMap = {
  pending: { label: "รอดำเนินการ", tone: "amber" as const },
  buying: { label: "กำลังจัดซื้อ", tone: "blue" as const },
  completed: { label: "เสร็จสิ้น", tone: "emerald" as const },
  cancelled: { label: "ยกเลิก", tone: "red" as const },
  sorting: { label: "ตรวจสอบ", tone: "slate" as const },
};

const formatDateOnly = (timestamp: any) => {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd MMM yy", { locale: th });
  } catch {
    return "-";
  }
};

const formatTimeOnly = (timestamp: any) => {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "HH:mm", { locale: th });
  } catch {
    return "-";
  }
};

const formatFullDate = (date: Date) => format(date, "EEEE, dd MMM yyyy", { locale: th });

const getOrderReference = (id: string) => `#${id.slice(-6).toUpperCase()}`;

const getTimestampValue = (timestamp: any) => {
  if (!timestamp) return 0;
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.getTime();
  } catch {
    return 0;
  }
};

export default function AdminDashboard() {
  const { orders, loading } = useOrders();
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const buyingCount = orders.filter((order) => order.status === "buying").length;
  const completedCount = orders.filter((order) => order.status === "completed").length;
  const cancelledCount = orders.filter((order) => order.status === "cancelled").length;
  const latestOrders = [...orders]
    .sort((a, b) => getTimestampValue(b.createdAt) - getTimestampValue(a.createdAt))
    .slice(0, 10);

  return (
    <AdminPage className="gap-5">
      <section className="relative overflow-hidden rounded-[20px] border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(255,228,155,0.42),transparent_34%),radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_28%),linear-gradient(135deg,#fffdf5_0%,#fff8df_45%,#f2fbf8_100%)] px-4 py-4 shadow-[0_22px_50px_-48px_rgba(120,113,108,0.45)] lg:px-5">
        <div className="relative z-10 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 shadow-sm">
              <Package className="h-3.5 w-3.5" />
              Admin Overview
            </div>
            <div className="space-y-1">
              <h1 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-slate-950 lg:text-[2rem]">ภาพรวมระบบ</h1>
              <p className="truncate text-sm text-slate-600">สรุปสถานะงานจัดซื้อและรายการล่าสุดในมุมมองเดียว</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
            <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ออร์เดอร์</div>
                  <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{orders.length}</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-50 text-slate-600">
                  <Package className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pending</div>
                  <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{pendingCount}</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-amber-200 bg-amber-50 text-amber-700">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Buying</div>
                  <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{buyingCount}</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-cyan-200 bg-cyan-50 text-cyan-700">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Closed</div>
                  <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{completedCount}</div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[150px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 text-right shadow-sm backdrop-blur">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">วันนี้</div>
              <div className="mt-1 text-sm font-medium text-slate-700">{formatFullDate(new Date())}</div>
              <div className="mt-1 text-xs text-slate-400">ยกเลิก {cancelledCount}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_40px_-42px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-end sm:justify-between lg:px-5">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Recent Orders</div>
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">รายการล่าสุด</h2>
            <p className="text-sm leading-6 text-slate-600">แสดง 10 รายการล่าสุดจากระบบในรูปแบบตาราง</p>
          </div>
          <AdminSecondaryButton
            onClick={() => (window.location.href = "/admin/orders")}
            className="h-10 rounded-[14px] border-slate-200 bg-white px-4 text-sm font-medium"
          >
            ดูทั้งหมด
          </AdminSecondaryButton>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-white">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  รหัส
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  ผู้ขอซื้อ
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  ร้านค้า
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  รายการสินค้า
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  สถานะ
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  เวลา
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">กำลังโหลดข้อมูล</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <AdminEmptyState
                      icon={ShoppingCart}
                      title="ยังไม่มีรายการสั่งซื้อ"
                      description="เมื่อมีการสร้างออร์เดอร์ใหม่ รายการล่าสุดจะแสดงที่หน้านี้"
                    />
                  </td>
                </tr>
              ) : (
                latestOrders.map((order) => {
                  const status = statusMap[order.status as keyof typeof statusMap] ?? statusMap.pending;

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                        <div className="font-mono text-sm font-semibold text-slate-800">{getOrderReference(order.id)}</div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-950">{order.requesterName || "-"}</div>
                          <div className="text-xs text-slate-500">{order.buyerName ? `ผู้จัดซื้อ: ${order.buyerName}` : "ยังไม่มอบหมายผู้จัดซื้อ"}</div>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                        <div className="text-sm font-medium text-slate-800">{order.storeName || "ทั่วไป"}</div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-800">{order.items.length} รายการ</div>
                          <div className="max-w-[280px] truncate text-xs text-slate-500">
                            {order.items.map((item) => item.name).join(", ")}
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                        <AdminStatusChip label={status.label} tone={status.tone} className="rounded-full px-3 py-1 text-[11px] font-medium" />
                      </td>
                      <td className="border-b border-slate-100 px-4 py-4 text-right align-middle lg:px-5">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-950">{formatTimeOnly(order.createdAt)} น.</div>
                          <div className="text-xs text-slate-500">{formatDateOnly(order.createdAt)}</div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPage>
  );
}
