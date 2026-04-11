import { BuyerProvider } from "@/context/BuyerContext";

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <BuyerProvider>
      <div className="order-ui min-h-screen bg-transparent px-4 pb-10 pt-4">
        {children}
      </div>
    </BuyerProvider>
  );
}
