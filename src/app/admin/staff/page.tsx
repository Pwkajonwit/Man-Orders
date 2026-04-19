"use client";
import { useState } from "react";
import Image from "next/image";
import { 
  AdminEmptyState,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatusChip,
} from "@/components/admin/AdminUI";
import { Users, Loader2, ShieldCheck, Link2, Search, CheckCircle2, Shield, UserPlus, Edit3, Link2Off, Trash2 } from "lucide-react";
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
  const totalStaff = staff.length;
  const adminCount = staff.filter((s) => s.role === "Admin").length;
  const activeCount = staff.filter((s) => s.status === "active").length;
  const lineConnectedCount = staff.filter((s) => s.lineUserId).length;

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
      <AdminPage className="gap-5">
        <section className="relative overflow-hidden rounded-[20px] border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(255,228,155,0.42),transparent_34%),radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_28%),linear-gradient(135deg,#fffdf5_0%,#fff8df_45%,#f2fbf8_100%)] px-4 py-4 shadow-[0_22px_50px_-48px_rgba(120,113,108,0.45)] lg:px-5">
          <div className="relative z-10 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 shadow-sm">
                <Users className="h-3.5 w-3.5" />
                Staff Directory
              </div>
              <div className="space-y-1">
                <h1 className="text-[1.85rem] font-semibold tracking-[-0.04em] text-slate-950 lg:text-[2rem]">รายชื่อพนักงาน</h1>
                <p className="truncate text-sm text-slate-600">จัดการสิทธิ์ บทบาท และการเชื่อมต่อบัญชีผู้ใช้งาน</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
              <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">ทั้งหมด</div>
                    <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{totalStaff}</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-50 text-slate-600">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Admin</div>
                    <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{adminCount}</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-blue-200 bg-blue-50 text-blue-700">
                    <Shield className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Active</div>
                    <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{activeCount}</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[148px] rounded-[14px] border border-white/80 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">LINE</div>
                    <div className="mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{lineConnectedCount}</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-amber-200 bg-amber-50 text-amber-700">
                    <Link2 className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <AdminPrimaryButton
                onClick={handleOpenAdd}
                icon={UserPlus}
                className="h-10 rounded-[14px] border-amber-300 bg-amber-300 px-4 text-sm font-semibold text-slate-950 shadow-[0_16px_24px_-22px_rgba(217,119,6,0.8)] hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
              >
                เพิ่มพนักงาน
              </AdminPrimaryButton>
            </div>
          </div>
        </section>

        <AdminPanel
          title="บัญชีผู้ใช้งาน"
          subtitle="รายการพนักงานและสิทธิ์การเข้าถึงแยกตามบทบาท"
          className="rounded-[18px] border-slate-200 shadow-[0_18px_40px_-42px_rgba(15,23,42,0.28)]"
          action={
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700" />
              <Input
                placeholder="ค้นหาพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-[14px] border border-slate-200 bg-white pl-11 text-sm text-slate-900 shadow-sm transition-all focus:border-slate-400 sm:w-72"
              />
            </div>
          }
        >
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
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#06C755]/10 px-2 py-1 text-[10px] font-bold leading-none text-[#06C755] border border-[#06C755]/20">
                              <CheckCircle2 className="h-2.5 w-2.5" /> CONNECTED
                            </span>
                            <button
                              onClick={() => handleUnlinkLine(member)}
                              type="button"
                              className="flex items-center gap-1 text-[10px] font-bold text-red-500/70 hover:text-red-600 transition-colors uppercase tracking-wider"
                            >
                              <Link2Off className="h-2.5 w-2.5" /> ยกเลิกเชื่อมต่อ
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">ยังไม่เชื่อมต่อ</span>
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "แก้ไขข้อมูลพนักงาน" : "ลงทะเบียนพนักงานใหม่"}
        className="max-w-2xl rounded-[18px] border-slate-200/90 p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.4)]"
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">ชื่อ-นามสกุล</Label>
              <Input required placeholder="ระบุชื่อจริงภาษาไทย" className="h-10 rounded-[14px] border border-slate-200 text-sm text-slate-900" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">ชื่อผู้ใช้งาน (LOGIN ID)</Label>
                <Input required placeholder="somchai_p" className="h-10 rounded-[14px] border border-slate-200 text-sm text-slate-900" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">เบอร์โทรศัพท์</Label>
                <Input placeholder="08X-XXX-XXXX" className="h-10 rounded-[14px] border border-slate-200 text-sm text-slate-900" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">บทบาทและความรับผิดชอบ</Label>
              <Select className="h-10 rounded-[14px] border border-slate-200 text-sm text-slate-900" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} >
                <option value="ผู้สั่งซื้อ">📁 ผู้สั่งซื้อ (Orderer)</option>
                <option value="พนักงานจัดซื้อ">🛒 พนักงานจัดซื้อ (Buyer)</option>
                <option value="Admin">⚡ ผู้ดูแลระบบ (Admin)</option>
              </Select>
            </div>

            {isEditing && formData.lineUserId && (
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#06C755] shadow-sm">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">เชื่อมต่อ LINE แล้ว</div>
                      <div className="text-[11px] text-slate-500">@{formData.lineDisplayName || "Unknown"}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleUnlinkLine(formData as StaffMember);
                      setFormData({ ...formData, lineUserId: undefined, linePictureUrl: undefined, lineDisplayName: undefined });
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 active:scale-95"
                  >
                    <Link2Off className="h-3.5 w-3.5" />
                    ยกเลิกการเชื่อมต่อ
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3 border-t border-slate-100 pt-5">
            <AdminSecondaryButton type="button" className="h-10 flex-1 rounded-[14px]" onClick={() => setIsModalOpen(false)}>ยกเลิก</AdminSecondaryButton>
            <AdminPrimaryButton submitting={submitting} icon={CheckCircle2} className="h-10 flex-[2] rounded-[14px]">
              {isEditing ? "บันทึกแก้ไข" : "ยืนยันลงทะเบียน"}
            </AdminPrimaryButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
