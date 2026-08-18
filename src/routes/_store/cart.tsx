import { Link, createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { cartTotals, inr } from "@/lib/format";
import { FALLBACK_IMAGE } from "@/lib/types";

export const Route = createFileRoute("/_store/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Micro Shoe Mart" },
      { name: "description", content: "Review your selected footwear before ordering on WhatsApp." },
      { property: "og:title", content: "Your Cart — Micro Shoe Mart" },
      {
        property: "og:description",
        content: "Review your selected footwear before ordering on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, removeItem, ready } = useCart();
  const totals = cartTotals(items);

  if (ready && items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Add a pair you like and it will show up here.</p>
        <Button className="mt-6" asChild>
          <Link to="/shop">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Shopping cart</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex gap-4 rounded-2xl border border-border/70 bg-card p-4"
            >
              <img
                src={item.image ?? FALLBACK_IMAGE}
                alt={item.name}
                loading="lazy"
                className="size-24 shrink-0 rounded-xl bg-muted object-cover"
              />
              <div className="min-w-0 flex-1">
                <Link
                  to="/product/$slug"
                  params={{ slug: item.slug }}
                  className="font-semibold hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  Size {item.size} · {item.color}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="grid size-8 place-items-center"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="grid size-8 place-items-center"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold">{inr(item.price * item.quantity)}</p>
                  {item.originalPrice > item.price && (
                    <p className="text-xs text-muted-foreground line-through">
                      {inr(item.originalPrice * item.quantity)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{totals.count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">MRP total</dt>
              <dd>{inr(totals.original)}</dd>
            </div>
            <div className="flex justify-between text-primary">
              <dt>Discount</dt>
              <dd>-{inr(totals.savings)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{inr(totals.subtotal)}</dd>
            </div>
          </dl>
          <Button className="mt-6 w-full" size="lg" asChild>
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button variant="ghost" className="mt-2 w-full" asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
