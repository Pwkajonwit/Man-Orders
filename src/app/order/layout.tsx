import type { Metadata, Viewport } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "การจัดซื้อ",
  description: "การจัดซื้อ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="order-ui min-h-screen bg-transparent px-4 pb-10 pt-4">
      {children}
    </div>
  );
}
