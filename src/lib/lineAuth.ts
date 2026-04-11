"use client";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { StaffMember } from "@/hooks/useStaff";

/**
 * Find a staff member by their LINE User ID
 */
export async function findStaffByLineUserId(
  lineUserId: string
): Promise<StaffMember | null> {
  const q = query(
    collection(db, "users"),
    where("lineUserId", "==", lineUserId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as StaffMember;
}

/**
 * Find a staff member by their phone number
 */
export async function findStaffByPhone(
  phone: string
): Promise<StaffMember | null> {
  // Normalize phone: remove spaces, dashes
  const normalized = phone.replace(/[\s\-]/g, "");

  const q = query(collection(db, "users"), where("phone", "==", normalized));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as StaffMember;
  }

  // Also try with leading zero variants
  const allStaffQuery = query(collection(db, "users"));
  const allSnapshot = await getDocs(allStaffQuery);
  for (const docSnap of allSnapshot.docs) {
    const data = docSnap.data();
    const staffPhone = (data.phone || "").replace(/[\s\-]/g, "");
    if (
      staffPhone === normalized ||
      staffPhone === "0" + normalized ||
      "0" + staffPhone === normalized
    ) {
      return { id: docSnap.id, ...data } as StaffMember;
    }
  }

  return null;
}

/**
 * Link a LINE User ID to a staff member document in Firestore
 * Also stores the LINE profile picture and display name
 */
export async function linkLineUserIdToStaff(
  staffId: string,
  lineUserId: string,
  linePictureUrl?: string,
  lineDisplayName?: string
): Promise<void> {
  const docRef = doc(db, "users", staffId);
  const updateData: Record<string, any> = { lineUserId };
  if (linePictureUrl) updateData.linePictureUrl = linePictureUrl;
  if (lineDisplayName) updateData.lineDisplayName = lineDisplayName;
  await updateDoc(docRef, updateData);
}
