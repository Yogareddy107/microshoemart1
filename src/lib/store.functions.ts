import { createServerFn } from "@tanstack/react-start";

import { orderCodeSchema, placeOrderSchema } from "./schemas";

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => placeOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = [...new Set(data.items.map((i) => i.productId))];
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, images, original_price, discount_price, active")
      .in("id", ids);

    if (productError) throw new Error(productError.message);

    const byId = new Map((products ?? []).map((p) => [p.id, p]));

    const items = data.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product || !product.active) {
        throw new Error("One of the products in your cart is no longer available.");
      }
      return {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] ?? null,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: Number(product.discount_price ?? product.original_price),
        originalPrice: Number(product.original_price),
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const original = items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        ...data.details,
        items,
        subtotal,
        savings: Math.max(0, original - subtotal),
        total: subtotal,
      })
      .select("id, order_code, created_at, total, savings, subtotal")
      .single();

    if (error) throw new Error(error.message);

    return { order, items };
  });

export const getOrderByCode = createServerFn({ method: "GET" })
  .validator((input: unknown) => orderCodeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "order_code, customer_name, city, district, items, subtotal, savings, total, status, created_at",
      )
      .eq("order_code", data.code)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return order;
  });
