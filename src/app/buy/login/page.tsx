"use client";

import React, { useState } from "react";
import { useStaff } from "@/hooks/useStaff";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Card, Label } from "@/components/ui/FormElements";
import { User, ShieldCheck, Loader2 } from "lucide-react";

export default function BuyerLoginPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { staff, loading: staffLoading } = useStaff();
  const { login } = useBuyerAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("กรุณาระบุชื่อผู้ใช้");
      return;
    }

    const success = login(username, staff);
    if (success) {
      router.push("/buy");
    } else {
      setError("ไม่พบข้อมูลผู้ใช้นี้ในระบบ");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-primary bg-primary">
            <ShieldCheck className="h-8 w-8 text-slate-950" />
          </div>
          <div className="eyebrow mb-3">Buyer Access</div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            เข้าสู่ระบบผู้จัดซื้อ
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            ใช้ชื่อพนักงานหรือ username เพื่อเข้าสู่หน้าจัดซื้อ
          </p>
        </div>

        <Card className="space-y-6 border-slate-300 bg-white p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label>ชื่อพนักงานหรือ Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  autoFocus
                  placeholder="กรอกชื่อผู้ใช้"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
            </div>

            <Button type="submit" disabled={staffLoading} className="w-full">
              {staffLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "เข้าสู่ระบบ"}
            </Button>
          </form>

          <div className="border-t border-slate-200 pt-4 text-center text-xs leading-5 text-slate-500">
            หากเข้าใช้งานไม่ได้ ให้ติดต่อผู้ดูแลระบบ
          </div>
        </Card>
      </div>
    </div>
  );
}
