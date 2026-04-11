import { OrderProvider } from "@/context/OrderContext";
import { BuyerProvider } from "@/context/BuyerContext";

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return (
    <BuyerProvider>
      <OrderProvider>
        <div className="buy-ui min-h-screen bg-transparent px-4 pb-12 pt-4">
          {children}
        </div>
      </OrderProvider>
    </BuyerProvider>
  );
}
