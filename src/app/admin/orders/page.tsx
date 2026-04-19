"use client";

import React, { useEffect, useState } from "react";
import {
  AdminEmptyState,
  AdminPage,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminStatusChip,
} from "@/components/admin/AdminUI";
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  History,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  User,
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/FormElements";
import { Modal } from "@/components/ui/Modal";
import { useOrders } from "@/hooks/useOrders";
import { useSettings } from "@/hooks/useSettings";
import { useStaff } from "@/hooks/useStaff";
import { useStores } from "@/hooks/useStores";
import { Item, Order } from "@/types";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const STATUS_MAP = {
  pending: { label: "รอยืนยัน", tone: "amber" as const },
  buying: { label: "กำลังจัดซื้อ", tone: "blue" as const },
  sorting: { label: "กำลังตรวจสอบ", tone: "purple" as const },
  completed: { label: "เสร็จสิ้นแล้ว", tone: "emerald" as const },
  cancelled: { label: "ยกเลิก", tone: "red" as const },
};

const ITEM_STATUS_MAP = {
  to_buy: { label: "รอซื้อ", tone: "slate" as const },
  bought: { label: "ซื้อแล้ว", tone: "emerald" as const },
  cancelled: { label: "ยกเลิก", tone: "red" as const },
  out_of_stock: { label: "หมด", tone: "amber" as const },
};

const META_LABEL_CLASS = "text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400";
const PROGRESS_TONE_CLASS = {
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  purple: "bg-violet-500",
  emerald: "bg-emerald-500",
  red: "bg-red-500",
  slate: "bg-slate-700",
} as const;
const ORDER_FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "กำลังทำงาน" },
  { key: "completed", label: "เสร็จสิ้น" },
  { key: "cancelled", label: "ยกเลิก" },
] as const;

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return "—";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd MMM yy, HH:mm", { locale: th });
  } catch {
    return "—";
  }
};

const formatDateOnly = (timestamp: any) => {
  if (!timestamp) return "—";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "dd MMM yy", { locale: th });
  } catch {
    return "—";
  }
};

const formatTimeOnly = (timestamp: any) => {
  if (!timestamp) return "—";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "HH:mm", { locale: th });
  } catch {
    return "—";
  }
};

const formatFullDate = (timestamp: any) => {
  if (!timestamp) return "—";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "EEEE, dd MMM yyyy", { locale: th });
  } catch {
    return "—";
  }
};

const getOrderMetrics = (order: Order) => {
  const boughtCount = order.items.filter((item) => item.status === "bought").length;
  const cancelledCount = order.items.filter((item) => item.status === "cancelled" || item.status === "out_of_stock").length;
  const pendingCount = order.items.filter((item) => item.status === "to_buy").length;
  const previewItems = order.items.slice(0, 3);
  const remainingItems = Math.max(order.items.length - previewItems.length, 0);
  const resolvedCount = boughtCount + cancelledCount;
  const completionPercent = order.items.length > 0 ? Math.round((resolvedCount / order.items.length) * 100) : 0;

  return {
    boughtCount,
    cancelledCount,
    pendingCount,
    previewItems,
    remainingItems,
    resolvedCount,
    completionPercent,
  };
};

const buildOrderSearchText = (order: Order) =>
  [
    order.id,
    order.requesterName,
    order.requesterUsername,
    order.storeName,
    order.storeLocation,
    order.location,
    order.buyerName,
    order.note,
    ...order.items.map((item) => `${item.name} ${item.qty} ${item.unit}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getOrderReference = (order: Order) => `#${order.id.slice(-6).toUpperCase()}`;

const getRequesterInitials = (name?: string) => {
  const initials = (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "--";
};

export default function OrdersPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const { orders, loading, createOrder, updateOrder, deleteOrder } = useOrders();
  const { staff } = useStaff();
  const { stores } = useStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequesterDropdownOpen, setIsRequesterDropdownOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof ORDER_FILTERS)[number]["key"]>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Partial<Order>>({
    requesterId: "",
    requesterName: "",
    storeName: "",
    items: [],
    status: "pending",
    note: "",
  });
  const [managingOrder, setManagingOrder] = useState<Order | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [managedItems, setManagedItems] = useState<Item[]>([]);
  const [manageNote, setManageNote] = useState("");
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [newItem, setNewItem] = useState<Partial<Item>>({ name: "", qty: 1, unit: "ชิ้น" });

  useEffect(() => {
    if (!settingsLoading && settings.units.length > 0) {
      setNewItem((prev) => ({ ...prev, unit: prev.unit || settings.units[0] }));
    }
  }, [settingsLoading, settings.units]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ requesterId: "", requesterName: "", storeName: "", items: [], status: "pending", note: "" });
    setIsRequesterDropdownOpen(false);
    setIsStoreDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: Order) => {
    setIsEditing(true);
    setFormData(order);
    setIsRequesterDropdownOpen(false);
    setIsStoreDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenManage = (order: Order) => {
    setManagingOrder(order);
    setManagedItems([...order.items]);
    setManageNote(order.note || "");
    setSelectedBuyerId("");
    setIsManageModalOpen(true);
  };

  const handleOpenDetail = (order: Order) => {
    setDetailOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setDetailOrder(null);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.qty) return;
    const item: Item = {
      id: `item_${Date.now()}`,
      name: newItem.name as string,
      qty: Number(newItem.qty),
      unit: newItem.unit || settings.units[0] || "ชิ้น",
      status: "to_buy",
    };
    setFormData({ ...formData, items: [...(formData.items || []), item] });
    setNewItem({ name: "", qty: 1, unit: settings.units[0] || "ชิ้น" });
  };

  const handleRemoveItem = (id: string) => {
    setFormData({ ...formData, items: (formData.items || []).filter((item) => item.id !== id) });
  };

  const updateManagedItemStatus = (itemId: string, status: Item["status"]) => {
    setManagedItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedItem: Item = { ...item, status };
        if (status === "bought") {
          updatedItem.boughtAt = new Date();
        } else if (updatedItem.boughtAt) {
          delete updatedItem.boughtAt;
        }
        return updatedItem;
      }),
    );
  };

  const saveManagedItems = async () => {
    if (!managingOrder) return;
    const selectedBuyer = buyerOptions.find((member) => member.id === selectedBuyerId) ?? null;
    if (!selectedBuyer) {
      alert("กรุณาเลือกผู้จัดซื้อก่อนอัปเดตสถานะ");
      return;
    }
    setSubmitting(true);
    try {
      const allDone = managedItems.length > 0 && managedItems.every((item) => item.status !== "to_buy");
      const newStatus = allDone ? "completed" : "buying";
      await updateOrder(managingOrder.id, {
        buyerId: selectedBuyer.id,
        buyerName: selectedBuyer.name,
        items: managedItems,
        note: manageNote,
        status: newStatus as Order["status"],
      });
      setIsManageModalOpen(false);
    } catch {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requesterId || (formData.items || []).length === 0) {
      alert("กรุณาระบุผู้สั่งซื้อและเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && formData.id) await updateOrder(formData.id, formData);
      else await createOrder(formData);
      setIsModalOpen(false);
    } catch {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: string, requesterName: string) => {
    if (!confirm(`คุณต้องการลบออร์เดอร์ของ ${requesterName} ใช่หรือไม่?`)) return;
    try {
      await deleteOrder(id);
    } catch {
      alert("เกิดข้อผิดพลาดในการลบออร์เดอร์");
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filterCounts = {
    all: orders.length,
    active: orders.filter((order) => order.status === "pending" || order.status === "buying" || order.status === "sorting").length,
    completed: orders.filter((order) => order.status === "completed").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  };
  const statusFilteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return order.status === "pending" || order.status === "buying" || order.status === "sorting";
    return order.status === statusFilter;
  });
  const filteredOrders = normalizedSearch
    ? statusFilteredOrders.filter((order) => buildOrderSearchText(order).includes(normalizedSearch))
    : statusFilteredOrders;
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  const detailStatus = detailOrder ? STATUS_MAP[detailOrder.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending : null;
  const detailMetrics = detailOrder ? getOrderMetrics(detailOrder) : null;
  const normalizedRequesterQuery = (formData.requesterName || "").trim().toLowerCase();
  const filteredRequesterOptions = (normalizedRequesterQuery
    ? staff.filter((member) =>
        [member.name, member.username, member.phone]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedRequesterQuery),
      )
    : []
  ).slice(0, 6);
  const matchedRequester =
    staff.find((member) => {
      const normalizedName = member.name.trim().toLowerCase();
      const normalizedUsername = member.username?.trim().toLowerCase();

      return normalizedName === normalizedRequesterQuery || normalizedUsername === normalizedRequesterQuery;
    }) ?? null;
  const normalizedStoreQuery = (formData.storeName || "").trim().toLowerCase();
  const filteredStoreOptions = (normalizedStoreQuery
    ? stores.filter((store) =>
        [store.name, store.location, store.phone, store.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedStoreQuery),
      )
    : []
  ).slice(0, 6);
  const matchedStore = stores.find((store) => store.name.trim().toLowerCase() === normalizedStoreQuery) ?? null;

  const applySelectedStore = (storeName: string) => {
    const selectedStore = stores.find((store) => store.name.trim().toLowerCase() === storeName.trim().toLowerCase()) ?? null;

    setFormData((prev) => ({
      ...prev,
      storeName,
      storeLocation: selectedStore?.location || "",
      mapUrl: selectedStore?.mapUrl || "",
      contact: selectedStore?.phone || "",
    }));
  };

  const applySelectedRequester = (requesterValue: string) => {
    const normalizedValue = requesterValue.trim().toLowerCase();
    const selectedStaff =
      staff.find((member) => {
        const normalizedName = member.name.trim().toLowerCase();
        const normalizedUsername = member.username?.trim().toLowerCase();

        return normalizedName === normalizedValue || normalizedUsername === normalizedValue;
      }) ?? null;

    setFormData((prev) => ({
      ...prev,
      requesterId: selectedStaff?.id || "",
      requesterName: selectedStaff?.name || requesterValue,
      requesterUsername: selectedStaff?.username || "",
    }));
  };

  const getRequesterProfile = (orderLike: Partial<Order>) =>
    staff.find((member) => {
      const normalizedMemberName = member.name.trim().toLowerCase();
      const normalizedMemberUsername = member.username?.trim().toLowerCase();
      const normalizedRequesterName = orderLike.requesterName?.trim().toLowerCase();
      const normalizedRequesterUsername = orderLike.requesterUsername?.trim().toLowerCase();

      return (
        (orderLike.requesterId && member.id === orderLike.requesterId) ||
        (normalizedRequesterUsername && normalizedMemberUsername === normalizedRequesterUsername) ||
        (normalizedRequesterName && normalizedMemberName === normalizedRequesterName)
      );
    }) ?? null;
  const detailRequesterProfile = detailOrder ? getRequesterProfile(detailOrder) : null;
  const isAssignableBuyer = (role?: string) => {
    const normalizedRole = role?.toLowerCase().trim() || "";

    return (
      normalizedRole === "admin" ||
      normalizedRole === "administrator" ||
      normalizedRole === "แอดมิน" ||
      normalizedRole === "buyer" ||
      normalizedRole === "staff" ||
      normalizedRole === "พนักงานจัดซื้อ" ||
      normalizedRole === "จัดซื้อ" ||
      normalizedRole === "order"
    );
  };
  const buyerOptions = staff.filter((member) => isAssignableBuyer(member.role));

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (settingsLoading) {
    return (
      <div className="flex animate-pulse flex-col items-center justify-center py-40 text-slate-300">
        <Loader2 className="mb-4 h-12 w-12 animate-spin" />
        <span className="text-sm">กำลังดึงข้อมูลมาให้สักครู่...</span>
      </div>
    );
  }

  return (
    <>
      <AdminPage className="gap-4">
        <section className="relative overflow-hidden rounded-[18px] border border-amber-100/70 bg-[radial-gradient(circle_at_top_left,rgba(255,227,160,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(153,246,228,0.08),transparent_20%),linear-gradient(135deg,#fffdf6_0%,#fff9ec_48%,#f7fcfa_100%)] px-3 py-3 shadow-[0_12px_28px_-26px_rgba(120,113,108,0.22)] lg:px-4">
          <div className="relative z-10 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/85 px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] text-amber-700">
                <ShoppingCart className="h-3.5 w-3.5" />
                Orders Dashboard
              </div>
              <div className="space-y-0.5">
                <h1 className="text-[1.45rem] font-semibold tracking-[-0.045em] text-slate-950">จัดการออร์เดอร์</h1>
                <p className="truncate text-[12px] text-slate-500">ภาพรวมคำสั่งซื้อและสถานะล่าสุด</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
              <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">รายการรวม</div>
                    <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{orders.length}</div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-600">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">กำลังทำงาน</div>
                    <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{filterCounts.active}</div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-cyan-200 bg-cyan-50 text-cyan-700">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">เสร็จสิ้น</div>
                    <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">{filterCounts.completed}</div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <History className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[132px] rounded-[10px] border border-white/85 bg-white/88 px-3 py-2 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.24)]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">รอยืนยัน</div>
                    <div className="mt-1 text-[1.2rem] font-semibold leading-none tracking-[-0.04em] text-slate-950">
                      {orders.filter((order) => order.status === "pending").length}
                    </div>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-amber-200 bg-amber-50 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="min-w-[150px] rounded-[10px] border border-white/90 bg-white/80 px-3 py-1.5 text-right shadow-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">วันนี้</div>
                <div className="mt-0.5 text-[12px] font-medium text-slate-700">{formatFullDate(new Date())}</div>
              </div>

              <AdminPrimaryButton
                onClick={handleOpenAdd}
                icon={Plus}
                className="h-8 rounded-[8px] border-amber-300 bg-amber-300 px-3 text-[12px] font-semibold text-slate-950 shadow-[0_8px_16px_-14px_rgba(217,119,6,0.72)] hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
              >
                สร้างบิลใหม่
              </AdminPrimaryButton>
            </div>
          </div>
        </section>

        <section className="overflow-visible bg-transparent shadow-none">
          <div className="px-0 py-0">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Orders</div>
                <h2 className="text-[1.3rem] font-semibold tracking-[-0.04em] text-slate-950">รายการออร์เดอร์</h2>
                <p className="max-w-2xl text-[13px] leading-5 text-slate-600">
                  เปลี่ยนจากตารางแน่น ๆ เป็นมุมมอง card board เพื่อเห็นผู้ขอ ร้านค้า สินค้าหลัก และสถานะรวมในหนึ่งสายตา
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 xl:w-auto xl:min-w-[21rem]">
                <div className="flex flex-wrap items-center gap-1.5 rounded-[10px] border border-slate-200 bg-slate-50 p-1.5">
                  {ORDER_FILTERS.map((filter) => {
                    const isActive = statusFilter === filter.key;

                    return (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setStatusFilter(filter.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium transition-all",
                          isActive
                            ? "bg-teal-700 text-white shadow-[0_10px_18px_-16px_rgba(15,118,110,0.75)]"
                            : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        )}
                      >
                        <span>{filter.label}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs", isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500")}>
                          {filterCounts[filter.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="group relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาจากเลขบิล ผู้ขอ ร้านค้า ผู้จัดซื้อ หรือสินค้า"
                      className="h-8.5 rounded-[10px] border-slate-200 bg-white pl-10 text-[13px] shadow-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-white px-3 py-1.5 text-[13px] text-slate-600 sm:min-w-[8rem]">
                    <span>แสดง</span>
                    <span className="text-sm font-semibold text-slate-950">{filteredOrders.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-20">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">กำลังโหลดรายการออร์เดอร์</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <AdminEmptyState icon={ShoppingBag} title="ยังไม่มีรายการสั่งซื้อ" description="เมื่อมีการสร้างบิลใหม่ รายการจะปรากฏในส่วนนี้โดยอัตโนมัติ" />
          ) : filteredOrders.length === 0 ? (
            <AdminEmptyState icon={Search} title="ไม่พบรายการที่ตรงกับคำค้นหา" description="ลองเปลี่ยนคำค้นหา หรือสลับตัวกรองสถานะด้านบน" />
          ) : (
            <>
              <div className="grid gap-3 px-0 py-3 md:grid-cols-2 xl:grid-cols-3 lg:py-3.5">
                {paginatedOrders.map((order) => {
                  const status = STATUS_MAP[order.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;
                  const { pendingCount, previewItems, remainingItems } = getOrderMetrics(order);
                  const requesterProfile = getRequesterProfile(order);

                  return (
                    <article
                      key={order.id}
                      className="group flex h-full flex-col rounded-[12px] border border-slate-200 bg-white p-3 shadow-[0_8px_20px_-22px_rgba(15,23,42,0.16)] transition-all duration-200 hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-teal-700 text-[13px] font-semibold text-white">
                            {requesterProfile?.linePictureUrl ? (
                              <img
                                src={requesterProfile.linePictureUrl}
                                alt={order.requesterName || "ผู้สั่งซื้อ"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getRequesterInitials(order.requesterName)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[15px] font-semibold text-slate-950">{order.requesterName}</div>
                            <div className="mt-1 text-xs font-medium text-slate-500">{getOrderReference(order)} / {order.storeName || "ทั่วไป"}</div>
                            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-800">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{order.buyerName || "ยังไม่มอบหมายผู้จัดซื้อ"}</span>
                            </div>
                          </div>
                        </div>
                        <AdminStatusChip label={status.label} tone={status.tone} className="rounded-full px-3 py-1 text-[11px] font-medium" />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[13px] text-slate-500">
                        <span>{formatDateOnly(order.createdAt)}</span>
                        <span>{formatTimeOnly(order.createdAt)} น.</span>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50/75 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">ร้านค้า</div>
                          <div className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-slate-950">{order.storeName || "ทั่วไป"}</div>
                          <div className="mt-1 text-[13px] leading-5 text-slate-500">{order.storeLocation || "ไม่ระบุที่ตั้งร้าน"}</div>
                        </div>
                        <div className="rounded-[10px] border border-slate-200 bg-slate-50/75 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">จุดส่ง</div>
                          <div className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-slate-950">{order.location || "ไม่ระบุ"}</div>
                          <div className="mt-1 text-[13px] leading-5 text-slate-500">{order.contact || "ไม่มีข้อมูลติดต่อ"}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex-1">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">รายการสินค้า</div>
                            <div className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-slate-950">{order.items.length} รายการ</div>
                          </div>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            คงเหลือ {pendingCount}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {previewItems.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-3 rounded-[10px] bg-slate-50 px-3 py-2">
                              <div className="min-w-0">
                                <div className="truncate text-[13px] font-medium text-slate-800">{item.name}</div>
                                <div className="mt-1 text-xs text-slate-400">{item.qty} {item.unit}</div>
                              </div>
                              <AdminStatusChip
                                label={(ITEM_STATUS_MAP[item.status as keyof typeof ITEM_STATUS_MAP] ?? ITEM_STATUS_MAP.to_buy).label}
                                tone={(ITEM_STATUS_MAP[item.status as keyof typeof ITEM_STATUS_MAP] ?? ITEM_STATUS_MAP.to_buy).tone}
                                className="shrink-0 rounded-full px-2.5 py-1 text-[10px]"
                              />
                            </div>
                          ))}
                          {remainingItems > 0 ? <div className="text-xs font-medium text-slate-400">+ เพิ่มเติมอีก {remainingItems} รายการ</div> : null}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200 pt-2.5">
                        <AdminSecondaryButton
                          onClick={() => handleOpenDetail(order)}
                          icon={Eye}
                          title="ดูรายละเอียด"
                          aria-label="ดูรายละเอียด"
                          className="h-8 w-8 rounded-[8px] justify-center border-slate-200 bg-slate-50 p-0 text-slate-700 hover:bg-slate-100"
                        >
                        </AdminSecondaryButton>
                        <AdminSecondaryButton
                          onClick={() => handleOpenManage(order)}
                          icon={Edit3}
                          title="จัดการ"
                          aria-label="จัดการ"
                          className="h-8 w-8 rounded-[8px] justify-center border-teal-700 bg-teal-700 p-0 text-white hover:bg-teal-800 hover:text-white"
                        >
                        </AdminSecondaryButton>
                        <AdminSecondaryButton
                          onClick={() => handleOpenEdit(order)}
                          icon={ChevronRight}
                          title="แก้ไข"
                          aria-label="แก้ไข"
                          className="h-8 w-8 rounded-[8px] justify-center p-0 text-slate-700"
                        >
                        </AdminSecondaryButton>
                        <AdminSecondaryButton
                          onClick={() => handleDeleteOrder(order.id, order.requesterName || "")}
                          icon={Trash2}
                          title="ลบ"
                          aria-label="ลบ"
                          className="h-8 w-8 rounded-[8px] justify-center border-red-200 bg-red-50 p-0 text-red-600 hover:bg-red-100"
                        >
                        </AdminSecondaryButton>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredOrders.length > pageSize ? (
                <div className="flex flex-col gap-3 px-0 pb-1 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    แสดง {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredOrders.length)} จาก {filteredOrders.length} รายการ
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminSecondaryButton
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      icon={ChevronLeft}
                      className="h-9 rounded-[10px] px-3 text-xs disabled:opacity-50"
                    >
                      ก่อนหน้า
                    </AdminSecondaryButton>
                    <div className="flex items-center gap-1">
                      {visiblePages.map((page, index) => {
                        const previousPage = visiblePages[index - 1];
                        const showGap = previousPage && page - previousPage > 1;

                        return (
                          <React.Fragment key={page}>
                            {showGap ? <span className="px-1 text-sm text-slate-400">...</span> : null}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "flex h-9 min-w-[2.25rem] items-center justify-center rounded-[10px] px-3 text-sm font-medium transition-colors",
                                page === currentPage
                                  ? "bg-teal-700 text-white"
                                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100",
                              )}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <AdminSecondaryButton
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      icon={ChevronRight}
                      className="h-9 rounded-[10px] px-3 text-xs disabled:opacity-50"
                    >
                      ถัดไป
                    </AdminSecondaryButton>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </AdminPage>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "แก้ไขบิลสั่งซื้อ" : "สร้างบิลสั่งซื้อใหม่"}
        className="max-w-2xl rounded-[14px] border-slate-200/90 p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.28)]"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <Label className="text-sm text-slate-700">พนักงานผู้สั่งซื้อ</Label>
              <div className="relative">
                <Input
                  required
                  placeholder="ค้นหาชื่อพนักงาน, username หรือเบอร์โทร..."
                  className="h-9 rounded-[10px] border border-slate-300 text-sm text-slate-900"
                  value={formData.requesterName || ""}
                  onFocus={() => setIsRequesterDropdownOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsRequesterDropdownOpen(false), 120)}
                  onChange={(e) => {
                    applySelectedRequester(e.target.value);
                    setIsRequesterDropdownOpen(true);
                  }}
                />
                {isRequesterDropdownOpen && normalizedRequesterQuery && filteredRequesterOptions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.25)]">
                    <div className="max-h-56 overflow-y-auto p-1.5">
                      {filteredRequesterOptions.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            applySelectedRequester(member.name);
                            setIsRequesterDropdownOpen(false);
                          }}
                          className="flex w-full items-start justify-between gap-3 rounded-[8px] px-3 py-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-700 text-xs font-semibold text-white">
                              {member.linePictureUrl ? (
                                <img
                                  src={member.linePictureUrl}
                                  alt={member.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getRequesterInitials(member.name)
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-slate-900">{member.name}</div>
                              <div className="mt-0.5 truncate text-xs text-slate-500">
                                {member.username ? `@${member.username}` : "ไม่มี username"}
                                {member.phone ? ` • ${member.phone}` : ""}
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            {member.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {matchedRequester ? (
                <div className="text-xs text-slate-500">
                  พบพนักงานในระบบ: {matchedRequester.username ? `@${matchedRequester.username}` : "ไม่มี username"}
                  {matchedRequester.phone ? ` • ${matchedRequester.phone}` : ""}
                </div>
              ) : null}
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-slate-700">ชื่อร้านค้าคู่ค้า</Label>
              <div className="relative">
                <Input
                  placeholder="ค้นหาหรือระบุชื่อร้านค้า..."
                  className="h-9 rounded-[10px] border border-slate-300 text-sm text-slate-900"
                  value={formData.storeName || ""}
                  onFocus={() => setIsStoreDropdownOpen(true)}
                  onBlur={() => window.setTimeout(() => setIsStoreDropdownOpen(false), 120)}
                  onChange={(e) => {
                    applySelectedStore(e.target.value);
                    setIsStoreDropdownOpen(true);
                  }}
                />
                {isStoreDropdownOpen && normalizedStoreQuery && filteredStoreOptions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.25)]">
                    <div className="max-h-56 overflow-y-auto p-1.5">
                      {filteredStoreOptions.map((store) => (
                        <button
                          key={store.id}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            applySelectedStore(store.name);
                            setIsStoreDropdownOpen(false);
                          }}
                          className="flex w-full items-start justify-between gap-3 rounded-[8px] px-3 py-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-slate-900">{store.name}</div>
                            <div className="mt-0.5 truncate text-xs text-slate-500">{store.location || "ไม่ระบุที่ตั้งร้าน"}</div>
                          </div>
                          {store.type ? (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              {store.type}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              {matchedStore ? (
                <div className="text-xs text-slate-500">
                  พบร้านในระบบ: {matchedStore.location || "ไม่ระบุที่ตั้งร้าน"}
                  {matchedStore.phone ? ` • ${matchedStore.phone}` : ""}
                </div>
              ) : null}
            </div>
            <div className="mt-3.5 space-y-3 border-t border-slate-200 pt-3.5">
              <div className="flex items-center justify-between px-0.5">
                <Label className="text-sm text-slate-900">รายการสินค้า</Label>
                <span className="text-sm text-slate-600">{(formData.items || []).length} รายการ</span>
              </div>
              <div className="flex gap-1.5">
                <Input
                  placeholder="ชื่อสินค้า..."
                  className="h-9 flex-[2] rounded-[10px] border border-slate-300 bg-white text-sm text-slate-900"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  className="h-9 flex-[0.55] rounded-[10px] border border-slate-300 bg-white text-center text-sm text-slate-900"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                />
                <Select
                  className="h-9 flex-1 rounded-[10px] border border-slate-300 bg-white text-sm text-slate-900"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                >
                  {settings.units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Select>
                <AdminPrimaryButton type="button" onClick={handleAddItem} icon={Plus} className="h-9 w-9 shrink-0 rounded-[10px] p-0" />
              </div>
              <div className="custom-scrollbar flex max-h-[220px] flex-col space-y-1.5 overflow-y-auto pr-1 pt-1">
                {(formData.items || []).length === 0 ? (
                  <div className="rounded-[10px] border border-dashed border-slate-300 py-5 text-center text-sm text-slate-500">เพิ่มสินค้าอย่างน้อย 1 รายการ</div>
                ) : null}
                {(formData.items || []).map((item: Item) => (
                  <div key={item.id} className="group flex items-center justify-between rounded-[10px] border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-300">
                    <div className="flex flex-col">
                      <span className="text-sm leading-tight text-slate-950">{item.name}</span>
                      <span className="mt-0.5 text-sm text-slate-600">
                        {item.qty} {item.unit}
                      </span>
                    </div>
                    <AdminSecondaryButton type="button" onClick={() => handleRemoveItem(item.id)} icon={Trash2} className="h-7 w-7 rounded-[8px] border-0 p-0 text-slate-400 hover:bg-red-50 hover:text-red-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-200 pt-3.5">
            <AdminSecondaryButton type="button" className="h-9 flex-1 rounded-[10px] text-xs text-slate-700" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </AdminSecondaryButton>
            <AdminPrimaryButton submitting={submitting} icon={CheckCircle2} className="h-9 flex-[2] rounded-[10px] text-xs">
              {isEditing ? "อัปเดตบิล" : "สร้างออร์เดอร์"}
            </AdminPrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        title="รายละเอียดออร์เดอร์"
        className="max-w-3xl rounded-[14px] border-slate-200/90 p-0 shadow-[0_20px_70px_-52px_rgba(15,23,42,0.34)]"
        bodyClassName="max-h-[78vh] overflow-y-auto px-3 pb-3 pt-0"
      >
        {detailOrder && detailStatus && detailMetrics ? (
          <div className="space-y-2.5 pr-1 text-sm">
            <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold leading-none tracking-[-0.03em] text-slate-950">
                      {getOrderReference(detailOrder)}
                    </div>
                    <AdminStatusChip label={detailStatus.label} tone={detailStatus.tone} className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
                    <span>สร้าง {formatDateTime(detailOrder.createdAt)}</span>
                    <span>ผู้ขอ {detailOrder.requesterName || "ไม่ระบุ"}</span>
                    <span>จัดซื้อ {detailOrder.buyerName || "ยังไม่มอบหมาย"}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-base font-semibold leading-none text-slate-950">{detailMetrics.completionPercent}%</div>
                  <div className="mt-1 text-xs font-medium text-slate-500">
                    {detailMetrics.resolvedCount}/{detailOrder.items.length}
                  </div>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all", PROGRESS_TONE_CLASS[detailStatus.tone] || PROGRESS_TONE_CLASS.slate)}
                  style={{ width: `${detailMetrics.completionPercent}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-[8px] bg-slate-50 px-2 py-2">
                  <div className="text-base font-semibold leading-none text-slate-950">{detailMetrics.pendingCount}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">รอซื้อ</div>
                </div>
                <div className="rounded-[8px] bg-emerald-50 px-2 py-2">
                  <div className="text-base font-semibold leading-none text-emerald-700">{detailMetrics.boughtCount}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">สำเร็จ</div>
                </div>
                <div className="rounded-[8px] bg-red-50 px-2 py-2">
                  <div className="text-base font-semibold leading-none text-red-700">{detailMetrics.cancelledCount}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-red-700">ยกเลิก</div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">ผู้ขอ</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{detailOrder.requesterName || "ไม่ระบุ"}</div>
                <div className="mt-0.5 text-xs font-medium text-slate-600">{detailOrder.requesterUsername ? `@${detailOrder.requesterUsername}` : "ไม่มีชื่อผู้ใช้"}</div>
                {detailRequesterProfile?.linePictureUrl ? (
                  <div className="mt-2 flex items-center gap-2 rounded-[8px] bg-slate-50 px-2 py-1.5">
                    <img
                      src={detailRequesterProfile.linePictureUrl}
                      alt={detailOrder.requesterName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="text-xs font-medium text-slate-600">โปรไฟล์พนักงาน</div>
                  </div>
                ) : null}
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">ผู้จัดซื้อ</div>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  <User className="h-4 w-4" />
                  {detailOrder.buyerName || "ยังไม่มอบหมาย"}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-600">อัปเดต {formatDateTime(detailOrder.updatedAt)}</div>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">ร้านค้า</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{detailOrder.storeName || "ทั่วไป"}</div>
                <div className="mt-0.5 line-clamp-2 text-xs font-medium leading-5 text-slate-600">ที่ตั้ง: {detailOrder.storeLocation || "ไม่ระบุ"}</div>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">จุดส่ง</div>
                <div className="mt-1 text-sm font-semibold text-slate-950">{detailOrder.location || "ไม่ระบุ"}</div>
                <div className="mt-0.5 text-xs font-medium text-slate-600">{detailOrder.contact || "ไม่มีข้อมูลติดต่อเพิ่มเติม"}</div>
              </div>
            </div>

            {detailOrder.note ? (
              <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">บันทึกเพิ่มเติม</div>
                <div className="mt-1 text-sm font-medium leading-6 text-slate-800">{detailOrder.note}</div>
              </div>
            ) : null}

            <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">รายการสินค้า</div>
                  <div className="mt-1 text-sm font-semibold text-slate-950">{detailOrder.items.length} รายการ</div>
                </div>
                <div className="text-xs font-medium text-slate-600">
                  สำเร็จ {detailMetrics.boughtCount} / ยกเลิก {detailMetrics.cancelledCount}
                </div>
              </div>
              <div className="mt-2 divide-y divide-slate-100">
                {detailOrder.items.map((item) => {
                  const itemStatus = ITEM_STATUS_MAP[item.status as keyof typeof ITEM_STATUS_MAP] ?? ITEM_STATUS_MAP.to_buy;

                  return (
                    <div key={item.id} className="flex items-start justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-950">{item.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                          <span>
                            {item.qty} {item.unit}
                          </span>
                          {item.boughtAt ? <span>ซื้อเมื่อ {formatDateTime(item.boughtAt)}</span> : null}
                        </div>
                        {item.note ? <div className="mt-1 text-xs font-medium leading-5 text-slate-600">{item.note}</div> : null}
                      </div>
                      <AdminStatusChip label={itemStatus.label} tone={itemStatus.tone} className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="จัดการสถานะสินค้า"
        className="max-w-3xl rounded-[14px] border-slate-200/90 p-4 shadow-[0_18px_54px_-42px_rgba(15,23,42,0.3)]"
        bodyClassName="max-h-[78vh] overflow-y-auto pr-1"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm leading-tight text-slate-950">{managingOrder?.storeName || "ทั่วไป"}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-600">
                <User className="h-3 w-3" />
                ผู้ขอ: {managingOrder?.requesterName}
              </div>
              <div className="mt-1 text-xs text-slate-500">ขอซื้อเมื่อ {formatDateTime(managingOrder?.createdAt)}</div>
            </div>
          </div>

          <div className="rounded-[12px] border border-teal-200 bg-[linear-gradient(135deg,rgba(240,253,250,1)_0%,rgba(236,253,245,0.95)_100%)] px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-700">ผู้จัดซื้อ</div>
                <div className="text-sm font-semibold text-slate-950">ต้องเลือกผู้จัดซื้อทุกครั้งก่อนอัปเดตสถานะ</div>
                <div className="text-xs text-slate-500">
                  ผู้จัดซื้อเดิม: {managingOrder?.buyerName || "ยังไม่เคยกำหนด"}
                </div>
              </div>
              <div className="w-full sm:max-w-xs">
                <Select
                  value={selectedBuyerId}
                  onChange={(e) => setSelectedBuyerId(e.target.value)}
                  className="h-10 rounded-[10px] border border-teal-300 bg-white text-sm text-slate-900"
                >
                  <option value="">เลือกผู้จัดซื้อ...</option>
                  {buyerOptions.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-sm text-slate-900">รายการสินค้า</div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{managedItems.length} รายการ</span>
            </div>
            <div className="custom-scrollbar max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {managedItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm leading-tight text-slate-950">{item.name}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{item.boughtAt ? `ซื้อสำเร็จ ${formatDateTime(item.boughtAt)}` : "ยังไม่บันทึกเวลาซื้อสำเร็จ"}</div>
                    </div>
                    <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                      {item.qty} {item.unit}
                    </span>
                    <div className="grid shrink-0 grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => updateManagedItemStatus(item.id, "bought")}
                        className={cn(
                          "h-8 min-w-[62px] rounded-lg border px-2 text-xs transition-all",
                          item.status === "bought"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-700",
                        )}
                      >
                        เรียบร้อย
                      </button>
                      <button
                        type="button"
                        onClick={() => updateManagedItemStatus(item.id, "to_buy")}
                        className={cn(
                          "h-8 min-w-[62px] rounded-lg border px-2 text-xs transition-all",
                          item.status === "to_buy"
                            ? "border-slate-800 bg-slate-800 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
                        )}
                      >
                        รอซื้อ
                      </button>
                      <button
                        type="button"
                        onClick={() => updateManagedItemStatus(item.id, "cancelled")}
                        className={cn(
                          "h-8 min-w-[62px] rounded-lg border px-2 text-xs transition-all",
                          item.status === "cancelled"
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:text-red-600",
                        )}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between px-1">
              <Label className="text-sm text-slate-900">บันทึกเพิ่มเติม</Label>
              {manageNote ? <span className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-600">Modified</span> : null}
            </div>
            <textarea
              value={manageNote}
              onChange={(e) => setManageNote(e.target.value)}
              placeholder="ระบุรายละเอียดสำคัญ..."
              className="h-20 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>

          <AdminPrimaryButton type="button" onClick={saveManagedItems} submitting={submitting} icon={Activity} className="h-11 w-full text-sm">
            บันทึกสถานะจัดซื้อ
          </AdminPrimaryButton>
        </div>
      </Modal>
    </>
  );
}
