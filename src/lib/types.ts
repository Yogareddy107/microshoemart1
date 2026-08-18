import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Advertisement = Database["public"]["Tables"]["advertisements"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type StoreSettings = Database["public"]["Tables"]["store_settings"]["Row"] & {
  winner_photo_url?: string | null;
  winner_name?: string | null;
  winner_description?: string | null;
  winner_show_popup?: boolean;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  size: string;
  color: string;
  quantity: number;
  price: number;
  originalPrice: number;
};

export type OrderItem = {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  originalPrice: number;
};

export const ORDER_STATUSES = [
  "New",
  "WhatsApp Contacted",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const GENDERS = ["men", "women", "kids", "unisex"] as const;

export const FALLBACK_IMAGE = "/images/shoes/mens-sneaker.jpg";
