"use client";
import { useState } from "react";
import Image from "next/image";
import { 
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusChip,
} from "@/components/admin/AdminUI";
import { Users, Loader2, ShieldCheck, Link2, Search, CheckCircle2, Shield, UserPlus, Edit3 } from "lucide-react";
import { cn } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useStaff, StaffMember } from "@/hooks/useStaff";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function StaffPage() {
  const { staff, loading } = useStaff();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: "",
    username: "",
    phone: "",
    role: "ผู้สั่งซื้อ",
    status: "active"
  });

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const staffStats = [
    { label: "TOTAL STAFF", value: staff.length, icon: Users, color: "text-slate-400", bg: "bg-slate-50" },
    { label: "ADMINISTRATORS", value: staff.filter(s => s.role === 'Admin').length, icon: Shield, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "ACTIVE USERS", value: staff.filter(s => s.status === 'active').length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "LINE CONNECTED", value: staff.filter(s => s.lineUserId).length, icon: Link2, color: "text-[#06C755]", bg: "bg-[#06C755]/5" },
  ];

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

  const handleUnlinkLine = async (member: StaffMember) => {
    if (!confirm(`ยกเลิกการเชื่อมต่อ LINE ของ ${member.name} ?`)) return;
    try {
      await updateDoc(doc(db, "users", member.id), {
        lineUserId: null,
        linePictureUrl: null,
        lineDisplayName: null,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Unlink LINE error:", err);
      alert("เกิดข้อผิดพลาด");
    }
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
      alert(`Error saving staff member.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminPage>
        <AdminHeader
          title="รายชื่อพนักงาน"
          subtitle="จัดการสิทธิ์การเข้าถึงข้อมูลและบัญชีผู้ใช้งานในระบบ"
          actions={
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                <Input
                  placeholder="ค้นหาพนักงาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 w-64 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 transition-all focus:border-slate-400"
                />
              </div>
              <AdminPrimaryButton onClick={handleOpenAdd} icon={UserPlus}>
                เพิ่มพนักงาน
              </AdminPrimaryButton>
            </div>
          }
        />

        <AdminStatGrid>
          <AdminStatCard
            label="บุคลากรทั้งหมด"
            value={staff.length}
            detail="บัญชีที่ลงทะเบียนในระบบ"
            icon={Users}
            tone="slate"
          />
          <AdminStatCard
            label="ผู้ดูแลระบบ"
            value={staff.filter((s) => s.role === "Admin").length}
            detail="สิทธิ์เข้าถึง Administrative"
            icon={Shield}
            tone="blue"
          />
          <AdminStatCard
            label="Active Users"
            value={staff.filter((s) => s.status === "active").length}
            detail="บัญชีที่เปิดโหมดใช้งานอยู่"
            icon={CheckCircle2}
            tone="emerald"
          />
          <AdminStatCard
            label="LINE Connected"
            value={staff.filter((s) => s.lineUserId).length}
            detail="เชื่อมบัญชีแจ้งเตือนแล้ว"
            icon={Link2}
            tone="amber"
          />
        </AdminStatGrid>

        <AdminPanel title="บัญชีผู้ใช้งาน" subtitle="รายการพนักงานและสิทธิ์การเข้าถึงแยกตามบทบาท">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ข้อมูลพนักงาน</th>
                  <th>บทบาทระบบ</th>
                  <th>สถานะ</th>
                  <th>การติดต่อ</th>
                  <th>บัญชี LINE</th>
                  <th className="text-right">จัดการ</th>
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
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <AdminEmptyState
                        icon={Users}
                        title={searchQuery ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลพนักงาน"}
                        description={searchQuery ? "ลองระบุชื่อหรือรหัสพนักงานใหม่อีกครั้ง" : "เริ่มต้นโดยการเพิ่มบัญชีพนักงานใหม่"}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden ring-1 ring-slate-200">
                            {member.linePictureUrl ? (
                              <Image src={member.linePictureUrl} alt={member.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-slate-900 leading-tight">{member.name}</div>
                            <div className="mt-1 text-xs text-slate-500">@{member.username || member.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className={cn("h-4 w-4", member.role === "Admin" ? "text-primary border-primary" : "text-slate-300")} />
                          <span className="text-sm text-slate-700">{member.role}</span>
                        </div>
                      </td>
                      <td>
                        <AdminStatusChip
                          label={member.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                          tone={member.status === "active" ? "emerald" : "slate"}
                        />
                      </td>
                      <td className="text-sm text-slate-500">
                        {member.phone || "—"}
                      </td>
                      <td>
                        {member.lineUserId ? (
                          <div className="flex flex-col gap-1 items-start group/line">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#06C755]/10 px-2 py-1 text-xs leading-none text-[#06C755]">
                              <Link2 className="h-3 w-3" /> CONNECTED
                            </span>
                            <button
                              onClick={() => handleUnlinkLine(member)}
                              type="button"
                              className="whitespace-nowrap text-xs text-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              UNLINK ACCOUNT ?
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">ไม่ได้เชื่อมต่อ</span>
                        )}
                      </td>
                      <td className="text-right">
                        <AdminSecondaryButton onClick={() => handleOpenEdit(member)} icon={Edit3} className="h-8 w-8 p-0" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </AdminPage>

      {/* Staff Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "แก้ไขข้อมูลพนักงาน" : "ลงทะเบียนพนักงานใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">ชื่อ-นามสกุล</Label>
              <Input required placeholder="ระบุชื่อจริงภาษาไทย" className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">ชื่อผู้ใช้งาน (LOGIN ID)</Label>
                <Input required placeholder="somchai_p" className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">เบอร์โทรศัพท์</Label>
                <Input placeholder="08X-XXX-XXXX" className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">บทบาทและความรับผิดชอบ</Label>
              <Select className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} >
                <option value="ผู้สั่งซื้อ">📁 ผู้สั่งซื้อ (Orderer)</option>
                <option value="พนักงานจัดซื้อ">🛒 พนักงานจัดซื้อ (Buyer)</option>
                <option value="Admin">⚡ ผู้ดูแลระบบ (Admin)</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
            <AdminSecondaryButton type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>ยกเลิก</AdminSecondaryButton>
            <AdminPrimaryButton submitting={submitting} icon={CheckCircle2} className="flex-[2]">
              {isEditing ? "บันทึกแก้ไข" : "ยืนยันลงทะเบียน"}
            </AdminPrimaryButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
