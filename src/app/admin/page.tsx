"use client";

import { Loader2 } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card } from "@/components/ui/FormElements";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function AdminDashboard() {
  const { orders, loading } = useOrders();

  const getStats = () => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const buying = orders.filter((o) => o.status === "buying").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;

    return [
      {
        label: "รอดำเนินการ",
        value: pending,
        color: "text-amber-700",
        bg: "bg-amber-50",
      },
      {
        label: "กำลังจัดซื้อ",
        value: buying,
        color: "text-blue-700",
        bg: "bg-blue-50",
      },
      {
        label: "เสร็จสิ้นวันนี้",
        value: completed,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
      },
      {
        label: "ยกเลิก",
        value: cancelled,
        color: "text-red-700",
        bg: "bg-red-50",
      },
    ];
  };

  const stats = getStats();

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="flex flex-col gap-5 border-slate-300 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                {stat.label}
              </span>
              <div
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                  stat.bg,
                  stat.color,
                )}
              >
                +12%
              </div>
            </div>
            <span
              className={cn(
                "text-4xl font-semibold leading-none tracking-[-0.05em]",
                stat.color,
              )}
            >
              {stat.value}
            </span>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-slate-300 bg-white p-0">
        <div className="panel-header">
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-900">
            รายการสั่งซื้อล่าสุด
          </h3>
          <Button
            size="sm"
            variant="secondary"
            className="px-4 text-xs uppercase tracking-[0.08em]"
          >
            ดูทั้งหมด
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="app-table text-left">
            <thead>
              <tr>
                <th>รหัส</th>
                <th>ผู้สั่ง</th>
                <th>ร้านค้า</th>
                <th>รายการ</th>
                <th>สถานะ</th>
                <th className="text-right">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center font-semibold text-slate-600"
                  >
                    ไม่พบรายการสั่งซื้อ
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="font-medium transition-colors hover:bg-slate-50"
                  >
                    <td className="font-semibold text-slate-900">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="text-slate-600">{order.requesterName}</td>
                    <td className="font-semibold uppercase text-slate-900">
                      {order.storeName || "-"}
                    </td>
                    <td className="text-slate-500">
                      {order.items.length} รายการ ({order.items[0]?.name}
                      {order.items.length > 1 ? "..." : ""})
                    </td>
                    <td>
                      <span
                        className={cn(
                          "status-chip",
                          order.status === "buying"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : order.status === "pending"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700",
                        )}
                      >
                        {order.status === "buying"
                          ? "กำลังซื้อ"
                          : order.status === "pending"
                            ? "รอรับเรื่อง"
                            : "เสร็จสิ้น"}
                      </span>
                    </td>
                    <td className="text-right text-slate-600">
                      {order.createdAt
                        ? format(order.createdAt.toDate(), "HH:mm 'น.'", {
                            locale: th,
                          })
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
