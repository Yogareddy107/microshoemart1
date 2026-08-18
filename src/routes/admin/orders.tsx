import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { inr } from "@/lib/format";
import { ORDER_STATUSES, type OrderItem, type OrderStatus } from "@/lib/types";
import { useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  const listOrders = useServerFn(adminListOrders);
  const updateStatus = useServerFn(adminUpdateOrderStatus);

  const orders = useQuery({
    queryKey: ["admin", "orders"],
    enabled: Boolean(token),
    queryFn: () => listOrders({ data: { token: token! } }),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: OrderStatus }) =>
      updateStatus({ data: { token: token!, ...input } }),
    onSuccess: () => {
      toast.success("Order status updated");
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track every WhatsApp order from placement to delivery.
        </p>
      </header>

      {orders.isPending && <Skeleton className="h-40 w-full rounded-2xl" />}

      {!orders.isPending && (orders.data ?? []).length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders yet. Orders placed through WhatsApp checkout appear here.
        </p>
      )}

      <div className="space-y-4">
        {(orders.data ?? []).map((order) => {
          const items = (order.items as unknown as OrderItem[]) ?? [];
          return (
            <article key={order.id} className="rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl">{order.order_code}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm font-medium">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.mobile} · WhatsApp {order.whatsapp}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.address}, {order.city}, {order.district} — {order.pincode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl">{inr(Number(order.total))}</p>
                  <p className="text-xs text-muted-foreground">
                    Saved {inr(Number(order.savings))}
                  </p>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      statusMutation.mutate({ id: order.id, status: value as OrderStatus })
                    }
                  >
                    <SelectTrigger className="mt-3 w-[190px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-border/70 border-t border-border/70 text-sm">
                {items.map((item, index) => (
                  <li key={`${order.id}-${index}`} className="flex justify-between gap-3 py-2">
                    <span>
                      {item.name}
                      <span className="text-muted-foreground">
                        {" "}
                        · {item.size || "—"} / {item.color || "—"} × {item.quantity}
                      </span>
                    </span>
                    <span>{inr(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
