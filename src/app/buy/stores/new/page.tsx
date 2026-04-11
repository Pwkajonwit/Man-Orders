"use client";

import { useState } from "react";
import MobileHeader from "@/components/mobile/MobileNav";
import { Button } from "@/components/ui/Button";
import { Card, Input, Label } from "@/components/ui/FormElements";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Store, MapPin, Phone, Tag, Loader2, Link2 } from "lucide-react";

export default function CreateStorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState({
    name: "",
    type: "",
    location: "",
    mapUrl: "",
    phone: "",
  });

  const handleCreate = async () => {
    if (!store.name) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "stores"), {
        ...store,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
      });
      router.push("/buy/stores");
    } catch (err) {
      alert("Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-5 pb-12">
      <MobileHeader title="เพิ่มร้านค้าใหม่" userName="ผู้ใช้งานระบบ" />

      <div className="px-1">
        <div className="eyebrow mb-2">Store Directory</div>
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">
          เพิ่มข้อมูลร้านค้า
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          กรอกข้อมูลร้านค้าเพื่อให้เลือกใช้งานได้จากหน้ารายชื่อร้านค้า
        </p>
      </div>

      <Card className="space-y-5 border-slate-300 bg-white p-5">
        <div>
          <Label className="flex items-center gap-2">
            <Store className="h-4 w-4 text-slate-500" />
            ชื่อร้านค้า
          </Label>
          <Input
            placeholder="เช่น ไทวัสดุ บางนา"
            className="h-11"
            value={store.name}
            onChange={(e) => setStore({ ...store, name: e.target.value })}
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-500" />
            ประเภทร้านค้า
          </Label>
          <Input
            placeholder="เช่น วัสดุก่อสร้าง"
            className="h-11"
            value={store.type}
            onChange={(e) => setStore({ ...store, type: e.target.value })}
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            ที่ตั้ง / สาขา
          </Label>
          <textarea
            placeholder="ระบุจังหวัด หรือพื้นที่"
            className="min-h-[96px] w-full rounded-md border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            value={store.location}
            onChange={(e) => setStore({ ...store, location: e.target.value })}
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-slate-500" />
            ลิงก์แผนที่
          </Label>
          <Input
            placeholder="วาง Google Maps URL"
            className="h-11"
            value={store.mapUrl}
            onChange={(e) => setStore({ ...store, mapUrl: e.target.value })}
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-500" />
            เบอร์โทรศัพท์ติดต่อ
          </Label>
          <Input
            placeholder="08X-XXX-XXXX"
            className="h-11"
            value={store.phone}
            onChange={(e) => setStore({ ...store, phone: e.target.value })}
          />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => router.back()} variant="secondary" className="flex-1">
          ย้อนกลับ
        </Button>
        <Button
          disabled={loading || !store.name}
          onClick={handleCreate}
          variant="accent"
          className="flex-[1.4]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "บันทึกร้านค้า"}
        </Button>
      </div>
    </div>
  );
}
