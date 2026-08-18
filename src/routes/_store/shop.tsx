import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/ShopBrowser";

const TITLE = "Shop All Footwear — Micro Shoe Mart";
const DESCRIPTION =
  "Browse the full Micro Shoe Mart catalogue: sneakers, sports shoes, formals, sandals and slippers with filters for size, price, gender and discount.";

export const Route = createFileRoute("/_store/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    ...(typeof search["q"] === "string" ? { q: search["q"].slice(0, 60) } : {}),
    ...(typeof search["category"] === "string"
      ? { category: search["category"].slice(0, 60) }
      : {}),
  }),
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
  component: ShopPage,
});

function ShopPage() {
  const { q, category } = Route.useSearch();
  return (
    <ShopBrowser
      key={`${q ?? ""}-${category ?? ""}`}
      heading="Every pair, one place"
      intro="Filter by category, size, price, gender or discount to find exactly the footwear you need."
      initialQuery={q ?? ""}
      initialCategory={category ?? "all"}
    />
  );
}
