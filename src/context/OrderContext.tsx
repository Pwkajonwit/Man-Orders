"use client";
import React, { createContext, useContext, useState } from "react";
interface OrderItem {
  name: string;
  quantity: string;
  unit: string;
}
interface OrderContextType {
  orderData: {
    storeId: string;
    contact: string;
    storeName: string;
    location: string;
    items: OrderItem[];
    note: string;
  };
  setOrderData: React.Dispatch<
    React.SetStateAction<OrderContextType["orderData"]>
  >;
  resetOrder: () => void;
}
const OrderContext = createContext<OrderContextType | undefined>(undefined);
export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderData, setOrderData] = useState<OrderContextType["orderData"]>({
    storeId: "",
    contact: "",
    storeName: "",
    location: "",
    items: [],
    note: "",
  });
  const resetOrder = () => {
    setOrderData({
      storeId: "",
      contact: "",
      storeName: "",
      location: "",
      items: [],
      note: "",
    });
  };
  return (
    <OrderContext.Provider value={{ orderData, setOrderData, resetOrder }}>
      {" "}
      {children}{" "}
    </OrderContext.Provider>
  );
}
export function useOrderContext() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
}
