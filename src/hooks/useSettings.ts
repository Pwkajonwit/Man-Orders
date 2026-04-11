"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { AppSettings } from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
  systemName: "Order Symmetry",
  companyName: "Powertech Limited",
  categories: ["วัสดุสิ้นเปลือง", "เครื่องมือช่าง", "ไฟฟ้า", "ประปา", "สีเเอปเปิ้ล"],
  units: ["ชิ้น", "กล่อง", "มัด", "โหล", "ตัว", "ชุด", "กิโลกรัม"],
  lineNotifyEnabled: true,
  orderFilteringEnabled: false,
  lineGroupId: "",
  notifyOnNewOrder: true,
  notifyOnCompleted: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, "settings", "app-config");
    
    // Subscribe to settings changes
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      } else {
        // If it doesn't exist, initialize it with defaults
        initializeSettings();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeSettings = async () => {
    try {
      const settingsRef = doc(db, "settings", "app-config");
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to initialize settings:", err);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const settingsRef = doc(db, "settings", "app-config");
      await setDoc(settingsRef, {
        ...settings,
        ...newSettings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  return { settings, loading, updateSettings };
}
