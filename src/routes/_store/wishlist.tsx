import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_store/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Micro Shoe Mart" },
      { name: "description", content: "Footwear you saved for later at Micro Shoe Mart." },
      { property: "og:title", content: "Your Wishlist — Micro Shoe Mart" },
      { property: "og:description", content: "Footwear you saved for later at Micro Shoe Mart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, ready } = useCart();
  const { data: products, isPending } = useQuery(productsQuery);
  const saved = (products ?? []).filter((p) => wishlist.includes(p.id));

  return (
    <div className="container-page py-14 sm:py-20">
      <p className="eyebrow text-primary">Saved pairs</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">Your wishlist</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {isPending || !ready
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : saved.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {ready && !isPending && saved.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Nothing saved yet.</p>
          <Button className="mt-4" asChild>
            <Link to="/shop">Browse footwear</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
