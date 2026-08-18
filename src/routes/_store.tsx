import { Outlet, createFileRoute } from "@tanstack/react-router";

import { FloatingActions } from "@/components/FloatingActions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/lib/cart";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 animate-rise">
          <Outlet />
        </main>
        <SiteFooter />
        <FloatingActions />
      </div>
    </CartProvider>
  );
}
