import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, cartTotals, inr, whatsappLink, type CheckoutDetails } from "@/lib/format";
import { storeSettingsQuery } from "@/lib/queries";
import { detailsSchema } from "@/lib/schemas";
import { placeOrder } from "@/lib/store.functions";

export const Route = createFileRoute("/_store/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Micro Shoe Mart" },
      { name: "description", content: "Share your delivery details and place the order on WhatsApp." },
      { property: "og:title", content: "Checkout — Micro Shoe Mart" },
      {
        property: "og:description",
        content: "Share your delivery details and place the order on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const EMPTY: CheckoutDetails = {
  customer_name: "",
  mobile: "",
  whatsapp: "",
  address: "",
  city: "Koilkuntla",
  district: "Nandyal",
  pincode: "518134",
};

function CheckoutPage() {
  const { items, clearCart, ready } = useCart();
  const { data: settings } = useQuery(storeSettingsQuery);
  const submit = useServerFn(placeOrder);
  const navigate = useNavigate();
  const [details, setDetails] = useState<CheckoutDetails>(EMPTY);
  const [busy, setBusy] = useState(false);
  const totals = cartTotals(items);

  if (ready && items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-4xl">Nothing to check out</h1>
        <Button className="mt-6" asChild>
          <Link to="/shop">Browse footwear</Link>
        </Button>
      </div>
    );
  }

  const field = (key: keyof CheckoutDetails) => ({
    value: details[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDetails((d) => ({ ...d, [key]: e.target.value })),
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = detailsSchema.safeParse(details);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }

    setBusy(true);
    try {
      const result = await submit({
        data: {
          details: parsed.data,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        },
      });

      const message = buildOrderMessage({
        orderCode: result.order.order_code,
        details: parsed.data,
        items,
        settings: settings ?? null,
      });

      window.open(whatsappLink(settings?.whatsapp_number, message), "_blank", "noopener");
      clearCart();
      void navigate({ to: "/order/$code", params: { code: result.order.order_code } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We confirm every order on WhatsApp — no online payment needed.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" maxLength={80} required {...field("customer_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input id="mobile" inputMode="tel" maxLength={15} required {...field("mobile")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input id="whatsapp" inputMode="tel" maxLength={15} required {...field("whatsapp")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Delivery address</Label>
            <Textarea id="address" rows={3} maxLength={400} required {...field("address")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">City / village</Label>
            <Input id="city" maxLength={80} required {...field("city")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="district">District</Label>
            <Input id="district" maxLength={80} required {...field("district")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" inputMode="numeric" maxLength={6} required {...field("pincode")} />
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-2xl">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Size {item.size} · {item.color} · × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 font-medium">{inr(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">MRP total</dt>
              <dd>{inr(totals.original)}</dd>
            </div>
            <div className="flex justify-between text-primary">
              <dt>Discount</dt>
              <dd>-{inr(totals.savings)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Total payable</dt>
              <dd>{inr(totals.subtotal)}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
            <MessageCircle className="size-4" />
            {busy ? "Placing order…" : "Order via WhatsApp"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
