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
    <div className="mx-auto max-w-md pb-20 text-slate-950">
      <MobileHeader
        title="เพิ่มร้านค้าใหม่"
        userName={buyer?.lineDisplayName || buyer?.name || "ผู้ใช้งานระบบ"}
        userAvatar={buyer?.linePictureUrl}
        userRole={buyer?.role || "ผู้ใช้งานระบบ"}
        onBack={() => router.push("/buy/stores")}
      />

      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold leading-tight text-slate-950">
          ลงทะเบียนร้านค้า
        </h2>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
          Partnership Registration
        </p>
      </div>

      <div className="space-y-5 px-4 pt-5">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-950">
              ชื่อร้านค้า
            </Label>
            <Input
              placeholder="เช่น ร้านวัสดุก่อสร้าง A"
              className="h-11 text-sm font-semibold text-slate-950 placeholder:text-slate-500"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-950">
              ประเภทร้าน
            </Label>
            <Select
              className="h-11 text-sm font-semibold text-slate-950"
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

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-950">
              ที่อยู่ร้านค้า
            </Label>
            <textarea
              placeholder="เช่น บางพลี สมุทรปราการ"
              className="min-h-[96px] w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              value={store.location}
              onChange={(e) => setStore({ ...store, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-950">
                เบอร์ติดต่อ
              </Label>
              <Input
                placeholder="08X-XXX-XXXX"
                className="h-11 text-sm font-semibold text-slate-950 placeholder:text-slate-500"
                value={store.phone}
                onChange={(e) => setStore({ ...store, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-950">
                Google Maps URL
              </Label>
              <Input
                placeholder="ลิงก์แผนที่"
                className="h-11 text-sm font-semibold text-slate-950 placeholder:text-slate-500"
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
            className="h-11 flex-1 text-sm font-bold"
          >
            ยกเลิก
          </Button>
          <Button
            disabled={loading || !store.name}
            onClick={handleCreate}
            className="h-11 flex-[1.5] text-sm font-bold"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </div>
      </div>
    </div>
  );
}
