"use client";

import Link from "next/link";
import { UserCog, ShoppingCart, Truck, ChevronRight } from "lucide-react";

export default function Home() {
  const roles = [
    {
      title: "Admin Dashboard",
      desc: "Manage users, inventory, approvals, and reporting in one workspace.",
      href: "/admin",
      icon: UserCog,
      type: "Desktop",
    },
    {
      title: "Order Mobile",
      desc: "Create purchase requests quickly with a compact form flow for field staff.",
      href: "/order",
      icon: ShoppingCart,
      type: "Mobile",
    },
    {
      title: "Buyer Mobile",
      desc: "Track incoming requests and execute purchase tasks with clear statuses.",
      href: "/buy",
      icon: Truck,
      type: "Mobile",
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-14">
      <div className="mb-12 max-w-3xl">
        <div className="eyebrow mb-4">Enterprise Ordering Platform</div>
        <h1 className="max-w-2xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-slate-900 md:text-6xl">
          Professional ordering interface for day-to-day operations.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          เลือกพื้นที่ทำงานที่เหมาะกับบทบาทของคุณ ระบบถูกปรับใหม่ให้คมขึ้น อ่านง่ายขึ้น และลดองค์ประกอบฟุ้งทั้งหมดเพื่อใช้งานในองค์กรได้จริง
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
        {roles.map((role) => (
          <Link key={role.title} href={role.href} className="group">
            <div className="flex h-full flex-col rounded-xl border border-slate-300 bg-white p-1 transition-colors group-hover:border-slate-900">
              <div className="flex flex-1 flex-col gap-6 rounded-[0.7rem] border border-slate-100 bg-slate-50/60 p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-900">
                  <role.icon className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <div className="eyebrow">{role.type}</div>
                  <h3 className="text-2xl font-semibold leading-none tracking-[-0.03em] text-slate-900">
                    {role.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">{role.desc}</p>
                </div>
                <div className="mt-auto inline-flex w-fit items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Optimized for {role.type}
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between rounded-[0.7rem] border border-slate-200 bg-white px-6 py-4 transition-colors group-hover:border-slate-900">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                  Enter Workspace
                </span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-slate-900" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span>POWERTECH LIMITED</span>
        <span>Operational UI 2026</span>
      </div>
    </div>
  );
}
