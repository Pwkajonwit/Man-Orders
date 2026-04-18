"use client";

import Link from "next/link";
import { UserCog, ShoppingCart, Truck, ChevronRight, Loader2, User, ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import { useLiff } from "@/lib/liff";
import { useStaff } from "@/hooks/useStaff";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input, Label } from "@/components/ui/FormElements";
import { useBuyerAuth } from "@/context/BuyerContext";
import { linkLineUserIdToStaff, findStaffByPhone } from "@/lib/lineAuth";

export default function Home() {
  const { profile, isLoggedIn, loading: liffLoading, login: liffLogin, error: liffError } = useLiff();
  const { buyer, loading: authLoading, logout, login, loginWithStaff } = useBuyerAuth();
  const { staff, loading: staffLoading } = useStaff();
  const router = useRouter();

  const [mode, setMode] = useState<"choose" | "username" | "line-phone" | "line-linking">("choose");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [lineLoading, setLineLoading] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  const currentUser = useMemo(() => {
    if (buyer) return buyer;
    if (!profile || !staff.length) return null;
    return staff.find(s => s.lineUserId === profile.userId);
  }, [profile, staff, buyer]);

  useEffect(() => {
    if (liffLoading || staffLoading || authLoading) return;

    if (currentUser) {
      if (!buyer) {
        loginWithStaff(currentUser);
      }

      const role = currentUser.role?.toLowerCase().trim() || "";
      const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
      const isBuyer = role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order";
      const isOrderer = role === "orderer" || role === "user" || role === "ผู้ซื้อ" || role === "ผู้สั่งซื้อ" || role === "buy";

      if (isAdmin) {
        router.replace("/admin");
      } else if (isBuyer) {
        router.replace("/order");
      } else if (isOrderer) {
        router.replace("/buy");
      }
    } else if (isLoggedIn && profile && !currentUser) {
      setMode("line-phone");
    }
  }, [liffLoading, staffLoading, authLoading, currentUser, buyer, loginWithStaff, router, isLoggedIn, profile]);

  const allRoles = [
    {
      title: "Admin Dashboard",
      href: "/admin",
      icon: UserCog,
      allowed: ["admin"],
    },
    {
      title: "Order Fulfillment",
      href: "/order",
      icon: Truck,
      allowed: ["admin", "buyer"],
    },
    {
      title: "Buyer Request",
      href: "/buy",
      icon: ShoppingCart,
      allowed: ["admin", "orderer"],
    },
  ];

  const visibleRoles = useMemo(() => {
    if (!currentUser) return [];
    const role = currentUser.role?.toLowerCase().trim() || "";
    const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
    const mappedRole = isAdmin ? "admin" 
                     : (role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order") ? "buyer" 
                     : "orderer";

    if (isAdmin) return allRoles;
    return allRoles.filter(r => r.allowed.includes(mappedRole));
  }, [currentUser, allRoles]);

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("กรุณาระบุชื่อผู้ใช้");
      return;
    }

    const user = login(username, staff);
    if (user) {
      if (isLoggedIn && profile) {
        try {
          await linkLineUserIdToStaff(user.id, profile.userId, profile.pictureUrl, profile.displayName);
        } catch (linkErr) {
          console.error("Failed to link account automatically:", linkErr);
        }
      }

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

      setTimeout(() => {
        loginWithStaff(linkedStaff);
      }, 1500);
    } catch (err) {
      console.error("Phone linking failed:", err);
      setError("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setLineLoading(false);
    }
  };

  const isLoading = liffLoading || authLoading || (isLoggedIn && staffLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
        <div className="text-center w-full max-w-sm">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-xl">
            <UserCog className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl mb-4">
            Staff Portal
          </h1>
          <p className="text-slate-500 mb-10 text-sm leading-relaxed px-4">
            เข้าสู่ระบบเพื่อจัดการออร์เดอร์และติดตามการจัดซื้อของคุณ
          </p>
          
          {mode === "choose" ? (
            <div className="space-y-4">
              {liffError && (
                <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                  ⚠️ LIFF Error: {liffError}
                </div>
              )}
              
              {isLoggedIn && !currentUser && (
                <div className="mb-6 rounded-2xl bg-emerald-50 p-6 text-left border border-emerald-100 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 text-emerald-800 font-bold mb-3">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>เข้าสู่ระบบ LINE สำเร็จ!</span>
                  </div>
                  <p className="text-[14px] text-emerald-700 leading-relaxed font-medium">
                    กรุณาผูกบัญชีพนักงานของคุณเพื่อใช้งานต่อ
                  </p>
                  <button 
                    onClick={() => setMode("line-phone")}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    เริ่มการผูกบัญชีด้วยเบอร์โทร
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <button 
                  onClick={liffLogin}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#06C755] px-8 py-4 font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#05b34c] active:scale-95 disabled:opacity-50"
                  disabled={!!liffError}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  LOGIN WITH LINE
                </button>
              )}
              
              <button 
                onClick={() => setMode("username")}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                {isLoggedIn && !currentUser ? "LINK ACCOUNT WITH USERNAME" : "LOGIN WITH USERNAME"}
              </button>
            </div>
          ) : mode === "username" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left animate-in fade-in zoom-in-95">
              <form onSubmit={handleUsernameLogin} className="space-y-5">
                <div>
                  <Label>ชื่อพนักงานหรือ Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      autoFocus
                      placeholder="กรอกชื่อผู้ใช้..."
                      className="pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={staffLoading} 
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
                >
                  {staffLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "เข้าสู่ระบบเพื่อเชื่อมต่อ"}
                </button>
              </form>

              <button
                onClick={() => { setMode("choose"); setError(""); }}
                className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับไปเลือกวิธีเข้าสู่ระบบ
              </button>
            </div>
          ) : mode === "line-phone" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left animate-in fade-in zoom-in-95">
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div>
                  <Label>เบอร์โทรศัพท์ที่ลงทะเบียน</Label>
                  <p className="mt-1 text-xs text-slate-500 mb-3">กรุณาระบุเบอร์โทรศัพท์เพื่อผูกกับบัญชี LINE นี้</p>
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

                <button 
                  type="submit" 
                  disabled={lineLoading} 
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {lineLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "ยืนยันและเชื่อมต่อบัญชี"}
                </button>
              </form>

              <button
                onClick={() => { setMode("choose"); setError(""); }}
                className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                กลับหน้าหลัก
              </button>
            </div>
          ) : mode === "line-linking" && linkSuccess ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm text-center animate-in fade-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-5">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">เชื่อมต่อสำเร็จ!</h2>
              <p className="mt-2 text-sm text-slate-500 mb-6">บัญชี LINE ของคุณถูกผูกกับระบบพนักงานเรียบร้อยแล้ว</p>
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังนำคุณเข้าสู่ Workspace...
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Workspace
        </h1>
        <p className="mt-4 flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-[11px] bg-slate-100 px-4 py-2 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {currentUser.name} ({currentUser.role})
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4">
        {visibleRoles.map((role) => (
          <Link key={role.title} href={role.href} className="group">
            <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-7 py-6 transition-all group-hover:border-slate-900 group-hover:shadow-xl group-hover:shadow-slate-200">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                  <role.icon className="h-7 w-7" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{role.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">จัดการส่วนงาน {role.title.toLowerCase()}</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-900" />
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-12 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
      >
        Sign Out
      </button>
    </div>
  );
}
