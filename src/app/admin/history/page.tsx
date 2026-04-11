"use client";
import { Search, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Input } from "@/components/ui/FormElements";
export default function HistoryPage() {
  return (
    <div className="space-y-6">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <h3 className="text-xl font-semibold text-gray-900 uppercase">
          ประวัติการสั่งซื้อย้อนหลัง
        </h3>{" "}
        <div className="flex items-center gap-3">
          {" "}
          <div className="relative">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />{" "}
            <Input
              placeholder="ค้นหาประวัติ..."
              className="pl-10 !py-2 bg-white border-gray-200 rounded-xl w-48 text-xs"
            />{" "}
          </div>{" "}
          <Button
            variant="secondary"
            className="rounded-xl px-5 text-xs bg-white border-gray-200"
          >
            Export PDF
          </Button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="py-32 text-center opacity-30">
        {" "}
        <Settings className="w-16 h-16 mx-auto mb-6 animate-spin" />{" "}
        <h2 className="text-2xl font-semibold uppercase">
          Building Audit Trail
        </h2>{" "}
        <p className="text-sm mt-2">
          ระบบประวัติย้อนหลังกำลังอยู่ในการจัดเตรียมข้อมูล...
        </p>{" "}
      </div>{" "}
    </div>
  );
}
