"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const LiffContext = createContext<{
  liff: any;
  profile: any;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
  error: string | null;
}>({
  liff: null,
  profile: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  loading: true,
  error: null,
});

export function LiffProvider({ children, liffId }: { children: React.ReactNode, liffId: string }) {
  const [liff, setLiff] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffModule = await import("@line/liff");
        const liffValue = liffModule.default;
        await liffValue.init({ liffId });
        setLiff(liffValue);
        if (liffValue.isLoggedIn()) {
          const userProfile = await liffValue.getProfile();
          setProfile(userProfile);
        }
        setLoading(false);
      } catch (err: any) {
        console.error("LIFF initialization failed", err);
        setError(err?.message || "LIFF initialization failed");
        setLoading(false);
      }
    };
    initLiff();
  }, [liffId]);

  const login = () => liff?.login();
  const logout = () => {
    if (liff && liff.isLoggedIn()) {
      liff.logout();
    }
    setProfile(null);
  };

  return (
    <LiffContext.Provider value={{ liff, profile, isLoggedIn: !!profile, login, logout, loading, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
