import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, MapPin, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoriesQuery, productsQuery, storeSettingsQuery } from "@/lib/queries";

const TITLE = "Micro Shoe Mart — Footwear Store in Koilkuntla, Nandyal";
const DESCRIPTION =
  "Shop men's, women's and kids' footwear at Micro Shoe Mart, RTC Busstand Road, Koilkuntla. Sports, casual, formal, sandals and slippers with live offers and easy WhatsApp ordering.";

export const Route = createFileRoute("/_store/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(storeSettingsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products, isPending } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: settings } = useQuery(storeSettingsQuery);

  const [showWinnerPopup, setShowWinnerPopup] = useState(false);

  useEffect(() => {
    if (settings?.winner_name && settings?.winner_show_popup) {
      const hasSeen = sessionStorage.getItem("msm-winner-popup-seen");
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setShowWinnerPopup(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [settings]);

  const closePopup = () => {
    setShowWinnerPopup(false);
    sessionStorage.setItem("msm-winner-popup-seen", "true");
  };

  const featured = (products ?? []).filter((p) => p.featured).slice(0, 8);
  const list = featured.length > 0 ? featured : (products ?? []).slice(0, 8);
  const newArrivals = (products ?? []).filter((p) => p.is_new).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src="/images/shoes/hero.jpg"
          alt="Curated footwear display at Micro Shoe Mart"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="relative container-page grid gap-8 py-20 sm:py-28 lg:grid-cols-2 lg:py-36">
          <div className="animate-rise">
            <p className="eyebrow text-primary-foreground/80">
              {settings?.address?.split(",")[0] ?? "RTC Busstand Road, Koilkuntla"}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              Step Into Your Style
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-foreground/80 sm:text-lg">
              Handpicked sneakers, sandals, formals and school shoes for the whole family — priced
              for Koilkuntla, delivered after a quick WhatsApp confirmation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/shop">
                  Shop now <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 bg-white/5">
                <Link to="/offers">View offers</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 text-sm">
              {[
                { k: "Styles", v: `${products?.length ?? 0}+` },
                { k: "Categories", v: `${categories?.length ?? 0}` },
                { k: "Ordering", v: "WhatsApp" },
              ].map((stat) => (
                <div key={stat.k}>
                  <dt className="eyebrow text-ink-foreground/60">{stat.k}</dt>
                  <dd className="mt-1 font-display text-2xl">{stat.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-secondary/60">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: BadgePercent, title: "Live store offers", text: "Discounts updated daily by the store team." },
            { icon: Truck, title: "Local delivery", text: settings?.delivery_info?.slice(0, 70) ?? "Fast delivery around Koilkuntla." },
            { icon: ShieldCheck, title: "Genuine pairs", text: "Every pair checked in store before dispatch." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Shop by category</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Find your fit</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/shop">
              Browse everything <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(categories ?? []).map((category) => (
            <Link
              key={category.id}
              to="/shop"
              search={{ category: category.slug }}
              className="group relative overflow-hidden rounded-2xl bg-muted"
            >
              <img
                src={category.image_url ?? "/images/shoes/mens-sneaker.jpg"}
                alt={category.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <span className="absolute inset-x-4 bottom-4 text-ink-foreground">
                <span className="block font-display text-xl">{category.name}</span>
                <span className="block text-xs opacity-80">{category.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-14 sm:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Handpicked</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Featured footwear</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/shop">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : list.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="container-page pb-16 sm:pb-24">
          <p className="eyebrow text-primary">Just landed</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">New arrivals</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page pb-20">
        <div className={`grid gap-6 ${settings?.winner_name ? "md:grid-cols-2" : "grid-cols-1"}`}>
          <div className="rounded-3xl bg-secondary p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <p className="eyebrow text-primary">Visit the store</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Try before you buy at our Koilkuntla showroom
              </h2>
              <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {settings?.address ??
                  "RTC Busstand Road, Koilkuntla, Nandyal District, Andhra Pradesh - 518134"}
              </p>
            </div>
            <Button className="mt-6 w-fit" asChild>
              <Link to="/contact">Get directions</Link>
            </Button>
          </div>

          {settings?.winner_name && (
            <div className="rounded-3xl bg-secondary/80 border border-primary/10 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="animate-bounce">🏆</span>
                  <p className="eyebrow text-primary">Weekly Giveaway Winner</p>
                </div>
                <h2 className="mt-2 font-display text-3xl">
                  Congratulations to {settings.winner_name}!
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {settings.winner_description ?? "Winner of our weekly Instagram Reels giveaway! Comment on our weekly reel for a chance to win a free pair of shoes or bag."}
                </p>
                {settings.winner_photo_url && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-border/50 max-w-[200px]">
                    <img
                      src={settings.winner_photo_url}
                      alt={`${settings.winner_name} winner`}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                )}
              </div>
              {settings.instagram_url && (
                <Button className="mt-6 w-fit" variant="outline" asChild>
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                    View Giveaway Reels
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={showWinnerPopup} onOpenChange={(open) => {
        if (!open) closePopup();
      }}>
        <DialogContent className="max-w-md overflow-hidden p-0 rounded-2xl border-none">
          {settings?.winner_photo_url && (
            <div className="relative aspect-[4/3] w-full bg-muted">
              <img
                src={settings.winner_photo_url}
                alt={`${settings.winner_name} giveaway winner`}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  🏆 Weekly Winner
                </span>
                <h3 className="mt-2 font-display text-2xl">{settings.winner_name}</h3>
              </div>
            </div>
          )}
          <div className="p-6">
            {!settings?.winner_photo_url && (
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <DialogTitle className="font-display text-2xl">Weekly Giveaway Winner</DialogTitle>
                </div>
              </DialogHeader>
            )}
            {settings?.winner_name && !settings?.winner_photo_url && (
              <h3 className="font-display text-xl mt-2">{settings.winner_name}</h3>
            )}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {settings?.winner_description ?? "Congratulations to our giveaway winner! Participate in our weekly Instagram Reels giveaways for a chance to win free footwear and bags."}
            </p>
            <div className="mt-6 flex gap-3">
              {settings?.instagram_url && (
                <Button className="flex-1" asChild>
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                    Join Next Giveaway
                  </a>
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={closePopup}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
