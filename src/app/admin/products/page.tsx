"use client";
import { Package, MoreVertical, Search, Plus } from "lucide-react";
import { Button, cn } from "@/components/ui/Button";
import { Card, Input } from "@/components/ui/FormElements";

const productList = [
  {
    id: "P-001",
    name: "น็อตเกลียวเบอร์ 10",
    cat: "วัสดุสิ้นเปลือง",
    stock: "In Stock",
  },
  {
    id: "P-002",
    name: "สีน้ำเงินเทาภายนอก",
    cat: "สีแอปเปิ้ล",
    stock: "Low Stock",
  },
  { id: "P-003", name: "ท่อ PVC 4 นิ้ว", cat: "ประปา", stock: "In Stock" },
  {
    id: "P-004",
    name: "สว่านกระแทกไร้สาย",
    cat: "เครื่องมือช่าง",
    stock: "Out of Stock",
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 uppercase leading-none tracking-tight">
            PRODUCT CATALOG
          </h3>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-1">
            รายการสินค้าและวัสดุทั้งหมดในระบบ
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="ค้นหาสินค้า..." className="pl-12 bg-white border-gray-100 rounded-xl h-11 text-xs w-64" />
          </div>
          <Button className="rounded-xl h-11 px-6 text-xs bg-gray-900 text-white font-bold uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD PRODUCT
          </Button>
        </div>
      </div>

      <Card className="bg-white border border-gray-100 p-0 overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border border-gray-100/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Product ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Description</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Inventory Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 border border-gray-100/50 transition-all font-medium"
                >
                  <td className="px-8 py-6 text-xs font-bold text-gray-400">
                    {item.id}
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-900 uppercase tracking-tight">
                    {item.name}
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {item.cat}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase border",
                        item.stock === "In Stock"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : item.stock === "Low Stock"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-red-50 text-red-600 border-red-100",
                      )}
                    >
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-gray-300 hover:text-gray-900 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
