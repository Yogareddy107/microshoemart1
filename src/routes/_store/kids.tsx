import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/ShopBrowser";

const TITLE = "Kids' Footwear & School Shoes — Micro Shoe Mart";
const DESCRIPTION =
  "School shoes, sneakers, sandals and slippers for kids at Micro Shoe Mart, Koilkuntla. Durable pairs at discounted prices.";

export const Route = createFileRoute("/_store/kids")({
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
      heading="Kids' footwear"
      intro="School shoes that survive the playground, plus fun sneakers and sandals for weekends."
      lockedGender="kids"
    />
  ),
});
