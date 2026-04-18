"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Eye, FileText, History, Search, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  AdminEmptyState,
  AdminPage,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatusChip,
} from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types";

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

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd MMM yy, HH:mm", { locale: th });
  } catch {
    return "-";
  }
};

const formatFullDate = (date: Date) => format(date, "EEEE, dd MMM yyyy", { locale: th });

const getTimestampValue = (timestamp: any) => {
  if (!timestamp) return 0;
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.getTime();
  } catch {
    return 0;
  }
};

const getOrderReference = (order: Order) => `#${order.id.slice(-6).toUpperCase()}`;

const buildSearchText = (order: Order) =>
  [
    order.id,
    order.requesterName,
    order.requesterUsername,
    order.storeName,
    order.storeLocation,
    order.location,
    order.buyerName,
    order.note,
    ...order.items.map((item) => `${item.name} ${item.qty} ${item.unit}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const escapeCsvValue = (value: string | number) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export default function HistoryPage() {
  const { orders, loading } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const completedOrders = useMemo(
    () =>
      orders
        .filter((order) => order.status === "completed")
        .sort((a, b) => getTimestampValue(b.updatedAt) - getTimestampValue(a.updatedAt)),
    [orders],
  );
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredOrders = normalizedSearch
    ? completedOrders.filter((order) => buildSearchText(order).includes(normalizedSearch))
    : completedOrders;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  const totalItems = completedOrders.reduce((sum, order) => sum + order.items.length, 0);
  const totalResolved = completedOrders.reduce(
    (sum, order) =>
      sum +
      order.items.filter((item) => item.status === "bought" || item.status === "cancelled" || item.status === "out_of_stock").length,
    0,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleExportCsv = () => {
    const rows = [
      ["เลขที่บิล", "ผู้ขอซื้อ", "ร้านค้า", "ผู้จัดซื้อ", "จำนวนรายการ", "รายการสินค้า", "วันที่ปิดงาน", "เวลาปิดงาน"],
      ...filteredOrders.map((order) => [
        getOrderReference(order),
        order.requesterName || "",
        order.storeName || "ทั่วไป",
        order.buyerName || "",
        String(order.items.length),
        order.items.map((item) => item.name).join(" | "),
        formatDateOnly(order.updatedAt),
        formatTimeOnly(order.updatedAt),
      ]),
    ];

    const csvContent = rows.map((row) => row.map((value) => escapeCsvValue(value)).join(",")).join("\r\n");
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "completed-orders-history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPage className="gap-4">
      <section className="relative overflow-hidden rounded-[18px] border border-amber-100/70 bg-[radial-gradient(circle_at_top_left,rgba(255,227,160,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(153,246,228,0.08),transparent_20%),linear-gradient(135deg,#fffdf6_0%,#fff9ec_48%,#f7fcfa_100%)] px-3 py-3 shadow-[0_12px_28px_-26px_rgba(120,113,108,0.22)] lg:px-4">
        <div className="relative z-10 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/85 px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] text-amber-700">
              <History className="h-3.5 w-3.5" />
              Completed Orders History
            </div>
            <div className="space-y-0.5">
              <h1 className="text-[1.45rem] font-semibold tracking-[-0.045em] text-slate-950">ประวัติย้อนหลัง</h1>
              <p className="truncate text-[12px] text-slate-500">แสดงเฉพาะออร์เดอร์ที่เสร็จสิ้นแล้วในรูปแบบตาราง</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
            <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">สำเร็จแล้ว</div>
                  <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{completedOrders.length}</div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">รายการสินค้า</div>
                  <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{totalItems}</div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-600">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ปิดงานแล้ว</div>
                  <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{totalResolved}</div>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-cyan-200 bg-cyan-50 text-cyan-700">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="min-w-[150px] rounded-[10px] border border-white/90 bg-white/80 px-3 py-1.5 text-right shadow-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">วันนี้</div>
              <div className="mt-0.5 text-[12px] font-medium text-slate-700">{formatFullDate(new Date())}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_40px_-42px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-end sm:justify-between lg:px-5">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Completed Orders</div>
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">รายการประวัติสำเร็จแล้ว</h2>
            <p className="text-sm leading-6 text-slate-600">แสดงเฉพาะรายการที่ปิดงานสำเร็จและพร้อมตรวจสอบย้อนหลัง</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[26rem]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative group flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700" />
                <Input
                  placeholder="ค้นหาจากเลขบิล ผู้ขอ ร้านค้า ผู้จัดซื้อ หรือสินค้า"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-[14px] border border-slate-200 bg-white pl-11 text-sm text-slate-900 shadow-sm transition-all focus:border-slate-400"
                />
              </div>
              <AdminSecondaryButton type="button" onClick={handleExportCsv} icon={Download} className="h-10 rounded-[14px] px-3 text-sm">
                ส่งออก
              </AdminSecondaryButton>
            </div>
          </div>
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
                  ผู้จัดซื้อ
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  สถานะ
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  ข้อมูล
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:px-5">
                  เวลาปิดงาน
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <Clock className="h-6 w-6 animate-pulse" />
                      <span className="text-sm">กำลังโหลดข้อมูล</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0">
                    <AdminEmptyState
                      icon={History}
                      title={searchQuery ? "ไม่พบประวัติที่ค้นหา" : "ยังไม่มีประวัติที่เสร็จสิ้นแล้ว"}
                      description={searchQuery ? "ลองค้นหาด้วยเลขบิล ชื่อผู้ขอ หรือชื่อร้านค้าใหม่" : "เมื่อออร์เดอร์ถูกปิดงานสำเร็จ รายการจะปรากฏในส่วนนี้"}
                    />
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                      <div className="font-mono text-sm font-semibold text-slate-800">{getOrderReference(order)}</div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-950">{order.requesterName || "-"}</div>
                        <div className="text-xs text-slate-500">{order.requesterUsername ? `@${order.requesterUsername}` : "ผู้ขอซื้อ"}</div>
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
                      <div className="text-sm text-slate-700">{order.buyerName || "ยังไม่มอบหมาย"}</div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 align-middle lg:px-5">
                      <AdminStatusChip label="เสร็จสิ้นแล้ว" tone="emerald" className="rounded-full px-3 py-1 text-[11px] font-medium" />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-center align-middle lg:px-5">
                      <AdminSecondaryButton
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        icon={Eye}
                        className="h-8 rounded-[10px] px-3 text-xs"
                      >
                        แสดงข้อมูล
                      </AdminSecondaryButton>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-4 text-right align-middle lg:px-5">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-950">{formatTimeOnly(order.updatedAt)} น.</div>
                        <div className="text-xs text-slate-500">{formatDateOnly(order.updatedAt)}</div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > pageSize ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-5">
            <div className="text-sm text-slate-500">
              แสดง {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredOrders.length)} จาก {filteredOrders.length} รายการ
            </div>
            <div className="flex items-center gap-2">
              <AdminSecondaryButton
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                icon={ChevronLeft}
                className="h-9 rounded-[10px] px-3 text-xs disabled:opacity-50"
              >
                ก่อนหน้า
              </AdminSecondaryButton>
              <div className="flex items-center gap-1">
                {visiblePages.map((page, index) => {
                  const previousPage = visiblePages[index - 1];
                  const showGap = previousPage && page - previousPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showGap ? <span className="px-1 text-sm text-slate-400">...</span> : null}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={
                          page === currentPage
                            ? "flex h-9 min-w-[2.25rem] items-center justify-center rounded-[10px] bg-teal-700 px-3 text-sm font-medium text-white"
                            : "flex h-9 min-w-[2.25rem] items-center justify-center rounded-[10px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
                        }
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
              <AdminSecondaryButton
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                icon={ChevronRight}
                className="h-9 rounded-[10px] px-3 text-xs disabled:opacity-50"
              >
                ถัดไป
              </AdminSecondaryButton>
            </div>
          </div>
        ) : null}
      </section>

      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="ข้อมูลออร์เดอร์ย้อนหลัง"
        className="max-w-3xl rounded-[14px] border-slate-200/90 p-0 shadow-[0_20px_70px_-52px_rgba(15,23,42,0.34)]"
        bodyClassName="max-h-[80vh] overflow-y-auto px-4 pb-4 pt-1"
      >
        {selectedOrder ? (
          <div className="space-y-3.5 pr-1">
            <div className="rounded-[10px] border border-slate-200 bg-[linear-gradient(135deg,rgba(248,250,252,1)_0%,rgba(255,251,235,0.86)_52%,rgba(236,253,245,0.82)_100%)] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">เลขที่บิล</div>
                  <div className="text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{getOrderReference(selectedOrder)}</div>
                  <div className="pt-1 text-sm text-slate-500">ปิดงานเมื่อ {formatDateTime(selectedOrder.updatedAt)}</div>
                </div>
                <AdminStatusChip label="เสร็จสิ้นแล้ว" tone="emerald" className="rounded-full px-3 py-1 text-xs font-medium" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ผู้ขอซื้อ</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{selectedOrder.requesterName || "-"}</div>
                <div className="mt-1 text-sm text-slate-500">{selectedOrder.requesterUsername ? `@${selectedOrder.requesterUsername}` : "ไม่มีชื่อผู้ใช้"}</div>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ผู้จัดซื้อ</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{selectedOrder.buyerName || "ยังไม่มอบหมาย"}</div>
                <div className="mt-1 text-sm text-slate-500">สร้างเมื่อ {formatDateTime(selectedOrder.createdAt)}</div>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ร้านค้า</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{selectedOrder.storeName || "ทั่วไป"}</div>
                <div className="mt-1 text-sm text-slate-500">{selectedOrder.storeLocation || "ไม่ระบุที่ตั้งร้าน"}</div>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">จุดส่ง</div>
                <div className="mt-2 text-base font-semibold text-slate-950">{selectedOrder.location || "ไม่ระบุ"}</div>
                <div className="mt-1 text-sm text-slate-500">{selectedOrder.contact || "ไม่มีข้อมูลติดต่อเพิ่มเติม"}</div>
              </div>
            </div>

            {selectedOrder.note ? (
              <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">บันทึกเพิ่มเติม</div>
                <div className="mt-2 text-sm leading-7 text-slate-700">{selectedOrder.note}</div>
              </div>
            ) : null}

            <div className="rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">รายการสินค้า</div>
                  <div className="mt-1 text-base font-semibold text-slate-950">{selectedOrder.items.length} รายการ</div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="rounded-[10px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-slate-950">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.qty} {item.unit}
                        </div>
                        {item.note ? <div className="mt-2 text-sm leading-relaxed text-slate-600">{item.note}</div> : null}
                      </div>
                      <AdminStatusChip label={item.status === "bought" ? "ซื้อแล้ว" : item.status === "cancelled" ? "ยกเลิก" : item.status === "out_of_stock" ? "หมด" : "รอซื้อ"} tone={item.status === "bought" ? "emerald" : item.status === "cancelled" ? "red" : item.status === "out_of_stock" ? "amber" : "slate"} className="shrink-0 rounded-full px-3 py-1 text-xs font-medium" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AdminPrimaryButton type="button" onClick={() => setSelectedOrder(null)} className="h-10 w-full rounded-[10px] text-sm">
              ปิดหน้าต่าง
            </AdminPrimaryButton>
          </div>
        ) : null}
      </Modal>
    </AdminPage>
  );
}
