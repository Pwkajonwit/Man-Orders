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
  Loader2
} from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input, Label, Select } from "@/components/ui/FormElements";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  
  const [newCat, setNewCat] = useState("");
  const [newUnit, setNewUnit] = useState("");

  // Sync local state when remote data loads
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

  const toggleOption = (field: 'lineNotifyEnabled' | 'orderFilteringEnabled') => {
    setLocalSettings({
      ...localSettings,
      [field]: !localSettings[field]
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">กำลังโหลดข้อมูลระบบ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 uppercase leading-none tracking-tight">
            System Settings
          </h3>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
            จัดการข้อมูลพื้นฐานและตัวเลือกในระบบ (Firebase Realtime)
          </span>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl h-11 px-6 text-xs bg-gray-900 text-white font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-primary hover:text-black transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SAVE CHANGES
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Info */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="p-6 bg-white border border-gray-100 rounded-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm uppercase text-gray-900">เอกลักษณ์องค์กร</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>ชื่อระบบ (System Name)</Label>
                <Input 
                  value={localSettings.systemName} 
                  onChange={(e) => setLocalSettings({...localSettings, systemName: e.target.value})}
                  className="bg-gray-50 border-none rounded-xl text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label>ชื่อบริษัท (Company Name)</Label>
                <Input 
                  value={localSettings.companyName} 
                  onChange={(e) => setLocalSettings({...localSettings, companyName: e.target.value})}
                  className="bg-gray-50 border-none rounded-xl text-sm"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-100 rounded-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <BellRing className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm uppercase text-gray-900">การแจ้งเตือน</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                <span className="text-xs font-bold uppercase text-gray-700">แจ้งเตือนผ่าน Line</span>
                <button 
                  onClick={() => toggleOption('lineNotifyEnabled')}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-200",
                    localSettings.lineNotifyEnabled ? "bg-primary" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200",
                    localSettings.lineNotifyEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                <span className="text-xs font-bold uppercase text-gray-700">ระบบคัดกรองออเดอร์</span>
                <button 
                  onClick={() => toggleOption('orderFilteringEnabled')}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-200",
                    localSettings.orderFilteringEnabled ? "bg-primary" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200",
                    localSettings.orderFilteringEnabled ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Options / Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Categories Management */}
          <Card className="p-6 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase text-gray-900">หมวดหมู่สินค้า</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Product Categories</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Input 
                placeholder="เพิ่มหมวดหมู่ใหม่..." 
                className="bg-gray-50 border-none rounded-xl"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              />
              <Button 
                onClick={() => addItem('categories', newCat, setNewCat)}
                className="rounded-xl px-6 bg-gray-900 text-white font-bold h-11"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {localSettings.categories.map((cat) => (
                <div key={cat} className="group relative flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary transition-all">
                  <span className="text-xs font-bold text-gray-700">{cat}</span>
                  <button 
                    onClick={() => removeItem('categories', cat)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Units Management */}
          <Card className="p-6 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase text-gray-900">หน่วยนับ</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">UOM Settings</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Input 
                placeholder="เพิ่มหน่วยนับใหม่..." 
                className="bg-gray-50 border-none rounded-xl"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
              />
              <Button 
                onClick={() => addItem('units', newUnit, setNewUnit)}
                className="rounded-xl px-6 bg-gray-900 text-white font-bold h-11"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {localSettings.units.map((unit) => (
                <div key={unit} className="group relative px-4 py-2 bg-gray-50 border border-transparent hover:border-green-100 hover:bg-green-50 rounded-lg flex items-center gap-2 transition-all">
                  <span className="text-xs font-bold text-gray-700">{unit}</span>
                  <button 
                    onClick={() => removeItem('units', unit)}
                    className="text-red-400 w-0 overflow-hidden group-hover:w-4 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-2 text-gray-200">
        <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-30">Powertech Limited Order Management System v2.0.4</span>
      </div>
    </div>
  );
}
