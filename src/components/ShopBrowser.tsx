import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { discountPercent, num } from "@/lib/format";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { GENDERS, type ProductWithCategory } from "@/lib/types";

type Sort = "newest" | "price-asc" | "price-desc" | "discount";

export function ShopBrowser({
  heading,
  intro,
  initialQuery = "",
  initialCategory = "all",
  lockedGender,
  offersOnly = false,
}: {
  heading: string;
  intro: string;
  initialQuery?: string;
  initialCategory?: string;
  lockedGender?: (typeof GENDERS)[number];
  offersOnly?: boolean;
}) {
  const { data: products, isPending } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);

  const [term, setTerm] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [gender, setGender] = useState<string>(lockedGender ?? "all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return [...set].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    const cap = Number(maxPrice);
    const minOff = minDiscount === "all" ? 0 : Number(minDiscount);

    const list = (products ?? []).filter((p: ProductWithCategory) => {
      const price = num(p.discount_price) || num(p.original_price);
      const off = discountPercent(num(p.original_price), price);
      if (q && !`${p.name} ${p.brand} ${p.categories?.name ?? ""}`.toLowerCase().includes(q))
        return false;
      if (category !== "all" && p.categories?.slug !== category) return false;
      if (gender !== "all" && p.gender !== gender && p.gender !== "unisex") return false;
      if (size !== "all" && !(p.sizes ?? []).includes(size)) return false;
      if (maxPrice && Number.isFinite(cap) && cap > 0 && price > cap) return false;
      if (minOff > 0 && off < minOff) return false;
      if (offersOnly && off <= 0) return false;
      if (inStockOnly && p.stock_quantity <= 0) return false;
      return true;
    });

    const priceOf = (p: ProductWithCategory) => num(p.discount_price) || num(p.original_price);
    const offOf = (p: ProductWithCategory) => discountPercent(num(p.original_price), priceOf(p));

    return [...list].sort((a, b) => {
      if (sort === "price-asc") return priceOf(a) - priceOf(b);
      if (sort === "price-desc") return priceOf(b) - priceOf(a);
      if (sort === "discount") return offOf(b) - offOf(a);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    products,
    term,
    category,
    gender,
    size,
    maxPrice,
    minDiscount,
    inStockOnly,
    offersOnly,
    sort,
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow text-primary">Micro Shoe Mart</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{heading}</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">{intro}</p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          maxLength={60}
          placeholder="Search by name, brand or category"
          aria-label="Search products"
          className="w-full sm:max-w-xs"
        />
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-[190px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="discount">Highest discount</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">
          {isPending ? "Loading…" : `${filtered.length} styles`}
        </span>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!lockedGender && (
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g[0]?.toUpperCase()}
                      {g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Size</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sizes</SelectItem>
                {sizes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxPrice">Max price (₹)</Label>
            <Input
              id="maxPrice"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="e.g. 2000"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Minimum discount</Label>
            <Select value={minDiscount} onValueChange={setMinDiscount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="10">10% and above</SelectItem>
                <SelectItem value="20">20% and above</SelectItem>
                <SelectItem value="30">30% and above</SelectItem>
                <SelectItem value="40">40% and above</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="inStock"
              checked={inStockOnly}
              onCheckedChange={(v) => setInStockOnly(v === true)}
            />
            <Label htmlFor="inStock">Only show pairs available in store</Label>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {isPending
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {!isPending && filtered.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          No footwear matches these filters yet. Try widening your search.
        </p>
      )}
    </div>
  );
}
