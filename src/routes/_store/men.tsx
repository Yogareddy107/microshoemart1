import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/ShopBrowser";

const TITLE = "Men's Footwear — Micro Shoe Mart, Koilkuntla";
const DESCRIPTION =
  "Men's sneakers, sports shoes, formal shoes, sandals and slippers at Micro Shoe Mart. Discounted prices with WhatsApp ordering.";

export const Route = createFileRoute("/_store/men")({
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
      heading="Men's footwear"
      intro="Everyday sneakers, office formals, sports runners and comfortable sandals for men."
      lockedGender="men"
    />
  ),
});
