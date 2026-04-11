"use client";

import React, { useState, useEffect } from "react";
import { useBuyerAuth } from "@/context/BuyerContext";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button, cn } from "@/components/ui/Button";
import {
  Package,
  Store,
  MapPin,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
  Search,
  Edit,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { Modal } from "@/components/ui/Modal";
import { Order, Item } from "@/types";
import { buildNewOrderMessage, sendLineGroupNotification } from "@/lib/lineNotify";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", color: "border-amber-200 bg-amber-50 text-amber-700" },
  buying: { label: "กำลังซื้อ", color: "border-blue-200 bg-blue-50 text-blue-700" },
  sorting: { label: "กำลังคัดแยก", color: "border-violet-200 bg-violet-50 text-violet-700" },
  completed: { label: "เสร็จสิ้น", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "ยกเลิก", color: "border-red-200 bg-red-50 text-red-700" },
};

export default function PurchaseHistoryPage() {
  const { buyer } = useBuyerAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentLimit, setCurrentLimit] = useState(20);

  const { orders, loading, updateOrder } = useOrders("orderer", buyer?.id, currentLimit);

  if (!buyer) return null;

  useEffect(() => {
    if (selectedOrder) {
      setEditedOrder({ ...selectedOrder });
    } else {
      setIsEditing(false);
    }
  }, [selectedOrder]);

  const saveEdit = async () => {
    if (!selectedOrder || !editedOrder) return;
    try {
      await updateOrder(selectedOrder.id, {
        storeName: editedOrder.storeName,
        storeLocation: editedOrder.storeLocation,
        items: editedOrder.items,
        location: editedOrder.location,
        contact: editedOrder.contact,
        note: editedOrder.note
      });

      try {
        const msg = buildNewOrderMessage({
          requesterName: editedOrder.requesterName || buyer?.name || "",
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
      alert("ไม่สามารถบันทึกได้");
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

  const filteredOrders = orders.filter(
    (order) =>
      order.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : 
                   timestamp.seconds ? new Date(timestamp.seconds * 1000) : 
                   new Date(timestamp);
      return new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }).format(date);
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-24">
      <MobileHeader
        title="ประวัติการสั่งซื้อ"
        userName={buyer.lineDisplayName || buyer.name}
        userAvatar={buyer.linePictureUrl}
        userRole={buyer.role}
        onBack={() => router.push("/buy")}
      />

      <div className="px-1 space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <input
            type="text"
            placeholder="ค้นหาร้านค้า หรือรายการสินค้า..."
            className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-white pl-12 pr-4 text-[15px] font-bold text-slate-900 outline-none focus:border-slate-300 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            รายการคำสั่งซื้อ ({filteredOrders.length})
          </h2>
        </div>

        <div className="space-y-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-100 bg-white/50 px-6 py-16 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-slate-200" />
              <p className="text-[14px] font-bold text-slate-400">ไม่พบประวัติการสั่งซื้อ</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status =
                STATUS_MAP[order.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending;
              const firstItem = order.items?.[0];
              const itemCount = order.items?.length || 0;

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
                    "relative cursor-pointer rounded-lg border border-slate-200 border-l-4 bg-white p-3 hover:border-slate-400 transition-all active:scale-[0.99] shadow-sm",
                    accentColor
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-black text-slate-900 truncate leading-tight mb-0.5">
                        {order.storeName || "ไม่ระบุร้านค้า"}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-bold">
                        <Clock className="h-3 w-3" />
                        <span>{formatDateTime(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight",
                          status.color.replace('border-', '')
                      )}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                     <div className="min-w-0 flex-1">
                        <span className="text-[12px] text-slate-900 font-black block truncate leading-tight">
                          {firstItem
                            ? `${firstItem.name}${itemCount > 1 ? ` และอีก ${itemCount - 1} รายการ` : ""}`
                            : "ไม่มีรายการสินค้า"}
                        </span>
                        {(order.status === "completed" || order.status === "sorting") && (
                          <div className="mt-1.5 flex items-center gap-2">
                             {(() => {
                               const bought = order.items?.filter(i => i.status === "bought").length || 0;
                               const missing = order.items?.filter(i => i.status === "out_of_stock" || i.status === "cancelled").length || 0;
                               
                               if (missing === 0 && bought > 0) {
                                 return <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded-sm uppercase tracking-tighter">ซื้อครบทุกรายการ</span>;
                               }
                               if (bought > 0 || missing > 0) {
                                 return (
                                   <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                                        ได้ {bought} / ขาด {missing}
                                      </span>
                                   </div>
                                 );
                               }
                               return null;
                             })()}
                          </div>
                        )}
                     </div>
                     <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 ml-2" />
                  </div>
                </div>
              );
            })
          )}
          
          {orders.length >= currentLimit && (
            <div className="pt-4 pb-8">
              <button 
                onClick={() => setCurrentLimit(prev => prev + 20)}
                className="w-full py-4 rounded-xl border-2 border-slate-100 bg-white text-[13px] font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm uppercase tracking-widest"
              >
                โหลดออร์เดอร์เพิ่มเติม
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.storeName || "รายละเอียดออร์เดอร์"}
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="flex justify-end mb-1">
              {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                !isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    แก้ไขข้อมูล
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditedOrder({ ...selectedOrder });
                      }}
                      className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      onClick={saveEdit}
                      className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800"
                    >
                      <Save className="h-3.5 w-3.5" />
                      บันทึกความเปลี่ยนแปลง
                    </button>
                  </div>
                )
              )}
            </div>

            {isEditing && editedOrder ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">ชื่อร้านค้า</label>
                    <input 
                      className="w-full h-10 px-3 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                      value={editedOrder.storeName}
                      onChange={(e) => setEditedOrder({ ...editedOrder, storeName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">สถานที่</label>
                    <input 
                      className="w-full h-10 px-3 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                      value={editedOrder.location}
                      onChange={(e) => setEditedOrder({ ...editedOrder, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">ที่อยู่ร้านค้า</label>
                  <textarea
                    className="w-full min-h-[84px] px-3 py-2.5 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                    value={editedOrder.storeLocation || ""}
                    onChange={(e) => setEditedOrder({ ...editedOrder, storeLocation: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">ที่อยู่จัดส่ง</label>
                  <textarea
                    className="w-full min-h-[84px] px-3 py-2.5 rounded-lg border-2 border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:border-blue-400 focus:bg-white outline-none transition-all"
                    value={editedOrder.location || ""}
                    onChange={(e) => setEditedOrder({ ...editedOrder, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">รายการสินค้า</label>
                    <button 
                      onClick={addEditItem}
                      className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
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
                            className="h-9 w-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors font-bold"
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-1 font-black uppercase tracking-widest leading-none">สถานะออร์เดอร์</span>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight mb-1",
                        (STATUS_MAP[selectedOrder.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending).color.replace('border-', ''),
                      )}>
                        {(STATUS_MAP[selectedOrder.status as keyof typeof STATUS_MAP] || STATUS_MAP.pending).label}
                      </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-1 font-black uppercase tracking-widest leading-none">วันที่สั่งซื้อ</span>
                      <span className="text-[11px] font-bold text-slate-900">{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="space-y-2 rounded-xl border border-slate-100 bg-white px-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <Store className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-black tracking-wide text-slate-400">ชื่อร้าน</div>
                        <div className="text-[13px] font-bold leading-tight text-slate-900">
                          {selectedOrder.storeName || "ไม่ระบุชื่อร้าน"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-black tracking-wide text-slate-400">ที่อยู่ร้านค้า</div>
                        <div className="text-[12px] leading-relaxed text-slate-900">
                          {selectedOrder.storeLocation || "ไม่ระบุที่อยู่ร้านค้า"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-black tracking-wide text-slate-400">ที่อยู่จัดส่ง</div>
                        <div className="text-[12px] leading-relaxed text-slate-900">
                          {selectedOrder.location || "ไม่ระบุที่อยู่จัดส่ง"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white px-3 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-black tracking-wide text-slate-400">
                      <Package className="h-3.5 w-3.5" />
                      รายการ
                    </div>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, i) => {
                        const isUnavailable = item.status === "cancelled" || item.status === "out_of_stock";
                        
                        return (
                          <div
                            key={item.id || i}
                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-2.5 py-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <div className={cn(
                                "mb-0.5 truncate text-[13px] font-bold leading-tight text-slate-900",
                                isUnavailable && "line-through text-slate-400 opacity-50"
                              )}>
                                {item.name}
                              </div>
                              <div className={cn(
                                "inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-600",
                                isUnavailable && "text-slate-400 opacity-50"
                              )}>
                                {item.qty} {item.unit}
                              </div>
                            </div>
                            <div className="shrink-0 ml-4">
                              {item.status === "bought" ? (
                                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-emerald-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black tracking-tight">ซื้อแล้ว</span>
                                </div>
                              ) : isUnavailable ? (
                                <div className="flex items-center gap-1.5 rounded-lg border border-red-50 bg-red-50 px-2 py-1 text-red-400">
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black tracking-tight">ไม่มี</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-amber-600">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-[10px] font-black tracking-tight">รอดำเนินการ</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="hidden flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2">
                      <span className="text-[12px] text-slate-900">
                        จำนวนสินค้า
                      </span>
                      <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">
                        {selectedOrder.items.length} รายการ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden divide-y divide-slate-100 border-t border-b border-slate-100">
                  {selectedOrder.items.map((item, i) => {
                    const isUnavailable = item.status === "cancelled" || item.status === "out_of_stock";
                    
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center justify-between py-3.5 px-0.5 transition-all"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className={cn(
                            "text-[14px] font-bold text-slate-900 truncate leading-tight mb-0.5",
                            isUnavailable && "line-through text-slate-400 opacity-50"
                          )}>
                            {item.name}
                          </div>
                          <div className={cn(
                            "text-[11px] font-bold bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100 transition-colors",
                            isUnavailable ? "text-slate-400 opacity-50" : "text-slate-600"
                          )}>
                            {item.qty} {item.unit}
                          </div>
                        </div>
                        <div className="shrink-0 ml-4">
                          {item.status === "bought" ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">ซื้อแล้ว</span>
                            </div>
                          ) : isUnavailable ? (
                            <div className="flex items-center gap-1.5 text-red-400 bg-red-50 px-2 py-1 rounded-lg border border-red-50">
                              <XCircle className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">ไม่มี</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                              <Clock className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-tighter">รอดำเนินการ</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {selectedOrder.note && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-black text-slate-400 px-1 uppercase tracking-[0.2em]">ข้อความจากเจ้าหน้าที่</span>
                <div className="rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3.5 text-[13px] font-medium leading-relaxed text-slate-700">
                  {selectedOrder.note}
                </div>
              </div>
            )}

            <div className="pt-2">
               <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="w-full h-12 rounded-xl bg-slate-900 text-white text-sm font-black shadow-lg shadow-slate-900/15 active:scale-[0.98] transition-all uppercase tracking-widest"
               >
                 {isEditing ? "ปิด (ไม่บันทึก)" : "หน้าหลัก"}
               </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
