"use client";
import React, { useState, useEffect } from "react";
import {
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatusChip,
  AdminStatCard,
  AdminStatGrid,
} from "@/components/admin/AdminUI";
import {
  Search,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  ShoppingBag,
  Plus,
  Trash2,
  User,
  Store,
  Edit3,
  Activity,
  History
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useOrders } from "@/hooks/useOrders";
import { useStaff } from "@/hooks/useStaff";
import { useSettings } from "@/hooks/useSettings";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Order, Item } from "@/types";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", tone: "amber" as const },
  buying: { label: "กำลังซื้อ", tone: "blue" as const },
  sorting: { label: "ตรวจสอบ", tone: "purple" as const },
  completed: { label: "สำเร็จแล้ว", tone: "emerald" as const },
  cancelled: { label: "ยกเลิก", tone: "red" as const },
};

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return "—";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd MMM yy, HH:mm", { locale: th });
  } catch {
    return "—";
  }
};

export default function OrdersPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, loading, createOrder, updateOrder, deleteOrder } = useOrders();
  const { staff } = useStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Order>>({
    requesterId: "",
    requesterName: "",
    storeName: "",
    items: [],
    status: "pending",
    note: "",
  });

  const [managingOrder, setManagingOrder] = useState<Order | null>(null);
  const [managedItems, setManagedItems] = useState<Item[]>([]);
  const [manageNote, setManageNote] = useState("");

  const [newItem, setNewItem] = useState<Partial<Item>>({
    name: "",
    qty: 1,
    unit: "ชิ้น",
  });

  useEffect(() => {
    if (!settingsLoading && settings.units.length > 0) {
      setNewItem(prev => ({ ...prev, unit: prev.unit || settings.units[0] }));
    }
  }, [settingsLoading, settings.units]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ requesterId: "", requesterName: "", storeName: "", items: [], status: "pending", note: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setIsEditing(true);
    setFormData(order);
    setIsModalOpen(true);
  };

  const handleOpenManage = (order: Order) => {
    setManagingOrder(order);
    setManagedItems([...order.items]);
    setManageNote(order.note || "");
    setIsManageModalOpen(true);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.qty) {
      const item: Item = {
        id: `item_${Date.now()}`,
        name: newItem.name as string,
        qty: Number(newItem.qty),
        unit: newItem.unit || settings.units[0] || "ชิ้น",
        status: "to_buy",
      };
      setFormData({ ...formData, items: [...(formData.items || []), item] });
      setNewItem({ name: "", qty: 1, unit: settings.units[0] || "ชิ้น" });
    }
  };

  const handleRemoveItem = (id: string) => {
    setFormData({ ...formData, items: (formData.items || []).filter((i) => i.id !== id) });
  };

  const updateManagedItemStatus = (itemId: string, status: Item["status"]) => {
    setManagedItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const updatedItem: Item = { ...item, status };

        if (status === "bought") {
          updatedItem.boughtAt = new Date();
        } else if (updatedItem.boughtAt) {
          delete updatedItem.boughtAt;
        }

        return updatedItem;
      }),
    );
  };

  const saveManagedItems = async () => {
    if (!managingOrder) return;
    setSubmitting(true);
    try {
      const allDone = managedItems.length > 0 && managedItems.every(i => i.status !== "to_buy");
      let newStatus = allDone ? "completed" : "buying";
      await updateOrder(managingOrder.id, { items: managedItems, note: manageNote, status: newStatus as Order["status"] });
      setIsManageModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requesterId || (formData.items || []).length === 0) {
      alert("กรุณาระบุผู้สั่งซื้อและเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && formData.id) await updateOrder(formData.id, formData);
      else await createOrder(formData);
      setIsModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: string, requesterName: string) => {
    if (!confirm(`คุณต้องการลบออร์เดอร์ของ ${requesterName} ใช่หรือไม่?`)) return;
    try {
      await deleteOrder(id);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบออร์เดอร์");
    }
  };

  if (settingsLoading) {
    return <div className="flex flex-col items-center justify-center py-40 animate-pulse text-slate-300">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <span className="text-sm">กำลังดึงข้อมูลมาให้ช้าๆ...</span>
    </div>;
  }

  return (
    <>
      <AdminPage>
        <AdminHeader
          title="จัดการออร์เดอร์"
          subtitle="ศูนย์กลางควบคุมและติดตามรายการสั่งซื้อสินค้าพัสดุพาร์ทเนอร์"
          actions={
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700" />
                <Input
                  placeholder="ค้นหาบิลสั่งซื้อ..."
                  className="h-11 w-64 rounded-xl border border-slate-300 bg-white pl-11 text-sm text-slate-900 transition-all focus:border-slate-400"
                />
              </div>
              <AdminPrimaryButton onClick={handleOpenAdd} icon={Plus}>
                สร้างบิลใหม่
              </AdminPrimaryButton>
            </div>
          }
        />

        <AdminStatGrid>
          <AdminStatCard
            label="รายการรวม"
            value={orders.length}
            detail="ออร์เดอร์รวมที่บันทึกในระบบ"
            icon={Package}
            tone="slate"
          />
          <AdminStatCard
            label="รอยืนยัน"
            value={orders.filter((o) => o.status === "pending").length}
            detail="คำขอซื้อที่ยังไม่ตอบรับ"
            icon={Clock}
            tone="amber"
          />
          <AdminStatCard
            label="กำลังดำเนินการ"
            value={orders.filter((o) => o.status === "buying").length}
            detail="คำสั่งที่อยู่ระหว่างจัดหา"
            icon={ShoppingCart}
            tone="blue"
          />
          <AdminStatCard
            label="เสร็จสิ้นแล้ว"
            value={orders.filter((o) => o.status === "completed").length}
            detail="รายการที่ปิดงานสมบูรณ์"
            icon={History}
            tone="emerald"
          />
        </AdminStatGrid>

        <AdminPanel title="รายการออร์เดอร์" subtitle="สถานะการจัดหาพัสดุและวันเวลาที่ดำเนินการล่าสุด">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-5 py-3 text-left text-sm text-slate-700">บิล</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-left text-sm text-slate-700">ผู้สั่งซื้อ</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-left text-sm text-slate-700">ร้านและสถานที่</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-left text-sm text-slate-700">ผู้จัดซื้อ</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-left text-sm text-slate-700">สินค้า</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-left text-sm text-slate-700">สถานะ</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-right text-sm text-slate-700">เวลา</th>
                  <th className="border-b border-slate-200 px-5 py-3 text-center text-sm text-slate-700">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-sm ">กำลังโหลดรายการออร์เดอร์</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <AdminEmptyState
                        icon={ShoppingBag}
                        title="ยังไม่มีรายการสั่งซื้อ"
                        description="เมื่อมีการสร้างบิลใหม่ รายการจะแสดงขึ้นที่ตารางนี้"
                      />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;
                    const boughtCount = order.items.filter((item) => item.status === "bought").length;
                    const cancelledCount = order.items.filter((item) => item.status === "cancelled" || item.status === "out_of_stock").length;
                    const pendingCount = order.items.filter((item) => item.status === "to_buy").length;
                    const previewItems = order.items.slice(0, 2);
                    const remainingItems = Math.max(order.items.length - previewItems.length, 0);

                    return (
                      <tr key={order.id} className="align-top transition-colors hover:bg-slate-50">
                        <td className="border-b border-slate-100 px-5 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-slate-950">
                              #{order.id.slice(-6).toUpperCase()}
                            </div>
                            <div className="text-xs text-slate-500">
                              {order.note ? "มีบันทึกเพิ่มเติม" : "ไม่มีบันทึกเพิ่มเติม"}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700">
                              {order.requesterName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm leading-tight text-slate-950">{order.requesterName}</span>
                              <span className="text-xs text-slate-600">
                                {order.requesterUsername ? `@${order.requesterUsername}` : "ผู้สั่งซื้อ"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4">
                          <div className="max-w-[260px] space-y-1.5">
                            <div className="text-sm leading-tight text-slate-950">{order.storeName || "ทั่วไป"}</div>
                            <div className="text-xs leading-relaxed text-slate-600">
                              ร้าน: {order.storeLocation || "ไม่ระบุที่อยู่ร้าน"}
                            </div>
                            <div className="text-xs leading-relaxed text-slate-500">
                              ส่ง: {order.location || "ไม่ระบุสถานที่ส่ง"}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4">
                          {order.buyerId || order.buyerName ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-[10px] text-slate-700">
                                  {order.buyerName?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                                <span className="text-sm text-slate-700">
                                  {order.buyerName || "—"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                ซื้อได้ {boughtCount} | ยกเลิก {cancelledCount}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-600">
                                ยังไม่มีผู้ซื้อ
                              </span>
                              <div className="text-xs text-slate-500">
                                รอดำเนินการ {pendingCount} รายการ
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4">
                          <div className="space-y-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                              {order.items.length} รายการ
                            </span>
                            <div className="space-y-1">
                              {previewItems.map((item) => (
                                <div key={item.id} className="text-xs leading-relaxed text-slate-600">
                                  {item.name} · {item.qty} {item.unit}
                                </div>
                              ))}
                              {remainingItems > 0 && (
                                <div className="text-xs text-slate-500">
                                  และอีก {remainingItems} รายการ
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4">
                          <div className="space-y-2">
                            <AdminStatusChip label={status.label} tone={status.tone} />
                            <div className="space-y-1 text-xs text-slate-500">
                              <div>รอซื้อ {pendingCount}</div>
                              <div>สำเร็จ {boughtCount}</div>
                              {cancelledCount > 0 && <div>ไม่ได้ซื้อ {cancelledCount}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4 text-right">
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-slate-950">
                                {order.createdAt ? format(order.createdAt.toDate(), "HH:mm", { locale: th }) : "—"}
                              </div>
                              <div className="text-xs text-slate-600">
                                สร้าง {order.createdAt ? format(order.createdAt.toDate(), "dd MMM yy", { locale: th }) : "—"}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              อัปเดต {order.updatedAt ? format(order.updatedAt.toDate(), "dd MMM yy", { locale: th }) : "—"}
                            </div>
                          </div>
                        </td>
                        <td className="border-b border-slate-100 px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <AdminSecondaryButton
                              onClick={() => handleOpenManage(order)}
                              icon={Edit3}
                              className="h-8 w-8 border-slate-200 p-0 text-slate-700"
                            />
                            <AdminSecondaryButton
                              onClick={() => handleOpenEdit(order)}
                              icon={ChevronRight}
                              className="h-8 w-8 border-slate-200 p-0 text-slate-700"
                            />
                            <AdminSecondaryButton
                              onClick={() => handleDeleteOrder(order.id, order.requesterName || "")}
                              icon={Trash2}
                              className="h-8 w-8 border-red-100 p-0 text-red-500 hover:bg-red-50"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </AdminPage>

      {/* Main Order Modal (Add/Edit) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "แก้ไขบิลสั่งซื้อ" : "สร้างบิลสั่งซื้อใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-sm text-slate-700">พนักงานผู้สั่งซื้อ</Label>
              <Select required value={formData.requesterId} className="h-10 rounded-lg border border-slate-300 text-sm text-slate-900" onChange={(e) => {
                const s = staff.find(st => st.id === e.target.value);
                setFormData({ ...formData, requesterId: e.target.value, requesterName: s?.name || "" });
              }}>
                <option value="">เลือกพนักงาน...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-slate-700">ชื่อร้านค้าคู่ค้า</Label>
              <Input placeholder="ระบุชื่อร้านค้า..." className="h-10 rounded-lg border border-slate-300 text-sm text-slate-900" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between px-0.5">
                <Label className="text-sm text-slate-900">รายการสินค้า</Label>
                <span className="text-sm text-slate-600">{(formData.items || []).length} รายการ</span>
              </div>

              <div className="flex gap-1.5">
                <Input placeholder="ชื่อสินค้า..." className="h-10 flex-[2] rounded-lg border border-slate-300 bg-white text-sm text-slate-900" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                <Input type="number" placeholder="Qty" className="h-10 flex-[0.5] rounded-lg border border-slate-300 bg-white text-center text-sm text-slate-900" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })} />
                <Select className="h-10 flex-1 rounded-lg border border-slate-300 bg-white text-sm text-slate-900" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                  {settings.units.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
                <AdminPrimaryButton type="button" onClick={handleAddItem} icon={Plus} className="w-10 h-10 p-0 shrink-0" />
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 flex flex-col pt-1 custom-scrollbar">
                {(formData.items || []).length === 0 && <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-500">เพิ่มสินค้าอย่างน้อย 1 รายการ</div>}
                {(formData.items || []).map((item: Item) => (
                  <div key={item.id} className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-300">
                    <div className="flex flex-col">
                      <span className="text-sm leading-tight text-slate-950">{item.name}</span>
                      <span className="mt-0.5 text-sm text-slate-600">{item.qty} {item.unit}</span>
                    </div>
                    <AdminSecondaryButton type="button" onClick={() => handleRemoveItem(item.id)} icon={Trash2} className="h-7 w-7 border-0 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-t border-slate-200 pt-4">
            <AdminSecondaryButton type="button" className="h-10 flex-1 text-xs text-slate-700" onClick={() => setIsModalOpen(false)}>ยกเลิก</AdminSecondaryButton>
            <AdminPrimaryButton submitting={submitting} icon={CheckCircle2} className="h-10 flex-[2] text-xs">
              {isEditing ? "อัปเดตบิล" : "สร้างออร์เดอร์"}
            </AdminPrimaryButton>
          </div>
        </form>
      </Modal>

      {/* Item Management Modal (Fulfillment) */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="จัดการสถานะสินค้า"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm leading-tight text-slate-950">{managingOrder?.storeName || "ทั่วไป"}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                <User className="h-3 w-3" />
                ผู้ขอ: {managingOrder?.requesterName}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                ขอซื้อเมื่อ {formatDateTime(managingOrder?.createdAt)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-sm text-slate-900">รายการสินค้า</div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {managedItems.length} รายการ
              </span>
            </div>

            <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {managedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm leading-tight text-slate-950">
                        {item.name}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {item.boughtAt
                          ? `ซื้อสำเร็จ ${formatDateTime(item.boughtAt)}`
                          : "ยังไม่บันทึกเวลาซื้อสำเร็จ"}
                      </div>
                    </div>

                    <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                      {item.qty} {item.unit}
                    </span>

                    <div className="grid shrink-0 grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => updateManagedItemStatus(item.id!, "bought")}
                        className={cn(
                          "h-8 min-w-[62px] rounded-lg border px-2 text-xs transition-all",
                          item.status === "bought"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-700"
                        )}
                      >
                        เรียบร้อย
                      </button>
                      <button
                        type="button"
                        onClick={() => updateManagedItemStatus(item.id!, "to_buy")}
                        className={cn(
                          "h-8 min-w-[62px] rounded-lg border px-2 text-xs transition-all",
                          item.status === "to_buy"
                            ? "border-slate-800 bg-slate-800 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        )}
                      >
                        รอซื้อ
                      </button>
                      <button
                        type="button"
                        onClick={() => updateManagedItemStatus(item.id!, "cancelled")}
                        className={cn(
                          "h-8 min-w-[62px] rounded-lg border px-2 text-xs transition-all",
                          item.status === "cancelled"
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-600"
                        )}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm text-slate-900">บันทึกเพิ่มเติม</Label>
              {manageNote && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-600">Modified</span>}
            </div>
            <textarea
              value={manageNote}
              onChange={(e) => setManageNote(e.target.value)}
              placeholder="ระบุรายละเอียดสำคัญ..."
              className="h-20 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>

          <AdminPrimaryButton
            type="button"
            onClick={saveManagedItems}
            submitting={submitting}
            icon={Activity}
            className="h-11 w-full text-sm"
          >
            บันทึกสถานะจัดซื้อ
          </AdminPrimaryButton>
        </div>
      </Modal>
    </>
  );
}
