import type { Metadata, Viewport } from "next";
import { OrderProvider } from "@/context/OrderContext";

import React from "react";

export const metadata: Metadata = {
  title: "สั่งซื้อสินค้า",
  description: "สั่งซื้อสินค้า",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderProvider>
      <div className="buy-ui min-h-screen bg-transparent px-4 py-2">
        {children}
      </div>
    </OrderProvider>
  );
}
