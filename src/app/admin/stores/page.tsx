"use client";
import React, { useRef, useState } from "react";
import { 
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatCard,
  AdminStatGrid,
} from "@/components/admin/AdminUI";
import {
  Store,
  MapPin,
  Phone,
  ShoppingCart,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
  Building2,
  Search,
  CheckCircle2,
  Download,
  Upload,
} from "lucide-react";
import { Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useStores } from "@/hooks/useStores";
import { useSettings } from "@/hooks/useSettings";
import { NetworkStore } from "@/types";

const CSV_HEADERS = ["ชื่อร้านค้า", "ประเภทธุรกิจ", "ที่ตั้ง", "ลิงก์แผนที่", "เบอร์โทรศัพท์", "จำนวนออร์เดอร์"];

const CSV_HEADER_MAP: Record<string, keyof Omit<NetworkStore, "id" | "createdAt" | "updatedAt">> = {
  "ชื่อร้านค้า": "name",
  name: "name",
  store: "name",
  "ประเภทธุรกิจ": "type",
  type: "type",
  category: "type",
  "ที่ตั้ง": "location",
  location: "location",
  address: "location",
  "ลิงก์แผนที่": "mapUrl",
  mapurl: "mapUrl",
  map: "mapUrl",
  "เบอร์โทรศัพท์": "phone",
  phone: "phone",
  tel: "phone",
  "จำนวนออร์เดอร์": "orders",
  orders: "orders",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function escapeCsvValue(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.some((value) => value.trim() !== ""));
}

function decodeCsvFile(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(buffer);
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer);
  }

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer);
  }

  return new TextDecoder("utf-8").decode(buffer);
}

export default function StoresPage() {
  const { stores, loading, addStore, updateStore, deleteStore } = useStores();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState<Omit<NetworkStore, "id">>({
    name: "",
    type: "",
    location: "",
    mapUrl: "",
    phone: "",
    orders: 0,
  });

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      type: settings.categories[0] || "",
      location: "",
      mapUrl: "",
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
      mapUrl: store.mapUrl || "",
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
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleExportCsv = () => {
    const rows = [
      CSV_HEADERS,
      ...stores.map((shop) => [
        shop.name || "",
        shop.type || "",
        shop.location || "",
        shop.mapUrl || "",
        shop.phone || "",
        String(shop.orders || 0),
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\r\n");

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stores-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = decodeCsvFile(await file.arrayBuffer()).replace(/^\uFEFF/, "");
      const rows = parseCsv(text);

      if (rows.length < 2) {
        alert("ไม่พบข้อมูลในไฟล์ CSV");
        return;
      }

      const headerRow = rows[0].map((header) => normalizeHeader(header));
      const fieldIndexes = headerRow.reduce<Record<string, number>>((acc, header, index) => {
        const field = CSV_HEADER_MAP[header];
        if (field) {
          acc[field] = index;
        }
        return acc;
      }, {});

      if (fieldIndexes.name === undefined) {
        alert("ไฟล์ CSV ต้องมีคอลัมน์ชื่อร้านค้า หรือ name");
        return;
      }

      const existingKeys = new Set(
        stores.map((shop) => `${shop.name.trim().toLowerCase()}|${(shop.location || "").trim().toLowerCase()}`),
      );

      let importedCount = 0;
      let skippedCount = 0;
      const pendingCreates: Array<Promise<unknown>> = [];

      for (const row of rows.slice(1)) {
        const name = row[fieldIndexes.name]?.trim() || "";
        if (!name) {
          skippedCount += 1;
          continue;
        }

        const location = fieldIndexes.location !== undefined ? row[fieldIndexes.location]?.trim() || "" : "";
        const uniqueKey = `${name.toLowerCase()}|${location.toLowerCase()}`;
        if (existingKeys.has(uniqueKey)) {
          skippedCount += 1;
          continue;
        }

        const ordersValue = fieldIndexes.orders !== undefined ? row[fieldIndexes.orders]?.trim() || "0" : "0";
        const parsedOrders = Number.parseInt(ordersValue, 10);

        const storeData: Omit<NetworkStore, "id"> = {
          name,
          type: fieldIndexes.type !== undefined ? row[fieldIndexes.type]?.trim() || settings.categories[0] || "" : settings.categories[0] || "",
          location,
          mapUrl: fieldIndexes.mapUrl !== undefined ? row[fieldIndexes.mapUrl]?.trim() || "" : "",
          phone: fieldIndexes.phone !== undefined ? row[fieldIndexes.phone]?.trim() || "" : "",
          orders: Number.isNaN(parsedOrders) ? 0 : parsedOrders,
        };

        existingKeys.add(uniqueKey);
        pendingCreates.push(addStore(storeData));
        importedCount += 1;
      }

      if (pendingCreates.length > 0) {
        await Promise.all(pendingCreates);
      }

      alert(`นำเข้าข้อมูลแล้ว ${importedCount} รายการ${skippedCount > 0 ? `, ข้าม ${skippedCount} รายการ` : ""}`);
    } catch (error) {
      console.error("CSV import error:", error);
      alert("นำเข้า CSV ไม่สำเร็จ");
    } finally {
      event.target.value = "";
      setImporting(false);
    }
  };

  return (
    <>
      <AdminPage>
        <AdminHeader
          title="รายชื่อร้านค้าพาร์ทเนอร์"
          subtitle="จัดการข้อมูลและช่องทางการสั่งซื้อของร้านค้าคู่ค้าทั้งหมด"
          actions={
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                <Input
                  placeholder="ค้นหาร้านค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 w-64 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 transition-all focus:border-slate-400"
                />
              </div>
              <AdminSecondaryButton type="button" onClick={handleExportCsv} icon={Download}>
                ส่งออก CSV
              </AdminSecondaryButton>
              <AdminSecondaryButton type="button" onClick={handleImportButtonClick} icon={Upload} disabled={importing}>
                {importing ? "กำลังนำเข้า..." : "นำเข้า CSV"}
              </AdminSecondaryButton>
              <AdminPrimaryButton onClick={handleOpenAdd} icon={Store}>
                เพิ่มร้านค้าใหม่
              </AdminPrimaryButton>
            </div>
          }
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImportCsv}
        />

        <AdminStatGrid>
          <AdminStatCard
            label="จำนวนร้านค้า"
            value={stores.length}
            detail="พาร์ทเนอร์ทั้งหมดในระบบ"
            icon={Building2}
            tone="slate"
          />
          <AdminStatCard
            label="หมวดหมู่ร้าน"
            value={settings.categories.length}
            detail="ประเภทธุรกิจที่ลงทะเบียน"
            icon={Store}
            tone="blue"
          />
          <AdminStatCard
            label="ออร์เดอร์สะสม"
            value={stores.reduce((a, b) => a + (b.orders || 0), 0)}
            detail="ยอดสั่งซื้อรวมทุกร้าน"
            icon={ShoppingCart}
            tone="emerald"
          />
          <AdminStatCard
            label="ร้านค้า Active"
            value={stores.filter(s => (s.orders || 0) > 0).length}
            detail="มีการสั่งซื้ออย่างน้อย 1 ครั้ง"
            icon={ExternalLink}
            tone="amber"
          />
        </AdminStatGrid>

        <AdminPanel title="ทำเนียบร้านค้า" subtitle="รายชื่อพาร์ทเนอร์ที่พร้อมให้บริการจัดซื้อ">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ข้อมูลร้านค้า</th>
                  <th>ประเภทธุรกิจ</th>
                  <th>พิกัดที่ตั้ง</th>
                  <th>การติดต่อ</th>
                  <th className="text-center">ยอดซื้อ</th>
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
                ) : filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <AdminEmptyState
                        icon={Building2}
                        title={searchQuery ? "ไม่พบร้านค้าที่ค้นหา" : "ยังไม่มีรายการร้านค้า"}
                        description={searchQuery ? "ลองระบุชื่อร้านค้าหรือสถานที่ใหม่อีกครั้ง" : "เริ่มต้นโดยการเพิ่มพาร์ทเนอร์ร้านค้าใหม่เข้าสู่ระบบ"}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((shop) => (
                    <tr key={shop.id} className="hover:bg-slate-50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                            <Store className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-slate-900 leading-tight">{shop.name}</div>
                            <div className="mt-1 text-xs text-slate-500">ID: {shop.id.slice(-6).toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
                          {shop.type}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-300" />
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm truncate max-w-[120px]">{shop.location || "—"}</span>
                            {shop.mapUrl && (
                              <AdminSecondaryButton
                                onClick={() => window.open(shop.mapUrl, "_blank")}
                                icon={ExternalLink}
                                className="h-7 w-7 p-0"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-300" />
                          <span className="text-sm">{shop.phone || "—"}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="text-sm text-slate-900">{shop.orders || 0}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <AdminSecondaryButton onClick={() => handleOpenEdit(shop)} icon={Edit2} className="h-8 w-8 p-0" />
                          <AdminSecondaryButton
                            onClick={() => handleDelete(shop.id)}
                            icon={Trash2}
                            className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      </AdminPage>

      {/* Register/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing ? "แก้ไขข้อมูลร้านค้า" : "ลงทะเบียนพาร์ทเนอร์ใหม่"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">ชื่อร้านค้า</Label>
              <Input 
                required 
                placeholder="ระบุชื่อที่จะใช้แสดงผลในระบบ" 
                className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">ประเภทธุรกิจ</Label>
                <Select 
                  className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900"
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="">เลือกประเภท...</option>
                  {settings.categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-700">เบอร์โทรศัพท์ติดต่อ</Label>
                <Input 
                  placeholder="เช่น 086-XXX-XXXX" 
                  className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900"
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">ที่ตั้งร้านค้า / พื้นที่ให้บริการ</Label>
              <Input 
                placeholder="เช่น กทม., สมุทรปราการ..." 
                className="h-11 rounded-xl border border-slate-200 text-sm text-slate-900"
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">พิกัดแผนที่ (GOOGLE MAPS URL)</Label>
              <div className="relative group">
                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-700" />
                <Input 
                  placeholder="https://maps.google.com/..." 
                  className="pl-11 h-11 rounded-xl border border-slate-200 text-sm text-slate-900"
                  value={formData.mapUrl} 
                  onChange={(e) => setFormData({...formData, mapUrl: e.target.value})} 
                />
              </div>
            </div>
          </div>

           <div className="flex gap-3 pt-6 border-t border-slate-100 mt-4">
             <AdminSecondaryButton 
               type="button"
               className="flex-1" 
               onClick={() => setIsModalOpen(false)}
             >
               ยกเลิก
             </AdminSecondaryButton>
             <AdminPrimaryButton 
               submitting={submitting} 
               icon={CheckCircle2}
               className="flex-[2]"
             >
               {isEditing ? "อัปเดตข้อมูล" : "ลงทะเบียนร้านค้า"}
             </AdminPrimaryButton>
           </div>
        </form>
      </Modal>
    </>
  );
}
