"use client";

import React, { useState, useEffect } from "react";
import { useStaff } from "@/hooks/useStaff";
import { useBuyerAuth } from "@/context/BuyerContext";
import { useLiff } from "@/lib/liff";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Card, Label } from "@/components/ui/FormElements";
import { User, Loader2, ClipboardList, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  findStaffByLineUserId,
  findStaffByPhone,
  linkLineUserIdToStaff,
} from "@/lib/lineAuth";

type LoginMode = "choose" | "username" | "line-phone" | "line-linking";

export default function OrderSupportLoginPage() {
  const [mode, setMode] = useState<LoginMode>("choose");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [lineLoading, setLineLoading] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const { staff, loading: staffLoading } = useStaff();
  const { login, loginWithStaff } = useBuyerAuth();
  const { liff, profile, isLoggedIn, login: liffLogin, loading: liffLoading } = useLiff();
  const router = useRouter();

  // Auto-login if LINE is already logged in and linked
  useEffect(() => {
    if (isLoggedIn && profile?.userId) {
      handleAutoLineLogin(profile.userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, profile]);

  const handleAutoLineLogin = async (lineUserId: string) => {
    setLineLoading(true);
    try {
      const foundStaff = await findStaffByLineUserId(lineUserId);
      if (foundStaff) {
        loginWithStaff(foundStaff);
        const role = foundStaff.role?.toLowerCase().trim() || "";
        const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
        const isBuyer = role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order";
        if (isAdmin) router.push("/admin");
        else if (isBuyer) router.push("/order");
        else router.push("/buy");
      } else {
        // Automatically switch to phone linking mode if LINE is logged in but no staff linked
        setMode("line-phone");
      }
    } catch (err) {
      console.error("Auto LINE login failed:", err);
    } finally {
      setLineLoading(false);
    }
  };

  const handleUsernameLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("กรุณาระบุชื่อผู้ใช้");
      return;
    }

    const user = login(username, staff);
    if (user) {
      const role = user.role?.toLowerCase().trim() || "";
      const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
      const isBuyer = role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order";
      if (isAdmin) router.push("/admin");
      else if (isBuyer) router.push("/order");
      else router.push("/buy");
    } else {
      setError("ไม่พบข้อมูลผู้ใช้นี้ในระบบ");
    }
  };

  const handleLineLogin = () => {
    if (isLoggedIn && profile?.userId) {
      setMode("line-phone");
    } else {
      liffLogin();
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/[\s\-]/g, "");
    if (!cleaned || cleaned.length < 9) {
      setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
      return;
    }

    setLineLoading(true);
    try {
      const foundStaff = await findStaffByPhone(cleaned);
      if (!foundStaff) {
        setError("ไม่พบเบอร์นี้ในระบบ กรุณาตรวจสอบหรือติดต่อผู้ดูแลระบบ");
        setLineLoading(false);
        return;
      }

      const lineUserId = profile?.userId;
      if (lineUserId) {
        await linkLineUserIdToStaff(
          foundStaff.id,
          lineUserId,
          profile?.pictureUrl,
          profile?.displayName
        );
      }

      const linkedStaff = {
        ...foundStaff,
        lineUserId: lineUserId || foundStaff.lineUserId,
        linePictureUrl: profile?.pictureUrl || foundStaff.linePictureUrl,
        lineDisplayName: profile?.displayName || foundStaff.lineDisplayName,
      };

      setLinkSuccess(true);
      setMode("line-linking");

      // Auto login after short delay
      setTimeout(() => {
        loginWithStaff(linkedStaff);
        const role = linkedStaff.role?.toLowerCase().trim() || "";
        const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
        const isBuyer = role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order";
        if (isAdmin) router.push("/admin");
        else if (isBuyer) router.push("/order");
        else router.push("/buy");
      }, 1500);
    } catch (err) {
      console.error("Phone linking failed:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLineLoading(false);
    }
  };

  if (lineLoading && mode === "choose") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">กำลังตรวจสอบบัญชี LINE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 text-white">
            <ClipboardList className="h-8 w-8" />
          </div>
          <div className="eyebrow mb-3">Order Fulfillment</div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            เข้าสู่ระบบฝ่ายจัดซื้อ
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            เข้าสู่ระบบด้วย Username หรือบัญชี LINE
          </p>
        </div>

        {/* === MODE: Choose === */}
        {mode === "choose" && (
          <Card className="space-y-4 border-slate-300 bg-white p-5">
            <Button
              onClick={() => setMode("username")}
              variant="primary"
              className="w-full gap-3"
            >
              <User className="h-4 w-4" />
              เข้าสู่ระบบด้วย Username
            </Button>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-xs text-slate-400 uppercase tracking-[0.1em]">หรือ</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            <button
              onClick={handleLineLogin}
              disabled={liffLoading}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-[#06C755] bg-[#06C755] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#05b34c] disabled:opacity-50"
            >
              {liffLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  เข้าสู่ระบบด้วย LINE
                </>
              )}
            </button>

            <div className="border-t border-slate-200 pt-4 text-center text-xs leading-5 text-slate-500">
              Restricted access for authorized staff only
            </div>
          </Card>
        )}

        {/* === MODE: Username === */}
        {mode === "username" && (
          <Card className="space-y-5 border-slate-300 bg-white p-5">
            <form onSubmit={handleUsernameLogin} className="space-y-4">
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
                {staffLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "เข้าสู่หน้าจัดการออร์เดอร์"
                )}
              </Button>
            </form>

            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              กลับไปเลือกวิธีเข้าสู่ระบบ
            </button>
          </Card>
        )}

        {/* === MODE: LINE Phone Registration === */}
        {mode === "line-phone" && (
          <Card className="space-y-6 border-slate-300 bg-white p-5">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <div>
                  <div className="text-sm font-semibold text-emerald-800">
                    เข้าสู่ระบบ LINE สำเร็จ
                  </div>
                  <div className="mt-0.5 text-xs text-emerald-600">
                    {profile?.displayName || "LINE User"}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <Label>เบอร์โทรศัพท์ติดต่อ</Label>
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  กรอกเบอร์โทรศัพท์ที่ลงทะเบียนไว้ในระบบ เพื่อเชื่อมต่อกับบัญชี LINE
                </p>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    autoFocus
                    type="tel"
                    placeholder="0XX-XXX-XXXX"
                    className="pl-10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
              </div>

              <Button type="submit" disabled={lineLoading} className="w-full">
                {lineLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "ยืนยันและเชื่อมต่อบัญชี"
                )}
              </Button>
            </form>

            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              กลับไปเลือกวิธีเข้าสู่ระบบ
            </button>
          </Card>
        )}

        {/* === MODE: Link Success === */}
        {mode === "line-linking" && linkSuccess && (
          <Card className="space-y-5 border-emerald-300 bg-white p-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">เชื่อมต่อบัญชีสำเร็จ!</h2>
              <p className="mt-2 text-sm text-slate-500">
                ครั้งถัดไป เข้าสู่ระบบผ่าน LINE ได้โดยอัตโนมัติ
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังเข้าสู่ระบบ...
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
