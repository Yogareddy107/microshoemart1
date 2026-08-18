import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/ShopBrowser";

const TITLE = "Women's Footwear — Micro Shoe Mart, Koilkuntla";
const DESCRIPTION =
  "Women's flats, heels, sneakers, sandals and slippers at Micro Shoe Mart, Koilkuntla. Live discounts and easy WhatsApp ordering.";

export const Route = createFileRoute("/_store/women")({
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
      heading="Women's footwear"
      intro="Festive heels, cushioned flats, walking sneakers and daily-wear sandals for women."
      lockedGender="women"
    />
  ),
});
