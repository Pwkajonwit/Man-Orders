"use client";

import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/FormElements";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useSettings } from "@/hooks/useSettings";
import {
  Store,
  MapPin,
  Phone,
  Tag,
  Loader2,
  Link2,
  PlusCircle,
  Building2,
} from "lucide-react";

export default function CreateStorePage() {
  const router = useRouter();
  const { buyer } = useBuyerAuth();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState({
    name: "",
    type: settings.categories[0] || "",
    location: "",
    mapUrl: "",
    phone: "",
    orders: 0,
  });

  const handleCreate = async () => {
    if (!store.name) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "stores"), {
        ...store,
        orders: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/buy/stores");
    } catch (err) {
      alert("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 pb-20">
      <MobileHeader
        title="เพิ่มร้านค้าใหม่"
        userName={buyer?.lineDisplayName || buyer?.name || "ผู้ใช้งานระบบ"}
        userAvatar={buyer?.linePictureUrl}
        userRole={buyer?.role || "ผู้ใช้งานระบบ"}
        onBack={() => router.push("/buy/stores")}
      />

      <div className="px-1.5 pt-2">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <PlusCircle className="h-4.5 w-4.5" />
          </div>
          <h2 className="text-[20px] font-black leading-none tracking-tight text-slate-900">
            ลงทะเบียนร้านค้า
          </h2>
        </div>
        <p className="text-[11px] font-bold leading-relaxed text-slate-400">
          Partnership Registration
        </p>
      </div>

      <div className="animate-in slide-in-from-bottom-2 fade-in space-y-4 px-1.5 duration-300">
        <div className="space-y-5 rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 px-0.5 text-[10px] font-black text-slate-400">
              <Building2 className="h-3 w-3" />
              ชื่อร้านค้า
            </Label>
            <Input
              placeholder="เช่น ร้านวัสดุก่อสร้าง A"
              className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 outline-none transition-all"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 px-0.5 text-[10px] font-black text-slate-400">
              <Tag className="h-3 w-3" />
              ประเภทร้าน
            </Label>
            <Select
              className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 outline-none transition-all"
              value={store.type}
              onChange={(e) => setStore({ ...store, type: e.target.value })}
            >
              <option value="">เลือกประเภท...</option>
              {settings.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 px-0.5 text-[10px] font-black text-slate-400">
              <MapPin className="h-3 w-3" />
              ที่อยู่ร้านค้า
            </Label>
            <textarea
              placeholder="เช่น บางพลี สมุทรปราการ"
              className="min-h-[100px] w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-3.5 text-[14px] font-bold text-slate-900 outline-none transition-all"
              value={store.location}
              onChange={(e) => setStore({ ...store, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 px-0.5 text-[10px] font-black text-slate-400">
                <Phone className="h-3 w-3" />
                เบอร์ติดต่อ
              </Label>
              <Input
                placeholder="08X-XXX-XXXX"
                className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 outline-none transition-all"
                value={store.phone}
                onChange={(e) => setStore({ ...store, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 px-0.5 text-[10px] font-black text-slate-400">
                <Link2 className="h-3 w-3" />
                Google Maps URL
              </Label>
              <Input
                placeholder="ลิงก์แผนที่"
                className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 text-[14px] font-bold text-slate-900 outline-none transition-all"
                value={store.mapUrl}
                onChange={(e) => setStore({ ...store, mapUrl: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="h-12 flex-1 rounded-xl border-2 text-sm font-black"
          >
            ยกเลิก
          </Button>
          <Button
            disabled={loading || !store.name}
            onClick={handleCreate}
            className="h-12 flex-[1.5] rounded-xl bg-primary text-sm font-black text-slate-950 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "บันทึกข้อมูล"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
