import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { Order, Item } from "@/types";
export function useOrders(filterRole?: "orderer" | "buyer", userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    if (filterRole === "orderer" && userId) {
      // Use simpler query to avoid composite index requirement
      q = query(collection(db, "orders"), where("requesterId", "==", userId));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        // Sort client-side if we couldn't order by createdAt in the query (due to missing composite index)
        if (filterRole === "orderer" && userId) {
          ordersData.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeB - timeA;
          });
        }

        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [filterRole, userId]);
  const createOrder = async (orderData: Partial<Order>) => {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };
  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"],
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };
  const updateItemStatus = async (orderId: string, items: Item[]) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { items, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error updating items:", error);
      throw error;
    }
  };
  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { ...orderData, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  };
  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    updateItemStatus,
    updateOrder,
  };
}
