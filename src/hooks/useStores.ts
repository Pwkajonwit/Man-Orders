"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { NetworkStore } from "@/types";

export function useStores() {
  const [stores, setStores] = useState<NetworkStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "stores"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const storesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NetworkStore[];
        setStores(storesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching stores:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const addStore = async (storeData: Omit<NetworkStore, "id">) => {
    return await addDoc(collection(db, "stores"), {
      ...storeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateStore = async (id: string, storeData: Partial<NetworkStore>) => {
    const storeRef = doc(db, "stores", id);
    return await updateDoc(storeRef, {
      ...storeData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteStore = async (id: string) => {
    const storeRef = doc(db, "stores", id);
    return await deleteDoc(storeRef);
  };

  return { stores, loading, addStore, updateStore, deleteStore };
}
