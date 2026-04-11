"use client";

import { Clock, Download, FileText, History, Settings } from "lucide-react";
import {
  AdminEmptyState,
  AdminHeader,
  AdminPage,
  AdminPanel,
  AdminPrimaryButton,
  AdminSearch,
  AdminStatCard,
  AdminStatGrid,
} from "@/components/admin/AdminUI";

export default function HistoryPage() {
  return (
    <AdminPage>
      <AdminHeader
        title="ประวัติย้อนหลัง"
        subtitle="พื้นที่สำหรับตรวจสอบ log และข้อมูลย้อนหลังของระบบ"
        actions={
          <>
            <AdminSearch placeholder="ค้นหาประวัติ" />
            <AdminPrimaryButton icon={Download}>
              ส่งออกข้อมูล
            </AdminPrimaryButton>
          </>
        }
      />

      <AdminStatGrid>
        <AdminStatCard label="รายการบันทึก" value="0" detail="จำนวน log ทั้งหมด" icon={FileText} tone="slate" />
        <AdminStatCard label="ส่งออกแล้ว" value="0" detail="จำนวนครั้งที่ export" icon={Download} tone="blue" />
        <AdminStatCard label="เก็บข้อมูล" value="0 วัน" detail="รอบเวลา retention" icon={Clock} tone="emerald" />
        <AdminStatCard label="พื้นที่ใช้จริง" value="0 GB" detail="ขนาดข้อมูลย้อนหลัง" icon={History} tone="amber" />
      </AdminStatGrid>

      <AdminPanel title="ระบบประวัติย้อนหลัง" subtitle="ส่วนนี้ยังอยู่ระหว่างเตรียมข้อมูลและสิทธิ์การเข้าถึง">
        <AdminEmptyState
          icon={Settings}
          title="หน้าประวัติยังไม่พร้อมใช้งาน"
          description="โครงหน้าถูกปรับให้สอดคล้องกับธีม admin ใหม่แล้ว เมื่อเชื่อมข้อมูลจริงสามารถวางตารางหรือ filter เพิ่มใน section นี้ได้ทันที"
        />
      </AdminPanel>
    </AdminPage>
  );
}
