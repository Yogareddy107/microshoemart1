import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminSaveProduct,
  adminUploadImage,
} from "@/lib/admin.functions";
import { inr } from "@/lib/format";
import { FALLBACK_IMAGE, GENDERS, type ProductWithCategory } from "@/lib/types";
import { STOREFRONT_KEYS, fileToBase64, slugify, useAdminToken } from "@/lib/use-admin";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  brand: string;
  gender: (typeof GENDERS)[number];
  original_price: number;
  discount_percentage: number;
  sizes: string;
  colors: string;
  stock_quantity: number;
  images: string[];
  featured: boolean;
  is_new: boolean;
  is_sale: boolean;
  active: boolean;
};

const EMPTY: Draft = {
  name: "",
  slug: "",
  description: "",
  category_id: null,
  brand: "",
  gender: "unisex",
  original_price: 0,
  discount_percentage: 0,
  sizes: "",
  colors: "",
  stock_quantity: 0,
  images: [],
  featured: false,
  is_new: true,
  is_sale: false,
  active: true,
};

const listToArray = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

function ProductsPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  const listProducts = useServerFn(adminListProducts);
  const listCategories = useServerFn(adminListCategories);
  const saveProduct = useServerFn(adminSaveProduct);
  const deleteProduct = useServerFn(adminDeleteProduct);
  const uploadImage = useServerFn(adminUploadImage);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [search, setSearch] = useState("");

  const products = useQuery({
    queryKey: ["admin", "products"],
    enabled: Boolean(token),
    queryFn: () => listProducts({ data: { token: token! } }),
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    enabled: Boolean(token),
    queryFn: () => listCategories({ data: { token: token! } }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    STOREFRONT_KEYS.forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: [...key] });
    });
  };

  const saveMutation = useMutation({
    mutationFn: (input: Draft) =>
      saveProduct({
        data: {
          token: token!,
          ...(input.id ? { id: input.id } : {}),
          name: input.name,
          slug: input.slug || slugify(input.name),
          description: input.description,
          category_id: input.category_id,
          brand: input.brand,
          gender: input.gender,
          original_price: input.original_price,
          discount_percentage: input.discount_percentage,
          sizes: listToArray(input.sizes),
          colors: listToArray(input.colors),
          stock_quantity: input.stock_quantity,
          images: input.images,
          featured: input.featured,
          is_new: input.is_new,
          is_sale: input.is_sale,
          active: input.active,
        },
      }),
    onSuccess: () => {
      toast.success("Product saved");
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { token: token!, id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const urls: string[] = [];
      for (const file of files) {
        const dataBase64 = await fileToBase64(file);
        const result = await uploadImage({
          data: { token: token!, fileName: file.name, contentType: file.type, dataBase64 },
        });
        urls.push(result.url);
      }
      return urls;
    },
    onSuccess: (urls) => {
      setDraft((current) =>
        current ? { ...current, images: [...current.images, ...urls].slice(0, 10) } : current,
      );
      toast.success(`${urls.length} image(s) uploaded`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const openEdit = (product: ProductWithCategory) =>
    setDraft({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category_id: product.category_id,
      brand: product.brand,
      gender: (GENDERS as readonly string[]).includes(product.gender)
        ? (product.gender as (typeof GENDERS)[number])
        : "unisex",
      original_price: Number(product.original_price),
      discount_percentage: Number(product.discount_percentage),
      sizes: product.sizes.join(", "),
      colors: product.colors.join(", "),
      stock_quantity: product.stock_quantity,
      images: product.images,
      featured: product.featured,
      is_new: product.is_new,
      is_sale: product.is_sale,
      active: product.active,
    });

  const rows = (products.data ?? []).filter((product) =>
    search.trim()
      ? `${product.name} ${product.brand}`.toLowerCase().includes(search.trim().toLowerCase())
      : true,
  );

  const draftDiscountPrice = draft
    ? Math.round(draft.original_price * (1 - draft.discount_percentage / 100))
    : 0;

  const moveImage = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      if (!current) return current;
      const next = [...current.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return { ...current, images: next };
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage the catalogue, pricing, stock and imagery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-48"
            aria-label="Search products"
          />
          <Button onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="size-4" aria-hidden="true" />
            New product
          </Button>
        </div>
      </header>

      {products.isPending && <Skeleton className="h-64 w-full rounded-2xl" />}

      {!products.isPending && rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No products found. Add your first product to start selling.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((product) => (
          <article
            key={product.id}
            className="flex gap-4 rounded-2xl border border-border/70 bg-card p-4"
          >
            <img
              src={product.images[0] ?? FALLBACK_IMAGE}
              alt={product.name}
              className="size-24 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium">{product.name}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    product.active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {product.active ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {product.categories?.name ?? "Uncategorised"} · {product.gender}
              </p>
              <p className="mt-1 text-sm">
                {inr(Number(product.discount_price ?? product.original_price))}
                {Number(product.discount_percentage) > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground line-through">
                    {inr(Number(product.original_price))}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Stock {product.stock_quantity} · {product.sizes.length} sizes
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    saveMutation.mutate({
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      description: product.description,
                      category_id: product.category_id,
                      brand: product.brand,
                      gender: (GENDERS as readonly string[]).includes(product.gender)
                        ? (product.gender as (typeof GENDERS)[number])
                        : "unisex",
                      original_price: Number(product.original_price),
                      discount_percentage: Number(product.discount_percentage),
                      sizes: product.sizes.join(", "),
                      colors: product.colors.join(", "),
                      stock_quantity: product.stock_quantity,
                      images: product.images,
                      featured: product.featured,
                      is_new: product.is_new,
                      is_sale: product.is_sale,
                      active: !product.active,
                    })
                  }
                >
                  {product.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    if (window.confirm(`Delete ${product.name}?`)) {
                      deleteMutation.mutate(product.id);
                    }
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      name: event.target.value,
                      slug: draft.id ? draft.slug : slugify(event.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-slug">Slug</Label>
                <Input
                  id="p-slug"
                  value={draft.slug}
                  onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-brand">Brand</Label>
                <Input
                  id="p-brand"
                  value={draft.brand}
                  onChange={(event) => setDraft({ ...draft, brand: event.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  rows={4}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={draft.category_id ?? "none"}
                  onValueChange={(value) =>
                    setDraft({ ...draft, category_id: value === "none" ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Uncategorised</SelectItem>
                    {(categories.data ?? []).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select
                  value={draft.gender}
                  onValueChange={(value) =>
                    setDraft({ ...draft, gender: value as (typeof GENDERS)[number] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Original price (₹)</Label>
                <Input
                  id="p-price"
                  type="number"
                  min={0}
                  value={draft.original_price}
                  onChange={(event) =>
                    setDraft({ ...draft, original_price: Number(event.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-discount">Discount %</Label>
                <Input
                  id="p-discount"
                  type="number"
                  min={0}
                  max={95}
                  value={draft.discount_percentage}
                  onChange={(event) =>
                    setDraft({ ...draft, discount_percentage: Number(event.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Selling price: {inr(draftDiscountPrice)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-sizes">Sizes (comma separated)</Label>
                <Input
                  id="p-sizes"
                  value={draft.sizes}
                  onChange={(event) => setDraft({ ...draft, sizes: event.target.value })}
                  placeholder="6, 7, 8, 9, 10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-colors">Colors (comma separated)</Label>
                <Input
                  id="p-colors"
                  value={draft.colors}
                  onChange={(event) => setDraft({ ...draft, colors: event.target.value })}
                  placeholder="Black, Tan, White"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-stock">Stock quantity</Label>
                <Input
                  id="p-stock"
                  type="number"
                  min={0}
                  value={draft.stock_quantity}
                  onChange={(event) =>
                    setDraft({ ...draft, stock_quantity: Number(event.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                {(
                  [
                    ["active", "Active"],
                    ["featured", "Featured"],
                    ["is_new", "New arrival"],
                    ["is_sale", "On sale"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={draft[key]}
                      onCheckedChange={(checked) => setDraft({ ...draft, [key]: checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="p-images">Images</Label>
                <Input
                  id="p-images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadMutation.isPending}
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length) uploadMutation.mutate(files);
                    event.target.value = "";
                  }}
                />
                {uploadMutation.isPending && (
                  <p className="text-xs text-muted-foreground">Uploading images…</p>
                )}
                {draft.images.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No images yet — the first image is used as the primary product photo.
                  </p>
                ) : (
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {draft.images.map((url, index) => (
                      <li
                        key={`${url}-${index}`}
                        className="relative overflow-hidden rounded-xl border border-border"
                      >
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                        {index === 0 && (
                          <span className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                            <Star className="size-2.5" aria-hidden="true" />
                            Primary
                          </span>
                        )}
                        <div className="flex items-center justify-between bg-card p-1">
                          <button
                            type="button"
                            aria-label="Move image earlier"
                            className="rounded p-1 hover:bg-secondary"
                            onClick={() => moveImage(index, -1)}
                          >
                            <ArrowLeft className="size-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label="Move image later"
                            className="rounded p-1 hover:bg-secondary"
                            onClick={() => moveImage(index, 1)}
                          >
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label="Remove image"
                            className="rounded p-1 text-destructive hover:bg-secondary"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                images: draft.images.filter((_, i) => i !== index),
                              })
                            }
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending || !draft?.name}
              onClick={() => draft && saveMutation.mutate(draft)}
            >
              {saveMutation.isPending ? "Saving…" : "Save product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
