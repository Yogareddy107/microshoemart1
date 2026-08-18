import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/ShopBrowser";

const TITLE = "Offers & Discounts — Micro Shoe Mart";
const DESCRIPTION =
  "Current footwear offers at Micro Shoe Mart, Koilkuntla. Discounted sneakers, sandals, formals and school shoes updated by the store team.";

export const Route = createFileRoute("/_store/offers")({
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
  component: () => (
    <ShopBrowser
      heading="Today's offers"
      intro="Every pair here is discounted right now. Sort by highest discount to grab the best deal."
      offersOnly
    />
  ),
});
