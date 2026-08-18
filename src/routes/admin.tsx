import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgePercent,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  ReceiptText,
  Settings,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAdminToken } from "@/lib/admin-client";
import { useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Store Dashboard — Micro Shoe Mart" },
      {
        name: "description",
        content: "Internal dashboard for managing the Micro Shoe Mart store.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: BadgePercent },
  { to: "/admin/orders", label: "Orders", icon: ReceiptText },
  { to: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
  { to: "/admin/settings", label: "Store Settings", icon: Settings },
] as const;

function AdminLayout() {
  const token = useAdminToken();
  const navigate = useNavigate();

  if (!token) return null;

  return (
    <div className="min-h-screen bg-secondary/40 lg:flex">
      <aside className="border-b border-border bg-background lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="container-page flex items-center gap-2 py-4 lg:px-6">
          <Store className="size-5 text-primary" aria-hidden="true" />
          <p className="font-display text-xl">Micro Shoe Mart</p>
        </div>
        <nav className="container-page flex gap-1 overflow-x-auto pb-3 lg:flex-col lg:px-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: Boolean((item as { exact?: boolean }).exact) }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="container-page hidden gap-2 pb-6 lg:flex lg:flex-col lg:px-4">
          <Button variant="ghost" className="justify-start" asChild>
            <Link to="/">View storefront</Link>
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              clearAdminToken();
              void navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex items-center justify-end gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Storefront</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAdminToken();
              void navigate({ to: "/" });
            }}
          >
            Logout
          </Button>
        </div>
        <div className="container-page py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
