import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LiffProvider } from "@/lib/liff";
import { BuyerProvider } from "@/context/BuyerContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "จัดการจัดซื้อ",
  description: "จัดการคำสั่งซื้อสินค้า",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
  return (
    <html lang="en">
      <body className="text-gray-900">
        <div className="app-shell min-h-screen">
          <LiffProvider liffId={liffId}>
            <BuyerProvider>
              <main className="relative mx-auto min-h-screen">
                {children}
              </main>
            </BuyerProvider>
          </LiffProvider>
        </div>
      </body>
    </html>
  );
}
