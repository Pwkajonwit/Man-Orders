"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { StaffMember } from "@/hooks/useStaff";
import { useRouter, usePathname } from "next/navigation";
import { useLiff } from "@/lib/liff";

interface BuyerContextType {
  buyer: StaffMember | null;
  login: (username: string, staffList: StaffMember[]) => StaffMember | null;
  loginWithStaff: (staff: StaffMember) => void;
  logout: () => void;
  loading: boolean;
}

const BuyerContext = createContext<BuyerContextType>({
  buyer: null,
  login: () => null,
  loginWithStaff: () => {},
  logout: () => {},
  loading: true,
});

export function BuyerProvider({ children }: { children: React.ReactNode }) {
  const [buyer, setBuyer] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { logout: liffLogout } = useLiff();

  useEffect(() => {
    const savedBuyer = localStorage.getItem("powertech_buyer");
    if (savedBuyer) {
      setBuyer(JSON.parse(savedBuyer));
    }
    setLoading(false);
  }, []);

  const login = (username: string, staffList: StaffMember[]) => {
    const found = staffList.find(s => s.username === username || s.name === username);
    if (found) {
      setBuyer(found);
      localStorage.setItem("powertech_buyer", JSON.stringify(found));
      return found;
    }
    return null;
  };

  /** Direct login with a resolved StaffMember (used by LINE auth flow) */
  const loginWithStaff = (staff: StaffMember) => {
    setBuyer(staff);
    localStorage.setItem("powertech_buyer", JSON.stringify(staff));
  };

  const logout = () => {
    setBuyer(null);
    localStorage.removeItem("powertech_buyer");
    liffLogout();
    router.push("/");
  };

  // Auth Protection - Redirect to login if not in login page and not authenticated or unauthorized
  useEffect(() => {
    const isLoginPage = pathname === "/buy/login" || pathname === "/order/login" || pathname === "/admin/login";
    const isProtectedPath = pathname.startsWith("/buy") || pathname.startsWith("/order") || pathname.startsWith("/admin");
    
    if (!loading && isProtectedPath && !isLoginPage) {
      if (!buyer) {
        // Not logged in -> Redirect to main portal login
        router.push("/");
        return;
      }

      const role = buyer.role?.toLowerCase().trim() || "";

      const isAdmin = role === "admin" || role === "แอดมิน" || role === "administrator";
      const isBuyer = role === "buyer" || role === "staff" || role === "พนักงานจัดซื้อ" || role === "จัดซื้อ" || role === "order";
      const isOrderer = role === "orderer" || role === "user" || role === "ผู้ซื้อ" || role === "ผู้สั่งซื้อ" || role === "buy";

      // If they are an unknown role, they shouldn't bounce infinitely.
      const isUnknownRole = !isAdmin && !isBuyer && !isOrderer;

      // Logged in -> Check Roles (Admin has access everywhere)
      if (isAdmin) return;

      if (isUnknownRole) {
        // Stop infinite loops for unknown roles, force them to logout or go to home screen.
        if (pathname !== "/") router.push("/");
        return;
      }

      // Role Check for Orders (Staff/Buyer)
      if (pathname.startsWith("/order") && !isBuyer) {
        router.push("/buy");
        return;
      }
      
      // Role Check for Buying (Requester/Orderer)
      if (pathname.startsWith("/buy") && !isOrderer) {
        router.push("/order");
        return;
      }

      // Role Check for Admin
      if (pathname.startsWith("/admin") && !isAdmin) {
        if (isBuyer) router.push("/order");
        else router.push("/buy");
        return;
      }
    }
  }, [buyer, loading, pathname, router]);

  return (
    <BuyerContext.Provider value={{ buyer, login, loginWithStaff, logout, loading }}>
      {children}
    </BuyerContext.Provider>
  );
}

export const useBuyerAuth = () => useContext(BuyerContext);
