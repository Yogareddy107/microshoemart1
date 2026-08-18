import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent, inr, num } from "@/lib/format";
import { productQuery, productsQuery } from "@/lib/queries";
import { FALLBACK_IMAGE } from "@/lib/types";

export const Route = createFileRoute("/_store/product/$slug")({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
  },
  head: ({ params }) => {
    const title = `${params.slug.replace(/-/g, " ")} — Micro Shoe Mart`;
    const description = `Buy this pair at Micro Shoe Mart, Koilkuntla. Sizes, colours, live stock and discounted pricing with WhatsApp ordering.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isPending } = useQuery(productQuery(slug));
  const { data: products } = useQuery(productsQuery);
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const navigate = useNavigate();

  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isPending) {
    return (
      <div className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <div className="skeleton-block aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton-block h-4 w-24" />
          <div className="skeleton-block h-10 w-3/4" />
          <div className="skeleton-block h-6 w-32" />
          <div className="skeleton-block h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl">This pair is no longer listed</h1>
        <Button className="mt-6" asChild>
          <Link to="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  const original = num(product.original_price);
  const price = num(product.discount_price) || original;
  const off = discountPercent(original, price);
  const images = product.images?.length ? product.images : [FALLBACK_IMAGE];
  const inStock = product.stock_quantity > 0;
  const chosenSize = size ?? product.sizes?.[0] ?? "Free";
  const chosenColor = color ?? product.colors?.[0] ?? "As shown";
  const related = (products ?? [])
    .filter((p) => p.id !== product.id && p.category_id === product.category_id)
    .slice(0, 4);

  const add = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: images[0] ?? null,
      size: chosenSize,
      color: chosenColor,
      quantity,
      price,
      originalPrice: original,
    });
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-1.5">/</span>
        <Link to="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span className="px-1.5">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl bg-muted">
            <img
              src={images[imageIndex] ?? images[0]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto hide-scrollbar">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    i === imageIndex ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow text-primary">
            {product.categories?.name ?? "Footwear"}
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold">{inr(price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">{inr(original)}</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {off}% OFF
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {inStock ? `In stock — ${product.stock_quantity} pairs available` : "Out of stock"} ·{" "}
            {product.gender === "unisex" ? "Unisex" : `For ${product.gender}`}
          </p>

          {product.description && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/85">
              {product.description}
            </p>
          )}

          {(product.sizes ?? []).length > 0 && (
            <div className="mt-7">
              <p className="text-sm font-semibold">Select size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-12 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      chosenSize === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(product.colors ?? []).length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold">Select colour</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      chosenColor === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <p className="text-sm font-semibold">Quantity</p>
            <div className="flex items-center rounded-lg border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="grid size-9 place-items-center"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="grid size-9 place-items-center"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              disabled={!inStock}
              onClick={() => {
                add();
                toast.success("Added to cart");
              }}
            >
              <ShoppingBag className="size-4" /> Add to cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={!inStock}
              onClick={() => {
                add();
                void navigate({ to: "/checkout" });
              }}
            >
              Buy now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(isWishlisted(product.id) ? "Removed from wishlist" : "Saved");
              }}
            >
              <Heart
                className={`size-4 ${isWishlisted(product.id) ? "fill-primary text-primary" : ""}`}
              />
              Wishlist
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
