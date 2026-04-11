"use client";

import Link from "next/link";
import { UserCog, ShoppingCart, Truck, ChevronRight, Loader2, User, ArrowLeft } from "lucide-react";
import { useLiff } from "@/lib/liff";
import { useStaff } from "@/hooks/useStaff";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input, Label } from "@/components/ui/FormElements";
import { useBuyerAuth } from "@/context/BuyerContext";
import { linkLineUserIdToStaff } from "@/lib/lineAuth";

export default function Home() {
  const { profile, isLoggedIn, loading: liffLoading, login: liffLogin, error: liffError } = useLiff();
  const { buyer, loading: authLoading, logout, login, loginWithStaff } = useBuyerAuth();
  const { staff, loading: staffLoading } = useStaff();
  const router = useRouter();

  const [mode, setMode] = useState<"choose" | "username">("choose");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const currentUser = useMemo(() => {
    if (buyer) return buyer;
    if (!profile || !staff.length) return null;
    return staff.find(s => s.lineUserId === profile.userId);
  }, [profile, staff, buyer]);

  useEffect(() => {
    // If not loaded yet, do nothing
    if (liffLoading || staffLoading || authLoading) return;

    if (currentUser) {
      // Very Important: If we found currentUser via LINE but BuyerContext doesn't know them yet,
      // we must log them in globally so the route guard doesn't kick them out!
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
    }
  }, [liffLoading, staffLoading, authLoading, currentUser, buyer, loginWithStaff, router]);

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
  }, [currentUser]);

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("กรุณาระบุชื่อผู้ใช้");
      return;
    }

    const user = login(username, staff);
    if (user) {
      // Automatic Linking: If they log in via Username but we have a LINE profile, link them!
      if (isLoggedIn && profile) {
        try {
          await linkLineUserIdToStaff(user.id, profile.userId, profile.pictureUrl, profile.displayName);
          console.log("Account linked successfully");
        } catch (linkErr) {
          console.error("Failed to link account automatically:", linkErr);
        }
      }

      const role = user.role?.toLowerCase().trim() || "";
      const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
      const isBuyer = role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order";

      if (isAdmin) router.push("/admin");
      else if (isBuyer) router.push("/order");
      else router.push("/buy"); // Default to buy portal
    } else {
      setError("ไม่พบข้อมูลผู้ใช้นี้ในระบบ");
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
                <div className="mb-6 rounded-2xl bg-amber-50 p-5 text-left border border-amber-100 shadow-sm">
                  <div className="flex items-center gap-3 text-amber-800 font-bold mb-2">
                    <User className="h-5 w-5" />
                    <span>ไม่พบการเชื่อมบัญชี LINE</span>
                  </div>
                  <p className="text-[13px] text-amber-700 leading-relaxed font-medium">
                    คุณเข้าสู่ระบบ LINE สำเร็จแล้ว แต่บัญชีนี้ยังไม่ได้เชื่อมต่อกับระบบพนักงาน 
                    <strong className="block mt-2">กรุณาเลือก "LOGIN WITH USERNAME" เพื่อระบุตัวตนและเชื่อมบัญชีในครั้งแรก</strong>
                  </p>
                </div>
              )}

              <button 
                onClick={liffLogin}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#06C755] px-8 py-4 font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#05b34c] active:scale-95 disabled:opacity-50"
                disabled={!!liffError}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                {isLoggedIn ? "LOGGED IN WITH LINE" : "LOGIN WITH LINE"}
              </button>
              
              <button 
                onClick={() => setMode("username")}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                {isLoggedIn && !currentUser ? "LINK ACCOUNT WITH USERNAME" : "LOGIN WITH USERNAME"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
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
                  {staffLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "เข้าสู่ระบบ"}
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
          )}
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
