import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent, inr, num } from "@/lib/format";
import { FALLBACK_IMAGE, type ProductWithCategory } from "@/lib/types";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="skeleton-block aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton-block h-3 w-20" />
        <div className="skeleton-block h-4 w-3/4" />
        <div className="skeleton-block h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const original = num(product.original_price);
  const price = num(product.discount_price) || original;
  const off = discountPercent(original, price);
  const inStock = product.stock_quantity > 0;
  const wished = isWishlisted(product.id);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden bg-muted"
        aria-label={product.name}
      >
        <img
          src={product.images?.[0] ?? FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.is_new && (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-foreground">
              New
            </span>
          )}
          {product.is_sale && off > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
              Sale
            </span>
          )}
          {off > 0 && (
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-primary">
              {off}% OFF
            </span>
          )}
        </div>
        {!inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-foreground">
            Out of stock
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
        }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-soft transition-all hover:scale-110 hover:text-primary"
      >
        <Heart className={`size-4 ${wished ? "fill-primary text-primary" : ""}`} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow text-muted-foreground">
          {product.categories?.name ?? "Footwear"}
          {product.brand ? ` · ${product.brand}` : ""}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug">
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold">{inr(price)}</span>
          {off > 0 && (
            <span className="text-xs text-muted-foreground line-through">{inr(original)}</span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {inStock ? `In stock · ${product.stock_quantity} pairs` : "Currently unavailable"}
        </p>

        <Button
          size="sm"
          className="mt-4 w-full"
          disabled={!inStock}
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] ?? null,
              size: product.sizes?.[0] ?? "Free",
              color: product.colors?.[0] ?? "As shown",
              quantity: 1,
              price,
              originalPrice: original,
            });
            toast.success(`${product.name} added to cart`);
          }}
        >
          <ShoppingBag className="size-4" />
          {inStock ? "Add to cart" : "Sold out"}
        </Button>
      </div>
    </article>
  );
}
