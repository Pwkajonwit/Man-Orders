"use client";

import { BarChart3, Boxes, MoreHorizontal, Package, Plus } from "lucide-react";
import {
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSearch,
  AdminStatCard,
  AdminStatGrid,
  AdminStatusChip,
} from "@/components/admin/AdminUI";

const stockMap = {
  in_stock: { label: "พร้อมใช้", tone: "emerald" as const },
  low_stock: { label: "ใกล้หมด", tone: "amber" as const },
  out_of_stock: { label: "หมดสต็อก", tone: "red" as const },
};

const productList: Array<{
  id: string;
  name: string;
  cat: string;
  stock: keyof typeof stockMap;
  qty: number;
}> = [
    { id: "P-10024", name: "น็อตเกลียวเบอร์ 10 (S)", cat: "วัสดุสิ้นเปลือง", stock: "in_stock", qty: 2400 },
    { id: "P-10025", name: "สีน้ำเงินเทาภายนอก (5L)", cat: "สีและเคมีภัณฑ์", stock: "low_stock", qty: 12 },
    { id: "P-10026", name: "ท่อ PVC 4 นิ้ว (Class 8.5)", cat: "ประปา", stock: "in_stock", qty: 45 },
    { id: "P-10027", name: "สว่านกระแทกไร้สาย 18V", cat: "เครื่องมือช่าง", stock: "out_of_stock", qty: 0 },
  ];

export default function ProductsPage() {
  return (
    <AdminPage>
      <AdminHeader
        title="คลังสินค้า"
        subtitle="ดูรายการสินค้าและสถานะคงเหลือแบบสรุป"
        actions={
          <>
            <AdminSearch placeholder="ค้นหาสินค้า" />
            <AdminPrimaryButton>
              <Plus className="h-4 w-4" />
              เพิ่มสินค้า
            </AdminPrimaryButton>
          </>
        }
      />

      <AdminStatGrid>
        <AdminStatCard label="จำนวน SKU" value={0} detail="รายการสินค้าที่ลงทะเบียน" icon={Boxes} tone="slate" />
        <AdminStatCard label="คงเหลือรวม" value={0} detail="ยอดรวมทุกหน่วยนับ" icon={BarChart3} tone="blue" />
        <AdminStatCard label="หมดสต็อก" value={0} detail="ต้องสั่งซื้อเพิ่ม" icon={Package} tone="red" />
        <AdminStatCard label="ใกล้หมด" value={0} detail="ควรติดตามปริมาณ" icon={BarChart3} tone="amber" />
      </AdminStatGrid>

      <AdminPanel title="รายการสินค้า" subtitle="ส่วนนี้ยังอยู่ระหว่างเตรียมฐานข้อมูลและระบบสต็อก">
        <AdminEmptyState
          icon={Boxes}
          title="หน้าคลังสินค้ายังไม่พร้อมใช้งาน"
          description="โครงหน้าและ UI Dashboard ถูกเตรียมไว้เรียบร้อยแล้ว ทีมพัฒนาอยู่ระหว่างการเชื่อมต่อ API สินค้าจริงสำหรับจัดการสต็อก"
        />
      </AdminPanel>
    </AdminPage>
  );
}
