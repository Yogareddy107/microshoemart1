import type { CartItem, StoreSettings } from "./types";

export function inr(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return `₹${(Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export function num(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const original = items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, original, savings: Math.max(0, original - subtotal), count };
}

export function whatsappDigits(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function whatsappLink(raw: string | null | undefined, text?: string): string {
  const number = whatsappDigits(raw);
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export type CheckoutDetails = {
  customer_name: string;
  mobile: string;
  whatsapp: string;
  address: string;
  city: string;
  district: string;
  pincode: string;
};

export function buildOrderMessage(args: {
  orderCode: string;
  details: CheckoutDetails;
  items: CartItem[];
  settings?: Pick<StoreSettings, "store_name"> | null;
}): string {
  const { orderCode, details, items } = args;
  const totals = cartTotals(items);
  const storeName = args.settings?.store_name ?? "Micro Shoe Mart";

  const lines: string[] = [
    `*New Order - ${storeName}*`,
    `Order ID: ${orderCode}`,
    "",
    "*Customer Details*",
    `Name: ${details.customer_name}`,
    `Mobile: ${details.mobile}`,
    `WhatsApp: ${details.whatsapp}`,
    `Address: ${details.address}`,
    `City: ${details.city}`,
    `District: ${details.district}`,
    `Pincode: ${details.pincode}`,
    "",
    "*Order Items*",
  ];

  items.forEach((item, index) => {
    const discount =
      item.originalPrice > item.price
        ? ` (was ${inr(item.originalPrice)}, ${Math.round(
            ((item.originalPrice - item.price) / item.originalPrice) * 100,
          )}% off)`
        : "";
    lines.push(
      `${index + 1}. ${item.name}`,
      `   Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}`,
      `   Price: ${inr(item.price)}${discount} | Line total: ${inr(item.price * item.quantity)}`,
    );
  });

  lines.push(
    "",
    `Items: ${totals.count}`,
    `Subtotal (MRP): ${inr(totals.original)}`,
    `Discount savings: -${inr(totals.savings)}`,
    `*Total payable: ${inr(totals.subtotal)}*`,
    "",
    "Please confirm availability and delivery time.",
  );

  return lines.join("\n");
}

export function discountPercent(original: number, price: number): number {
  if (original <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}
