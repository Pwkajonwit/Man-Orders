"use client";
import { useState } from "react";
import { Users, MoreVertical, Loader2, Phone, ShieldCheck, Mail, Smartphone, UserPlus } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useStaff, StaffMember } from "@/hooks/useStaff";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function StaffPage() {
  const { staff, loading } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: "",
    username: "",
    phone: "",
    role: "ผู้สั่งซื้อ",
    status: "active"
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", username: "", phone: "", role: "ผู้สั่งซื้อ", status: "active" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setIsEditing(true);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && formData.id) {
        await updateDoc(doc(db, "users", formData.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        const newId = `user_${Date.now()}`;
        await setDoc(doc(db, "users", newId), {
          ...formData,
          id: newId,
          deals: 0,
          createdAt: serverTimestamp(),
          status: "active"
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      alert(`Error saving staff member. Check browser console for details or verify Firebase keys in .env.local.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 uppercase tracking-tight">รายชื่อทีมงานทั้งหมด</h3>
        <Button onClick={handleOpenAdd} className="rounded-xl px-6 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> เพิ่มพนักงานใหม่
        </Button>
      </div>
      <Card className="bg-white border border-gray-100 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border border-gray-100/50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100 uppercase tracking-wider">พนักงาน</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100 uppercase tracking-wider">ตำแหน่ง / สิทธิ์</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100 uppercase tracking-wider">เบอร์โทรศัพท์</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100 uppercase tracking-wider text-center">รวมรายการ</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 border-b border-gray-100 uppercase tracking-wider text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-semibold">ไม่พบรายชื่อพนักงาน</td>
                </tr>
              ) : staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 border border-gray-100/50 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                        <Users className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                        <span className="text-xs text-gray-400 font-medium">@{member.username || member.id.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={cn("w-4 h-4", member.role === 'Admin' ? "text-primary" : "text-gray-400")} />
                      <span className="text-sm font-semibold text-gray-700">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-xl", member.status === 'active' ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{member.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Phone className="w-3.5 h-3.5 opacity-40" /> {member.phone || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-semibold text-gray-900"> {member.deals || 0} </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => handleOpenEdit(member)} className="text-gray-300 hover:text-gray-900 transition-colors p-2" >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Staff Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"} >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <Label>ชื่อ-นามสกุล</Label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input required placeholder="เช่น สมชาย มีสุข" className="pl-12 bg-gray-50 border-gray-100" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>ชื่อผู้ใช้งาน (Username)</Label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input required placeholder="เช่น somchai_123" className="pl-12 bg-gray-50 border-gray-100" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>เบอร์โทรศัพท์</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="08X-XXX-XXXX" className="pl-12 bg-gray-50 border-gray-100" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label>ตำแหน่งงาน / สิทธิ์การใช้งาน</Label>
                <Select className="bg-gray-50 border-gray-100 font-semibold" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} >
                  <option value="ผู้สั่งซื้อ">📁 ผู้สั่งซื้อ (Orderer)</option>
                  <option value="พนักงานจัดซื้อ">🛒 พนักงานจัดซื้อ (Buyer)</option>
                  <option value="Admin">⚡ ผู้ดูแลระบบ (Admin)</option>
                </Select>
                <p className="text-xs text-gray-400 mt-2 px-1 uppercase tracking-wider font-bold opacity-70"> * กำหนดตำแหน่งเพื่อให้ระบบแยกหน้าการใช้งานอัตโนมัติ </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="secondary" className="flex-1 py-6 rounded-xl bg-white border border-gray-100 font-bold uppercase tracking-wider text-xs" onClick={() => setIsModalOpen(false)} >ยกเลิก</Button>
            <Button disabled={submitting} className="flex-[2] py-6 rounded-xl bg-gray-900 text-white font-bold uppercase tracking-wider text-xs" >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isEditing ? "บันทึกการแก้ไข" : "สร้างบัญชีพนักงาน"}
            </Button>
          </div>
        </form>
      </Modal>
      <div className="pt-4 px-2">
        <p className="text-xs text-gray-400">แสดงผลข้อมูลพนักงานแบบเรียลไทม์จากระบบ Firebase Authentication</p>
      </div>
    </div>
  );
}