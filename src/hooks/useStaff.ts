"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
export interface StaffMember {
  id: string;
  name: string;
  username?: string;
  role: string;
  status: "active" | "offline";
  phone: string;
  deals: number;
  lastActive?: any;
}
export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const staffData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as StaffMember[];
        setStaff(staffData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching staff:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);
  return { staff, loading };
}
