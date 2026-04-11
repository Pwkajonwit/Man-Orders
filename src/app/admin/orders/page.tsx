"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  Filter,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Plus,
  Trash2,
  User,
  Store,
  Edit3,
  XCircle,
  FileText
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useOrders } from "@/hooks/useOrders";
import { useStaff } from "@/hooks/useStaff";
import { useSettings } from "@/hooks/useSettings";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Order, Item } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/50",
  buying: "bg-blue-50 text-blue-700 border-blue-200/50",
  sorting: "bg-purple-50 text-purple-700 border-purple-200/50",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  cancelled: "bg-red-50 text-red-700 border-red-200/50",
};

export default function OrdersPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, loading, updateOrderStatus, createOrder, updateOrder, updateItemStatus } = useOrders();
  const { staff } = useStaff();
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Forms state
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

  // Sync default unit
  useEffect(() => {
    if (!settingsLoading && settings.units.length > 0) {
      setNewItem(prev => ({ ...prev, unit: prev.unit || settings.units[0] }));
    }
  }, [settingsLoading, settings.units]);

  const stats = [
    {
      label: "รายการทั้งหมด",
      value: orders.length,
      icon: Package,
      color: "text-gray-400",
      bg: "bg-gray-50 border border-gray-100",
    },
    {
      label: "รอรับเรื่อง",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "กำลังจัดซื้อ",
      value: orders.filter((o) => o.status === "buying").length,
      icon: ShoppingCart,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "จัดส่งแล้ว",
      value: orders.filter((o) => o.status === "completed").length,
      icon: Truck,
      color: "text-green-500",
      bg: "bg-green-50",
    },
  ];

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      requesterId: "",
      requesterName: "",
      storeName: "",
      items: [],
      status: "pending",
      note: "",
    });
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
    setFormData({
      ...formData,
      items: (formData.items || []).filter((i) => i.id !== id),
    });
  };

  const updateManagedItemStatus = (itemId: string, status: Item["status"]) => {
    setManagedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status } : item
    ));
  };

  const saveManagedItems = async () => {
    if (!managingOrder) return;
    setSubmitting(true);
    try {
      // Check if all items are completed to auto-complete the order
      const allCompleted = managedItems.length > 0 && managedItems.every(i => i.status !== "to_buy");
      
      let newStatus = managingOrder.status;
      if (allCompleted) newStatus = "completed";
      else newStatus = "buying";

      await updateOrder(managingOrder.id, {
        items: managedItems,
        note: manageNote,
        status: newStatus
      });
      
      setIsManageModalOpen(false);
    } catch (err) {
      console.error(err);
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
      if (isEditing && formData.id) {
        await updateOrder(formData.id, formData);
      } else {
        await createOrder(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  if (settingsLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 antialiased font-normal text-gray-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-2xl text-gray-900 uppercase leading-none">
            จัดการรายการสั่งซื้อ
          </h3>
          <span className="text-sm text-gray-400 mt-1">
            ระบบจัดการรายการสั่งซื้อเรียลไทม์
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="ค้นหาบิลสั่งซื้อ..."
              className="pl-12 pr-4 h-11 bg-white border border-gray-100 rounded-xl w-64 text-sm"
            />
          </div>
          <Button
            onClick={handleOpenAdd}
            className="rounded-xl h-11 px-6 text-sm bg-gray-900 text-white flex items-center gap-2 hover:bg-primary hover:text-black transition-all"
          >
            <Plus className="w-4 h-4" /> สร้างออเดอร์ใหม่
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-gray-900 text-sm">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4 bg-white border border-gray-100 rounded-xl transition-transform hover:translate-y-[-2px]">
            <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400 uppercase">{stat.label}</span>
              <span className="text-2xl text-gray-900">{stat.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-white border border-gray-100 rounded-xl p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border border-gray-100/50">
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100">เลขที่ออเดอร์</th>
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100">พนักงานผู้สั่ง</th>
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100">ชื่อร้านค้า</th>
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100 text-center">รายการ</th>
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100 tracking-tight">สถานะปัจจุบัน</th>
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100 text-right">วันที่สร้าง</th>
                <th className="px-8 py-5 text-xs text-gray-400 uppercase border-b border-gray-100 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {loading ? (
                <tr><td colSpan={7} className="px-8 py-32 text-center"><Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-8 py-40 text-center opacity-30">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <span className="text-sm text-gray-400 uppercase tracking-tight">ยังไม่มีรายการสั่งซื้อ</span>
                </td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-all font-medium">
                    <td className="px-8 py-6 text-sm text-gray-900 tracking-tight">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-8 py-6 text-sm text-gray-900">{order.requesterName}</td>
                    <td className="px-8 py-6 text-sm text-gray-600">{order.storeName || "—"}</td>
                    <td className="px-8 py-6 text-center text-sm text-gray-500 uppercase">{order.items.length} สินค้า</td>
                    <td className="px-8 py-6">
                       <button
                        onClick={() => handleOpenManage(order)}
                        className={cn(
                          "inline-flex items-center rounded-lg px-3 py-1 border text-[11px] font-bold tracking-tight uppercase transition-all whitespace-nowrap hover:scale-105 active:scale-95 shadow-sm",
                          STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border-gray-100"
                        )}
                      >
                        {order.status === "pending" && "รอยืนยัน"}
                        {order.status === "buying" && "กำลังซื้อ"}
                        {order.status === "completed" && "สำเร็จแล้ว"}
                        {order.status === "cancelled" && "ยกเลิก"}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right text-xs text-gray-500 uppercase">
                      {order.createdAt ? format(order.createdAt.toDate(), "dd MMM yyyy", { locale: th }) : "—"}
                    </td>
                    <td className="px-8 py-6 text-center flex items-center justify-center gap-2">
                       <Button onClick={() => handleOpenManage(order)} variant="secondary" className="rounded-xl h-10 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-black border-none">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleOpenEdit(order)} variant="secondary" className="rounded-xl h-10 px-4 bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Main Order Modal (Add/Edit) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "แก้ไขบิลสั่งซื้อ" : "สร้างบิลสั่งซื้อใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">พนักงานผู้สั่งซื้อ</Label>
              <Select required value={formData.requesterId} className="h-14 bg-gray-50 border-none rounded-xl text-sm" onChange={(e) => {
                const s = staff.find(st => st.id === e.target.value);
                setFormData({ ...formData, requesterId: e.target.value, requesterName: s?.name || "" });
              }}>
                <option value="">เลือกพนักงานผู้แนะนำ...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">ร้านค้า (หากระบุพิกัด)</Label>
              <Input placeholder="ระบุชื่อร้านค้าพาร์ทเนอร์..." className="h-14 bg-gray-50 border-none rounded-xl text-sm" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} />
            </div>
            <div className="pt-6 border-t border-gray-100 space-y-4 text-gray-900">
              <Label className="text-gray-400 uppercase text-xs tracking-wider">รายการสินค้า</Label>
              <div className="flex gap-2">
                <Input placeholder="ชื่อสินค้า..." className="flex-[2] h-14 bg-gray-50 border-none rounded-xl text-sm" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                <Input type="number" placeholder="0" className="flex-1 h-14 bg-gray-50 border-none rounded-xl text-sm" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })} />
                <Select className="flex-1 h-14 bg-gray-50 border-none rounded-xl text-sm" value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                  {settings.units.map(u => <option key={u} value={u}>{u}</option>)}
                </Select>
                <Button type="button" onClick={handleAddItem} className="bg-gray-900 w-14 h-14 p-0 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-lg shadow-gray-200">
                  <Plus className="w-6 h-6 text-white" />
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(formData.items || []).map((item: Item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{item.name}</span>
                      <span className="text-xs text-gray-400 uppercase">{item.qty} {item.unit}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <Button type="button" variant="secondary" className="flex-1 h-14 rounded-xl border-gray-100 text-gray-500" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
            <Button disabled={submitting} className="flex-[2] h-14 bg-gray-900 text-white uppercase text-sm tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-gray-200">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> {isEditing ? "อัปเดตข้อมูลบิล" : "ยืนยันสร้างออเดอร์"}</>}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Management Modal (Fulfillment) */}
      <Modal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
        title={managingOrder?.storeName || "รายละเอียดออเดอร์"}
        showClose={false}
      >
        <div className="space-y-8">
           {/* Header Info */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-900">{managingOrder?.storeName || "ร้านค้า"}</h2>
              <span className="text-sm text-gray-400 font-medium">{managedItems.length} รายการ</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-700">คุณ {managingOrder?.requesterName}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-6">
             {managedItems.map((item) => (
               <div key={item.id} className="flex items-center justify-between gap-4">
                 <div className="flex-[2]">
                    <span className="text-lg font-bold text-gray-900">{item.name}</span>
                 </div>
                 <div className="flex-1 text-center">
                    <span className="text-lg font-medium text-gray-700">{item.qty} {item.unit}</span>
                 </div>
                 <div className="flex-[2] flex gap-2">
                    <button 
                      onClick={() => updateManagedItemStatus(item.id!, "bought")}
                      className={cn(
                        "flex-1 h-11 rounded-lg text-xs font-bold transition-all",
                        item.status === "bought" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      )}
                    >
                      เรียบร้อย
                    </button>
                    <button 
                      onClick={() => updateManagedItemStatus(item.id!, "to_buy")}
                      className={cn(
                        "flex-1 h-11 rounded-lg text-xs font-bold transition-all",
                        item.status === "to_buy" ? "bg-gray-300 text-gray-700" : "bg-gray-100 text-gray-400"
                      )}
                    >
                      อัพเดท
                    </button>
                    <button 
                      onClick={() => updateManagedItemStatus(item.id!, "cancelled")}
                      className={cn(
                        "flex-1 h-11 rounded-lg text-xs font-bold transition-all",
                        item.status === "cancelled" ? "bg-red-400 text-white shadow-lg shadow-red-100" : "bg-red-400/10 text-red-500 border border-red-400/20"
                      )}
                    >
                      ไม่มี
                    </button>
                 </div>
               </div>
             ))}
          </div>

          {/* Note Section */}
          <div className="space-y-3 pt-6 border-t border-gray-100">
             <div className="flex items-center gap-2 text-gray-700 font-bold">
                <FileText className="w-4 h-4" />
                <span>บันทึก</span>
             </div>
             <textarea 
               value={manageNote}
               onChange={(e) => setManageNote(e.target.value)}
               placeholder="ระบุหมายเหตุเพิ่มเติม..."
               className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-gray-600 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none font-medium"
             />
          </div>

          {/* Save Button */}
          <Button 
            onClick={saveManagedItems}
            disabled={submitting}
            className="w-full h-16 bg-gray-900 hover:bg-black text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 mt-4"
          >
            {submitting ? <Loader2 className="animate-spin" /> : "เสร็จสิ้น"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
