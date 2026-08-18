import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { adminOverview } from "@/lib/admin.functions";
import { inr } from "@/lib/format";
import { useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const token = useAdminToken();
  const overview = useServerFn(adminOverview);

  const stats = useQuery({
    queryKey: ["admin", "overview"],
    enabled: Boolean(token),
    queryFn: () => overview({ data: { token: token! } }),
  });

  const data = stats.data;

  const cards = [
    { label: "Sales", value: data ? inr(data.sales) : "—" },
    { label: "Orders", value: data?.totalOrders ?? 0 },
    { label: "Pending orders", value: data?.pendingOrders ?? 0 },
    { label: "Total products", value: data?.totalProducts ?? 0 },
    { label: "Active products", value: data?.activeProducts ?? 0 },
    { label: "Out of stock", value: data?.outOfStock ?? 0 },
  ];

  const trend = Object.entries(data?.ordersByDay ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, bucket]) => ({
      day: new Date(day).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      orders: bucket.orders,
      sales: Math.round(bucket.sales),
    }));

  const statuses = Object.entries(data?.statusBreakdown ?? {}).map(([status, count]) => ({
    status,
    count,
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live performance of your store — sales, orders and inventory health.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border/70 bg-card p-5">
            <p className="eyebrow text-muted-foreground">{card.label}</p>
            {stats.isPending ? (
              <Skeleton className="mt-3 h-8 w-20" />
            ) : (
              <p className="mt-2 font-display text-3xl">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-3">
          <h2 className="font-display text-xl">Revenue trend</h2>
          <p className="text-xs text-muted-foreground">Last 14 days of order value</p>
          <div className="mt-4 h-64">
            {stats.isPending ? (
              <Skeleton className="size-full" />
            ) : trend.length === 0 ? (
              <EmptyState label="No orders yet — revenue will appear here." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} width={60} />
                  <Tooltip
                    formatter={(value: number, name) =>
                      name === "sales" ? inr(value) : String(value)
                    }
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#salesFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 lg:col-span-2">
          <h2 className="font-display text-xl">Order status</h2>
          <p className="text-xs text-muted-foreground">Orders grouped by fulfilment stage</p>
          <div className="mt-4 h-64">
            {stats.isPending ? (
              <Skeleton className="size-full" />
            ) : statuses.length === 0 ? (
              <EmptyState label="No orders to break down yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statuses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="status" width={110} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="font-display text-xl">Recent orders</h2>
        {stats.isPending ? (
          <Skeleton className="mt-4 h-24 w-full" />
        ) : (data?.recentOrders ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No orders received yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70 text-sm">
            {(data?.recentOrders ?? []).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-2">
                <span className="font-medium">{order.order_code}</span>
                <span className="truncate text-muted-foreground">{order.customer_name}</span>
                <span>{inr(Number(order.total))}</span>
                <span className="text-xs text-muted-foreground">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex size-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
      {label}
    </div>
  );
}
