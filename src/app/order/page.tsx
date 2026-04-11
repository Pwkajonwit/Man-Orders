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
  Clock,
  Edit,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { Modal } from "@/components/ui/Modal";
import { Order, Item } from "@/types";
import {
  sendLineGroupNotification,
  buildCompletedOrderMessage,
  buildNewOrderMessage,
} from "@/lib/lineNotify";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", color: "border-amber-200 bg-amber-50 text-amber-700" },
  buying: { label: "กำลังซื้อ", color: "border-blue-200 bg-blue-50 text-blue-700" },
  sorting: { label: "กำลังคัดแยก", color: "border-violet-200 bg-violet-50 text-violet-700" },
  completed: { label: "เสร็จสิ้น", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "ยกเลิก", color: "border-red-200 bg-red-50 text-red-700" },
};

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (e) {
    return "-";
  }
};

export default function OrderSupportPage() {
  const { buyer, loading: authLoading } = useBuyerAuth();
  const { orders, loading: ordersLoading, updateItemStatus, updateOrderStatus, updateOrder } =
    useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const router = useRouter();

  useEffect(() => {
    if (selectedOrder) {
      setNoteText(selectedOrder.note || "");
      setEditedOrder({ ...selectedOrder }); // Clone for editing
    } else {
      setIsEditing(false);
    }
  }, [selectedOrder]);

  const handleSaveNote = async () => {
    if (!selectedOrder) return;
    await updateOrder(selectedOrder.id, { note: noteText });
    setSelectedOrder({ ...selectedOrder, note: noteText });
  };

  const handleUpdateItemStatus = (
    itemIndex: number,
    newStatus: Item["status"],
  ) => {
    if (!selectedOrder || !buyer) return;

    if (isEditing) return; // Prevent status updates while editing items

    const currentItems = selectedOrder.items || [];
    const newItems = [...currentItems];
    if (newItems[itemIndex]) {
      const updatedItem = { ...newItems[itemIndex], status: newStatus };

      // Set purchase timestamp if status is changed to 'bought'
      if (newStatus === "bought") {
        updatedItem.boughtAt = new Date();
      } else if (updatedItem.boughtAt) {
        // Clear if no longer bought
        delete updatedItem.boughtAt;
      }

      newItems[itemIndex] = updatedItem;
    }

    // --- Optimistic Update ---
    setSelectedOrder({ ...selectedOrder, items: newItems });

    // Perform async update in background
    (async () => {
      try {
        await updateOrder(selectedOrder.id, { items: newItems }); // Using broader updateOrder for consistency

        const isProcessed = (i: Item) =>
          i.status === "bought" || i.status === "cancelled" || i.status === "out_of_stock";
        const hasBoughtAll = newItems.every(isProcessed);
        const hasStartedBuying = newItems.some(isProcessed);

        if (hasBoughtAll && selectedOrder.status !== "sorting" && selectedOrder.status !== "completed") {
          await updateOrder(selectedOrder.id, {
            status: "sorting",
            buyerId: buyer?.id,
            buyerName: buyer?.name
          });
        } else if (hasStartedBuying && selectedOrder.status === "pending") {
          await updateOrder(selectedOrder.id, {
            status: "buying",
            buyerId: buyer?.id,
            buyerName: buyer?.name
          });
        }
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    })();
  };

  const saveEdit = async () => {
    if (!selectedOrder || !editedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {
        storeName: editedOrder.storeName,
        storeLocation: editedOrder.storeLocation,
        items: editedOrder.items,
        location: editedOrder.location,
        contact: editedOrder.contact,
        note: editedOrder.note,
      });

      try {
        const msg = buildNewOrderMessage({
          requesterName: editedOrder.requesterName || "-",
          storeName: editedOrder.storeName || "",
          storeLocation: editedOrder.storeLocation || "",
          location: editedOrder.location || "",
          contact: editedOrder.contact || "",
          note: editedOrder.note || "",
          mapUrl: editedOrder.mapUrl || "",
          itemCount: editedOrder.items.length,
          items: editedOrder.items.map((item) => ({
            name: item.name,
            qty: Number(item.qty) || 0,
            unit: item.unit,
          })),
          mode: "edited",
        });
        await sendLineGroupNotification("new_order", msg);
      } catch (notifyErr) {
        console.error("LINE notification error:", notifyErr);
      }

      setSelectedOrder({ ...editedOrder });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    }
  };

  const addEditItem = () => {
    if (!editedOrder) return;
    const newItem: Item = {
      id: `item_${Date.now()}`,
      name: "",
      qty: 1,
      unit: "ชิ้น",
      status: "to_buy"
    };
    setEditedOrder({
      ...editedOrder,
      items: [...editedOrder.items, newItem]
    });
  };

  const removeEditItem = (idx: number) => {
    if (!editedOrder) return;
    const newItems = [...editedOrder.items];
    newItems.splice(idx, 1);
    setEditedOrder({ ...editedOrder, items: newItems });
  };

  const updateEditItem = (idx: number, field: keyof Item, value: any) => {
    if (!editedOrder) return;
    const newItems = [...editedOrder.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setEditedOrder({ ...editedOrder, items: newItems });
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
    <div className="order-ui mx-auto max-w-md space-y-3 pb-20">
      <MobileHeader
        title="จัดการงานจัดซื้อ"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
      />

      {/* Statistics Row with Subtle Colors */}
      <div className="grid grid-cols-3 gap-2 px-1">
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 py-2 px-3 transition-all">
          <div className="text-sm uppercase tracking-wider text-blue-600 font-bold">ทั้งหมด</div>
          <div className="text-lg  text-blue-800">{orders.length}</div>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 py-2 px-3 transition-all">
          <div className="text-sm uppercase tracking-wider text-amber-600 font-bold">ค้างจ่าย</div>
          <div className="text-lg  text-amber-800">{activeOrders.length}</div>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 py-2 px-3 transition-all">
          <div className="text-sm uppercase tracking-wider text-emerald-600 font-bold">เสร็จสิ้น</div>
          <div className="text-lg  text-emerald-800">{completedOrders.length}</div>
        </div>
      </div>

      <div className="flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={cn(
            "flex-1 rounded-md py-2 text-[14px] font-bold transition-all",
            activeTab === "active"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          รายการงาน ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 rounded-md py-2 text-[14px] font-bold transition-all",
            activeTab === "history"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
              : "text-slate-600 hover:bg-slate-50",
          )}
        >
          ประวัติงาน ({completedOrders.length})
        </button>
      </div>

      <div className="space-y-2">
        {ordersLoading ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-[11px] uppercase tracking-wider font-bold">กำลังโหลด...</span>
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 py-12 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-500">ไม่มีข้อมูลงานในส่วนนี้</p>
          </div>
        ) : (
          displayOrders.map((order) => {
            const items = order.items || [];
            const itemCount = items.length;
            const progress = items.filter((i) =>
              ["bought", "cancelled", "out_of_stock"].includes(i.status),
            ).length;

            const accentColor =
              order.status === "completed" ? "border-l-emerald-500" :
                order.status === "cancelled" ? "border-l-red-500" :
                  order.status === "buying" ? "border-l-blue-500" :
                    order.status === "sorting" ? "border-l-violet-500" : "border-l-amber-500";

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  "relative cursor-pointer rounded-lg border border-slate-200 border-l-4 bg-white p-3.5 hover:border-slate-400 transition-all active:scale-[0.99] shadow-sm",
                  accentColor
                )}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-slate-900 leading-tight">{order.storeName || "ไม่ระบุร้านค้า"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="text-[13px] font-semibold text-slate-600 truncate space-y-0.5">
                    <div><span className="opacity-50 text-sm uppercase  mr-1">ผู้สั่ง:</span> {order.requesterName || "-"}</div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold">สั่งเมื่อ: {formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const bought = items.filter(i => i.status === "bought").length;
                        const missing = items.filter(i => i.status === "out_of_stock" || i.status === "cancelled").length;

                        if (order.status === "completed" || order.status === "sorting") {
                          if (missing === 0 && bought > 0) {
                            return <span className="text-sm  text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">ครบ</span>;
                          }
                          return (
                            <span className="text-sm  text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                              ได้ {bought} / ขาด {missing}
                            </span>
                          );
                        }
                        return <span className="text-sm  text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{progress}/{itemCount} Items</span>;
                      })()}
                    </div>

                    <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-700",
                          progress === itemCount ? "bg-emerald-500" :
                            order.status === 'buying' ? 'bg-blue-600' : 'bg-slate-900'
                        )}
                        style={{
                          width: `${itemCount > 0 ? (progress / itemCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.storeName || "รายละเอียด"}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex justify-end mb-1">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-[11px]  uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  แก้ไขรายการ
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedOrder({ ...selectedOrder });
                    }}
                    className="text-[11px]  uppercase tracking-widest text-slate-400 hover:text-slate-600"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1.5 text-[11px]  uppercase tracking-widest text-emerald-600 hover:text-emerald-800"
                  >
                    <Save className="h-3.5 w-3.5" />
                    บันทึก
                  </button>
                </div>
              )}
            </div>

            {isEditing && editedOrder ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm  uppercase tracking-wider text-slate-400">ชื่อร้านค้า</label>
                    <input
                      className="w-full h-10 px-3 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                      value={editedOrder.storeName}
                      onChange={(e) => setEditedOrder({ ...editedOrder, storeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm  uppercase tracking-wider text-slate-400">สถานที่ส่ง</label>
                    <input
                      className="w-full h-10 px-3 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                      value={editedOrder.location}
                      onChange={(e) => setEditedOrder({ ...editedOrder, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm  uppercase tracking-wider text-slate-400">สถานที่ร้าน</label>
                  <textarea
                    className="w-full min-h-[84px] px-3 py-2.5 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                    value={editedOrder.storeLocation || ""}
                    onChange={(e) => setEditedOrder({ ...editedOrder, storeLocation: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm  uppercase tracking-wider text-slate-400">รายการสินค้า</label>
                    <button
                      onClick={addEditItem}
                      className="flex items-center gap-1 text-sm  uppercase text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                    >
                      <Plus className="h-3 w-3" />
                      เพิ่มสินค้า
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
                    {editedOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="p-3 rounded-xl border-2 border-slate-50 bg-white space-y-2">
                        <div className="flex gap-2">
                          <input
                            placeholder="ชื่อสินค้า"
                            className="flex-1 h-9 px-3 rounded-lg border border-slate-100 bg-slate-50 text-[13px] font-bold text-slate-900 focus:border-blue-400 outline-none transition-all"
                            value={item.name}
                            onChange={(e) => updateEditItem(idx, 'name', e.target.value)}
                          />
                          <button
                            onClick={() => removeEditItem(idx)}
                            className="h-9 w-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="จำนวน"
                            className="h-9 px-3 rounded-lg border border-slate-100 bg-slate-50 text-[13px] font-bold text-slate-900 focus:border-blue-400 outline-none transition-all"
                            value={item.qty}
                            onChange={(e) => updateEditItem(idx, 'qty', Number(e.target.value))}
                          />
                          <input
                            placeholder="หน่วย"
                            className="h-9 px-3 rounded-lg border border-slate-100 bg-slate-50 text-[13px] font-bold text-slate-900 focus:border-blue-400 outline-none transition-all"
                            value={item.unit}
                            onChange={(e) => updateEditItem(idx, 'unit', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-1.5 text-sm">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block mb-1  uppercase tracking-wider">สถานที่ร้าน</span>
                    <span className="font-bold text-slate-900 block text-[11px] leading-relaxed">
                      {selectedOrder.storeLocation || "N/A"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block mb-1  uppercase tracking-wider">สถานที่ส่ง</span>
                    <span className="font-bold text-slate-900 block text-[11px] leading-relaxed">
                      {selectedOrder.location || "N/A"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block mb-1  uppercase tracking-wider">สั่งเมื่อ</span>
                    <span className="font-bold text-slate-900 truncate block text-[11px]">{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block mb-1  uppercase tracking-wider">ผู้สั่ง</span>
                    <span className="font-bold text-slate-900 truncate block text-[11px]">{selectedOrder.requesterName || "N/A"}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-4 py-3.5 px-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-slate-900 truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-slate-600 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{item.qty} {item.unit}</span>
                          {item.boughtAt && (
                            <div className="flex items-center gap-1.5 text-emerald-600 text-sm  uppercase tracking-tighter">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />
                              <span>ซื้อ {formatDateTime(item.boughtAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateItemStatus(idx, "to_buy")}
                          title="รอซื้อ"
                          className={cn(
                            "h-9 w-9 flex items-center justify-center rounded-lg border-2 transition-all active:scale-[0.9]",
                            item.status === "to_buy" || !item.status
                              ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                              : "border-slate-100 bg-white text-slate-300 hover:text-slate-500"
                          )}
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateItemStatus(idx, "cancelled")}
                          title="ไม่มี"
                          className={cn(
                            "h-9 w-9 flex items-center justify-center rounded-lg border-2 transition-all active:scale-[0.9]",
                            item.status === "cancelled"
                              ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
                              : "border-slate-100 bg-white text-slate-300 hover:text-slate-500"
                          )}
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUpdateItemStatus(idx, "bought")}
                          title="ซื้อแล้ว"
                          className={cn(
                            "h-9 w-9 flex items-center justify-center rounded-lg border-2 transition-all active:scale-[0.9]",
                            item.status === "bought"
                              ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
                              : "border-slate-100 bg-white text-slate-300 hover:text-slate-500"
                          )}
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <span className="text-[11px]  text-slate-500 px-1 uppercase tracking-widest">หมายเหตุเพิ่มเติม</span>
              <textarea
                className="w-full h-20 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none focus:bg-white focus:border-slate-300 transition-all font-medium"
                placeholder="ระบุลายละเอียดเพิ่มเติม เช่น สินค้าหมด หรือเปลี่ยนสเปค..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onBlur={handleSaveNote}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-200 text-sm  text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                ยกเลิก
              </button>
              <Button
                disabled={isEditing}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await updateOrder(selectedOrder.id, {
                      status: "completed",
                      buyerId: buyer?.id,
                      buyerName: buyer?.name
                    });

                    const items = selectedOrder.items || [];
                    const msg = buildCompletedOrderMessage({
                      storeName: selectedOrder.storeName || "",
                      location: selectedOrder.location || "",
                      mapUrl: selectedOrder.mapUrl || "",
                      itemCount: items.length,
                      boughtCount: items.filter((i) => i.status === "bought").length,
                      cancelledCount: items.filter(
                        (i) => i.status === "cancelled" || i.status === "out_of_stock"
                      ).length,
                      completedBy: buyer?.name,
                      items: items.map(i => ({
                        name: i.name,
                        qty: i.qty,
                        unit: i.unit,
                        status: i.status
                      }))
                    });
                    await sendLineGroupNotification("completed", msg);
                  } catch (notifyErr) {
                    console.error("LINE notification error:", notifyErr);
                  } finally {
                    setSubmitting(false);
                    setSelectedOrder(null);
                  }
                }}
                className="flex-[1.5] h-12 rounded-xl text-sm  shadow-lg shadow-slate-950/10"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "บันทึกและปิดงาน"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
