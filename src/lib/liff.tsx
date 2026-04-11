"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const LiffContext = createContext<{
  liff: any;
  profile: any;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
}>({
  liff: null,
  profile: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  loading: true,
});

export function LiffProvider({ children, liffId }: { children: React.ReactNode, liffId: string }) {
  const [liff, setLiff] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;
        await liff.init({ liffId });
        setLiff(liff);
        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
        }
        setLoading(false);
      } catch (error) {
        console.error("LIFF initialization failed", error);
        setLoading(false);
      }
    };
    initLiff();
  }, [liffId]);

  const login = () => liff?.login();
  const logout = () => {
    liff?.logout();
    setProfile(null);
  };

  return (
    <LiffContext.Provider value={{ liff, profile, isLoggedIn: !!profile, login, logout, loading }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
