import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { storeSettingsQuery } from "@/lib/queries";

const TITLE = "About Micro Shoe Mart — Koilkuntla Footwear Store";
const DESCRIPTION =
  "Micro Shoe Mart on RTC Busstand Road, Koilkuntla has been fitting families with dependable footwear. Learn about the store, delivery and policies.";

export const Route = createFileRoute("/_store/about")({
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
  component: AboutPage,
});

function AboutPage() {
  const { data: settings } = useQuery(storeSettingsQuery);

  return (
    <div className="container-page max-w-3xl py-14 sm:py-20">
      <p className="eyebrow text-primary">About us</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">
        {settings?.store_name ?? "Micro Shoe Mart"}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {settings?.tagline ?? "Step Into Your Style"}
      </p>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
        <p>
          We are a family-run footwear store on RTC Busstand Road in Koilkuntla, Nandyal district.
          Every pair on this website is stocked in our showroom, so what you order is what we hand
          over — checked, packed and confirmed on WhatsApp before it leaves the shop.
        </p>
        <p>
          Our range covers school shoes and sneakers for kids, sports and formal shoes for men,
          sandals, flats and heels for women, plus everyday slippers for the whole household. Prices
          are set for local budgets and discounts are updated by the store team as new stock lands.
        </p>
        <img
          src="/images/shoes/hero.jpg"
          alt="Footwear on display inside Micro Shoe Mart"
          className="my-8 aspect-[16/9] w-full rounded-2xl object-cover"
          loading="lazy"
        />
        {settings?.delivery_info && (
          <section>
            <h2 className="font-display text-2xl">Delivery</h2>
            <p className="mt-2 text-muted-foreground">{settings.delivery_info}</p>
          </section>
        )}
        {settings?.policies && (
          <section>
            <h2 className="font-display text-2xl">Exchange &amp; policies</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{settings.policies}</p>
          </section>
        )}
      </div>
    </div>
  );
}
