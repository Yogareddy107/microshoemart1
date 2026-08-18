import { z } from "zod";

export const detailsSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{10,15}$/, "Enter a valid mobile number"),
  whatsapp: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{10,15}$/, "Enter a valid WhatsApp number"),
  address: z.string().trim().min(6).max(400),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
});

export const placeOrderSchema = z.object({
  details: detailsSchema,
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        size: z.string().trim().max(20),
        color: z.string().trim().max(40),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

export const orderCodeSchema = z.object({ code: z.string().trim().min(4).max(32) });

export const tokenSchema = z.object({ token: z.string().min(10).max(300) });

export const pinSchema = z.object({
  pin: z
    .string()
    .trim()
    .regex(/^[0-9]{4,8}$/, "PIN must be 4-8 digits"),
});

export const productInputSchema = tokenSchema.extend({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(90),
  description: z.string().trim().max(2000).default(""),
  category_id: z.string().uuid().nullable(),
  brand: z.string().trim().max(80).default(""),
  gender: z.enum(["men", "women", "kids", "unisex"]),
  original_price: z.number().min(0).max(1000000),
  discount_percentage: z.number().min(0).max(95),
  sizes: z.array(z.string().trim().min(1).max(10)).max(30),
  colors: z.array(z.string().trim().min(1).max(30)).max(30),
  stock_quantity: z.number().int().min(0).max(100000),
  images: z.array(z.string().trim().min(1).max(500)).max(10),
  featured: z.boolean(),
  is_new: z.boolean(),
  is_sale: z.boolean(),
  active: z.boolean(),
});

export const categoryInputSchema = tokenSchema.extend({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(90),
  description: z.string().trim().max(400).default(""),
  image_url: z.string().trim().max(500).nullable(),
  display_order: z.number().int().min(0).max(999),
  active: z.boolean(),
});

export const advertisementInputSchema = tokenSchema.extend({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(80),
  message: z.string().trim().min(2).max(200),
  link: z.string().trim().max(300).nullable(),
  starts_at: z.string().trim().max(20).nullable(),
  ends_at: z.string().trim().max(20).nullable(),
  active: z.boolean(),
  display_order: z.number().int().min(0).max(999),
});

export const settingsInputSchema = tokenSchema.extend({
  id: z.string().uuid(),
  store_name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(120),
  logo_url: z.string().trim().max(500).nullable(),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{10,15}$/, "Enter a valid WhatsApp number"),
  instagram_url: z.string().trim().max(300),
  address: z.string().trim().max(400),
  phone: z.string().trim().max(30),
  email: z.string().trim().max(120),
  opening_hours: z.string().trim().max(200),
  delivery_info: z.string().trim().max(1000),
  policies: z.string().trim().max(2000),
  winner_photo_url: z.string().trim().max(500).nullable().optional(),
  winner_name: z.string().trim().max(80).nullable().optional(),
  winner_description: z.string().trim().max(1000).nullable().optional(),
  winner_show_popup: z.boolean().optional(),
});

export const orderStatusSchema = tokenSchema.extend({
  id: z.string().uuid(),
  status: z.enum([
    "New",
    "WhatsApp Contacted",
    "Confirmed",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
});

export const deleteSchema = tokenSchema.extend({ id: z.string().uuid() });

export const toggleSchema = tokenSchema.extend({
  id: z.string().uuid(),
  active: z.boolean(),
});

export const uploadSchema = tokenSchema.extend({
  fileName: z.string().trim().min(1).max(120),
  contentType: z.string().trim().min(3).max(80),
  dataBase64: z.string().min(10).max(9_000_000),
});
