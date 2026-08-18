import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { whatsappLink } from "@/lib/format";
import { storeSettingsQuery } from "@/lib/queries";
import { getOrderByCode } from "@/lib/store.functions";
import type { OrderItem } from "@/lib/types";

export const Route = createFileRoute("/_store/order/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.code} — Micro Shoe Mart` },
      { name: "description", content: "Your Micro Shoe Mart order summary and WhatsApp follow-up." },
      { property: "og:title", content: `Order ${params.code} — Micro Shoe Mart` },
      { property: "og:description", content: "Your Micro Shoe Mart order summary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { code } = Route.useParams();
  const fetchOrder = useServerFn(getOrderByCode);
  const { data: settings } = useQuery(storeSettingsQuery);
  const { data: order, isPending } = useQuery({
    queryKey: ["order", code],
    queryFn: () => fetchOrder({ data: { code } }),
  });

  if (isPending) {
    return (
      <div className="container-page max-w-2xl space-y-4 py-20">
        <div className="skeleton-block h-8 w-64" />
        <div className="skeleton-block h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-4xl">Order not found</h1>
        <Button className="mt-6" asChild>
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const items = (order.items ?? []) as unknown as OrderItem[];

  return (
    <div className="container-page max-w-2xl py-16">
      <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-display text-4xl">Order placed</h1>
      <p className="mt-2 text-muted-foreground">
        Order ID <span className="font-semibold text-foreground">{order.order_code}</span> — our team
        will confirm availability on WhatsApp shortly.
      </p>

      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="font-display text-2xl">Summary</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="flex justify-between gap-3">
              <span>
                <span className="block font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  Size {item.size} · {item.color} · × {item.quantity}
                </span>
              </span>
              <span className="font-medium">{inr(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-primary">
            <dt>You saved</dt>
            <dd>{inr(Number(order.savings))}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{inr(Number(order.total))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{order.status}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <a
            href={whatsappLink(
              settings?.whatsapp_number,
              `Hi, I placed order ${order.order_code} on your website.`,
            )}
            target="_blank"
            rel="noreferrer noopener"
          >
            <MessageCircle className="size-4" /> Continue on WhatsApp
          </a>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
