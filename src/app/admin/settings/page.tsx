"use client";
import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Trash2,
  Plus,
  CheckCircle2,
  Briefcase,
  Box,
  Tag,
  BellRing,
  Loader2,
  MessageSquare,
  Send,
  ShoppingCart,
  PackageCheck,
  ShieldAlert,
  Server,
  Globe
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const [newCat, setNewCat] = useState("");
  const [newUnit, setNewUnit] = useState("");

  useEffect(() => {
    if (!loading) {
      setLocalSettings(settings);
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: 'categories' | 'units', value: string, setValue: Function) => {
    if (value && !localSettings[field].includes(value)) {
      setLocalSettings({
        ...localSettings,
        [field]: [...localSettings[field], value]
      });
      setValue("");
    }
  };

  const removeItem = (field: 'categories' | 'units', value: string) => {
    setLocalSettings({
      ...localSettings,
      [field]: localSettings[field].filter(item => item !== value)
    });
  };

  const toggleOption = (field: 'lineNotifyEnabled' | 'orderFilteringEnabled' | 'notifyOnNewOrder' | 'notifyOnCompleted') => {
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field]
    });
  };

  const handleTestNotification = async () => {
    if (!localSettings.lineGroupId?.trim()) {
      setTestResult({ ok: false, msg: "กรุณาระบุ LINE Group ID ก่อน" });
      return;
    }

    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/line-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: localSettings.lineGroupId.trim(),
          message: `🔔 ทดสอบการแจ้งเตือน\n\nระบบ: ${localSettings.systemName}\nบริษัท: ${localSettings.companyName}\n\n✅ การเชื่อมต่อ LINE สำเร็จ!`,
        }),
      });

      if (res.ok) {
        setTestResult({ ok: true, msg: "ส่งข้อความทดสอบสำเร็จ!" });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({ ok: false, msg: data.error || "ส่งข้อความไม่สำเร็จ" });
      }
    } catch (err) {
      setTestResult({ ok: false, msg: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse text-slate-300">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <span className="text-sm">กำลังโหลดข้อมูลการตั้งค่า...</span>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-xl text-slate-900">ตั้งค่าระบบ</h1>
          <p className="text-sm text-slate-500">พารามิเตอร์หลักของระบบ</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex h-11 items-center gap-2.5 rounded-xl bg-slate-900 px-8 text-sm text-white shadow-md transition-all hover:bg-black active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-white" />}
          บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: General Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white border-2 border-slate-100 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base text-slate-900 leading-tight">เอกลักษณ์องค์กร</h4>
                <span className="text-sm text-slate-500">การตั้งค่าข้อมูลทั่วไป</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">ชื่อระบบ (SYSTEM ID)</Label>
                <Input
                  value={localSettings.systemName}
                  onChange={(e) => setLocalSettings({ ...localSettings, systemName: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">ชื่อนิติบุคคล / บริษัท</Label>
                <Input
                  value={localSettings.companyName}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-400"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-slate-100 rounded-2xl space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <BellRing className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base text-slate-900 leading-tight">ฟีเจอร์หลัก</h4>
                <span className="text-sm text-slate-500">จัดการคุณสมบัติหลัก</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'lineNotifyEnabled', label: 'แจ้งเตือนอัตโนมัติ (LINE)' },
                { id: 'orderFilteringEnabled', label: 'การคัดกรองออเดอร์แม่นยำ' }
              ].map((opt) => (
                <div key={opt.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <span className="text-sm text-slate-700">{opt.label}</span>
                  <button
                    type="button"
                    onClick={() => toggleOption(opt.id as any)}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition-all duration-300",
                      localSettings[opt.id as keyof typeof localSettings] ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300",
                      localSettings[opt.id as keyof typeof localSettings] ? "left-6" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white border-2 border-slate-100 rounded-2xl space-y-6 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base text-slate-900">LINE Group API</h4>
                <span className="text-sm text-slate-500">การแจ้งเตือนกลุ่มหลัก</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">รหัสกลุ่มแจ้งเตือน (GROUP ID)</Label>
                <Input
                  value={localSettings.lineGroupId || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, lineGroupId: e.target.value })}
                  placeholder="Cxxxxxxxxxxxxxxxx..."
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50/30 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="space-y-2">
                {[
                  { id: 'notifyOnNewOrder', label: 'แจ้งเตือนเมื่อมีออร์เดอร์ใหม่', icon: ShoppingCart, color: 'text-amber-500' },
                  { id: 'notifyOnCompleted', label: 'แจ้งเตือนเมื่อสั่งซื้อสำเร็จ', icon: PackageCheck, color: 'text-emerald-500' }
                ].map((evt) => (
                  <div key={evt.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 group hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <evt.icon className={cn("h-4 w-4", evt.color)} />
                      <span className="text-sm text-slate-800">{evt.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleOption(evt.id as any)}
                      className={cn(
                        "h-4 w-8 rounded-full relative transition-all duration-300",
                        localSettings[evt.id as keyof typeof localSettings] ? "bg-[#06C755]" : "bg-slate-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300",
                        localSettings[evt.id as keyof typeof localSettings] ? "left-4.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  disabled={testSending || !localSettings.lineGroupId?.trim()}
                  className={cn(
                    "flex h-11 w-full items-center justify-center gap-2.5 rounded-xl text-sm transition-all active:scale-95",
                    localSettings.lineGroupId?.trim()
                      ? "bg-[#06C755] text-white shadow-lg shadow-[#06C755]/10 hover:brightness-105"
                      : "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                  )}
                >
                  {testSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  ทดสอบส่งการแจ้งเตือน
                </button>
              </div>

              {testResult && (
                <div className={cn("rounded-xl border bg-slate-50 p-4 text-sm text-center", testResult.ok ? "border-emerald-100 text-emerald-600" : "border-red-100 text-red-500")}>
                  {testResult.msg}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Center/Right Column: Master Data Tables */}
        <div className="lg:col-span-8 space-y-8">
          {/* Categories Management */}
          <Card className="p-8 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-md">
                  <Tag className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg text-slate-900 leading-tight">คลังหมวดหมู่สินค้า</h4>
                  <span className="mt-0.5 block text-sm text-slate-500">จัดการหมวดหมู่สินค้าส่วนกลาง</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 max-w-md mb-8">
              <Input
                placeholder="ระบุหมวดหมู่ใหม่..."
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-400"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              />
              <button
                type="button"
                onClick={() => addItem('categories', newCat, setNewCat)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:bg-black active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {localSettings.categories.length === 0 && (
                <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-100 py-12 text-center text-sm text-slate-400">
                  ไม่มีข้อมูลหมวดหมู่สินค้า
                </div>
              )}
              {localSettings.categories.map((cat) => (
                <div key={cat} className="group relative flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-primary/50 hover:bg-white transition-all">
                  <span className="text-sm text-slate-700">{cat}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('categories', cat)}
                    className="h-8 w-8 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Units Management */}
          <Card className="p-8 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-md">
                  <Box className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg text-slate-900 leading-tight">มาตราส่วน / หน่วยนับ</h4>
                  <span className="mt-0.5 block text-sm text-slate-500">ทะเบียนหน่วยนับสินค้ามาตรฐาน</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 max-w-md mb-8">
              <Input
                placeholder="เช่น ลัง, กิโล, ม้วน..."
                className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-400"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
              />
              <button
                type="button"
                onClick={() => addItem('units', newUnit, setNewUnit)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:bg-black active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {localSettings.units.length === 0 && (
                <div className="w-full rounded-3xl border-2 border-dashed border-slate-100 py-12 text-center text-sm text-slate-400">
                  ไม่มีข้อมูลหน่วยนับ
                </div>
              )}
              {localSettings.units.map((unit) => (
                <div key={unit} className="group relative px-6 py-3 bg-slate-50/80 border border-slate-100 hover:border-primary/30 hover:bg-white rounded-2xl flex items-center gap-3 transition-all cursor-default">
                  <span className="text-base text-slate-700">{unit}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('units', unit)}
                    className="h-6 w-0 flex items-center justify-center text-red-400 overflow-hidden group-hover:w-6 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="pt-12 flex flex-col items-center justify-center opacity-30 grayscale contrast-125">
        <div className="flex items-center gap-6 mb-4 text-slate-400">
          <Server className="h-4 w-4" />
          <Globe className="h-4 w-4" />
          <ShieldAlert className="h-4 w-4" />
        </div>
        <p className="text-sm text-slate-400">ระบบบริหารจัดการทรัพยากรองค์กร v2.9.2</p>
      </div>
    </div>
  );
}
