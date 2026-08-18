import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Advertisement, Category, ProductWithCategory, StoreSettings } from "./types";

const PRODUCT_SELECT =
  "*, categories:category_id ( id, name, slug )";

export const storeSettingsQuery = queryOptions({
  queryKey: ["store-settings"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<StoreSettings | null> => {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },
});

export const advertisementsQuery = queryOptions({
  queryKey: ["advertisements"],
  staleTime: 60 * 1000,
  queryFn: async (): Promise<Advertisement[]> => {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  staleTime: 60 * 1000,
  queryFn: async (): Promise<ProductWithCategory[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ProductWithCategory[];
  },
});

export function productQuery(slug: string) {
  return queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<ProductWithCategory | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as unknown as ProductWithCategory | null;
    },
  });
}
