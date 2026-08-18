import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { inr, num } from "@/lib/format";
import { productsQuery, storeSettingsQuery } from "@/lib/queries";
import { FALLBACK_IMAGE } from "@/lib/types";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Men", to: "/men" },
  { label: "Women", to: "/women" },
  { label: "Kids", to: "/kids" },
  { label: "Offers", to: "/offers" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [term, setTerm] = useState("");
  const { data: products } = useQuery({ ...productsQuery, enabled: open });
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return (products ?? [])
      .filter((p) =>
        [p.name, p.brand, p.categories?.name ?? "", p.gender].join(" ").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [term, products]);

  useEffect(() => {
    if (!open) setTerm("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-4 p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-left font-display text-2xl">Search footwear</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!term.trim()) return;
            onOpenChange(false);
            void navigate({ to: "/shop", search: { q: term.trim() } });
          }}
        >
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            maxLength={60}
            placeholder="Try 'running', 'sandals', 'formal'…"
            aria-label="Search products"
          />
        </form>
        <div className="space-y-1">
          {results.map((p) => (
            <Link
              key={p.id}
              to="/product/$slug"
              params={{ slug: p.slug }}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
            >
              <img
                src={p.images?.[0] ?? FALLBACK_IMAGE}
                alt={p.name}
                loading="lazy"
                className="size-12 rounded-md bg-muted object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{p.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {p.categories?.name ?? "Footwear"} · {inr(num(p.discount_price))}
                </span>
              </span>
            </Link>
          ))}
          {term.trim() && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No footwear matched “{term}”.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SiteHeader() {
  const [compact, setCompact] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, wishlist } = useCart();
  const { data: settings } = useQuery(storeSettingsQuery);
  const cartCount = items.reduce((n, i) => n + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={`border-b border-border/70 bg-background/85 backdrop-blur-lg transition-all duration-300 ${
          compact ? "shadow-soft" : ""
        }`}
      >
        <div
          className={`container-page flex items-center justify-between gap-3 transition-all duration-300 ${
            compact ? "h-14" : "h-20"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <nav className="flex flex-col gap-1 p-6 pt-14">
                  <span className="eyebrow mb-3 text-muted-foreground">Browse</span>
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary"
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "bg-secondary text-primary" }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="group flex items-center gap-2.5">
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.store_name}
                  className={`transition-all duration-300 ${compact ? "size-8" : "size-10"} rounded-lg object-cover`}
                />
              ) : (
                <span
                  className={`grid place-items-center rounded-lg bg-ink text-ink-foreground transition-all duration-300 ${
                    compact ? "size-8 text-base" : "size-10 text-xl"
                  }`}
                  aria-hidden="true"
                >
                  👟
                </span>
              )}
              <span className="leading-none">
                <span
                  className={`block font-display transition-all duration-300 ${
                    compact ? "text-lg" : "text-xl sm:text-2xl"
                  }`}
                >
                  {settings?.store_name ?? "Micro Shoe Mart"}
                </span>
                {!compact && (
                  <span className="eyebrow hidden text-muted-foreground sm:block">
                    {settings?.tagline ?? "Step Into Your Style"}
                  </span>
                )}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary after:absolute after:bottom-1 after:left-3 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-[calc(100%-1.5rem)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
              <Link to="/wishlist" className="relative">
                <Heart className="size-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Cart">
              <Link to="/cart" className="relative">
                <ShoppingBag className="size-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <AnnouncementBar />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <span className="hidden">
        <X className="size-0" />
      </span>
    </header>
  );
}
