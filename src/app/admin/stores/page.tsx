"use client";
import React, { useState } from "react";
import { Store, MapPin, MoreVertical, Phone, ShoppingCart, Plus, Loader2, Trash2, Edit2, ExternalLink } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useStores } from "@/hooks/useStores";
import { useSettings } from "@/hooks/useSettings";
import { NetworkStore } from "@/types";

export default function StoresPage() {
  const { stores, loading, addStore, updateStore, deleteStore } = useStores();
  const { settings } = useSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<NetworkStore, "id">>({
    name: "",
    type: "",
    location: "",
    phone: "",
    orders: 0,
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      type: settings.categories[0] || "",
      location: "",
      phone: "",
      orders: 0,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (store: NetworkStore) => {
    setFormData({
      name: store.name,
      type: store.type,
      location: store.location,
      phone: store.phone,
      orders: store.orders,
    });
    setCurrentId(store.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && currentId) {
        await updateStore(currentId, formData);
      } else {
        await addStore(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันการลบข้อมูลร้านค้า?")) {
      try {
        await deleteStore(id);
      } catch (err) {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 uppercase leading-none tracking-tight">
            NETWORK STORES
          </h3>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
            ฐานข้อมูลรายชื่อร้านค้าพาร์ทเนอร์
          </span>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-xl h-11 px-6 text-xs bg-gray-900 text-white font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:bg-primary hover:text-black">
          <Plus className="w-4 h-4" /> REGISTER NEW STORE
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Connecting to database...</span>
        </div>
      ) : (
        <Card className="p-0 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Information</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business Type</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Orders</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all">
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 uppercase tracking-tight">{shop.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">ID: {shop.id.slice(0,8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 rounded-lg border border-gray-100">
                        {shop.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-xs font-semibold text-gray-600">{shop.location || "—"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-xs font-semibold text-gray-600">{shop.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-gray-900">{shop.orders || 0}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(shop)}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-primary hover:bg-black rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                         onClick={() => handleDelete(shop.id)}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center opacity-30">
                      <Store className="w-10 h-10 mx-auto mb-4" />
                      <span className="text-xs uppercase font-bold tracking-widest text-gray-400">ยังไม่มีข้อมูลร้านค้าในฐานข้อมูล</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Register/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing ? "แก้ไขข้อมูลร้านค้า" : "ลงทะเบียนร้านค้าใหม่"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ชื่อร้านค้า (Store Name)</Label>
              <Input 
                required 
                placeholder="ระบุชื่อร้านค้าที่จะแสดงผล..." 
                className="h-14 bg-gray-50 border-none rounded-xl text-sm font-semibold"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ประเภทธุรกิจ</Label>
                <Select 
                  className="h-14 bg-gray-50 border-none rounded-xl text-sm font-semibold pr-8"
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">เลือกประเภทสินค้า...</option>
                  {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">เบอร์โทรศัพท์ (Contact)</Label>
                <Input 
                  placeholder="เช่น 02-XXX-XXXX" 
                  className="h-14 bg-gray-50 border-none rounded-xl text-sm font-semibold"
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="px-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ที่อยู่ / พื้นที่ตั้งร้านค้า</Label>
              <Input 
                placeholder="เช่น กรุงเทพฯ, สมุทรปราการ..." 
                className="h-14 bg-gray-50 border-none rounded-xl text-sm font-semibold"
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-50 mt-8">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1 rounded-xl h-14 font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all border border-gray-100" 
              onClick={() => setIsModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button 
              disabled={submitting} 
              className="flex-[2] rounded-xl h-14 bg-gray-900 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-gray-200 transition-all hover:bg-primary hover:text-black"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? "อัปเดตข้อมูลร้านค้า" : "ลงทะเบียนร้านค้า")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
