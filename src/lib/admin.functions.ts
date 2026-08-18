import { createServerFn } from "@tanstack/react-start";

import {
  advertisementInputSchema,
  categoryInputSchema,
  deleteSchema,
  orderStatusSchema,
  pinSchema,
  productInputSchema,
  settingsInputSchema,
  tokenSchema,
  uploadSchema,
} from "./schemas";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => pinSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { issueAdminToken } = await import("./admin-session.server");

    const { data: config, error } = await supabaseAdmin
      .from("admin_config")
      .select("pin")
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Constant-ish comparison; the PIN never reaches the browser bundle.
    const stored = config?.pin ?? "4321";
    if (!stored || stored.length !== data.pin.length || stored !== data.pin) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { ok: false as const, token: null };
    }

    return { ok: true as const, token: issueAdminToken() };
  });

export const adminVerify = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { isValidAdminToken } = await import("./admin-session.server");
    return { ok: isValidAdminToken(data.token) };
  });

export const adminOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const [products, orders] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("id, name, active, stock_quantity, discount_price, category_id, created_at"),
      supabaseAdmin
        .from("orders")
        .select("id, order_code, total, status, created_at, customer_name")
        .order("created_at", { ascending: false }),
    ]);

    if (products.error) throw new Error(products.error.message);
    if (orders.error) throw new Error(orders.error.message);

    const productRows = products.data ?? [];
    const orderRows = orders.data ?? [];
    const cancelled = new Set(["Cancelled"]);

    return {
      totalProducts: productRows.length,
      activeProducts: productRows.filter((p) => p.active).length,
      outOfStock: productRows.filter((p) => p.stock_quantity <= 0).length,
      totalOrders: orderRows.length,
      pendingOrders: orderRows.filter((o) => o.status === "New" || o.status === "WhatsApp Contacted")
        .length,
      sales: orderRows
        .filter((o) => !cancelled.has(o.status))
        .reduce((sum, o) => sum + Number(o.total), 0),
      recentOrders: orderRows.slice(0, 8),
      statusBreakdown: orderRows.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, {}),
      ordersByDay: orderRows.reduce<Record<string, { orders: number; sales: number }>>(
        (acc, o) => {
          const day = new Date(o.created_at).toISOString().slice(0, 10);
          const bucket = acc[day] ?? { orders: 0, sales: 0 };
          bucket.orders += 1;
          if (!cancelled.has(o.status)) bucket.sales += Number(o.total);
          acc[day] = bucket;
          return acc;
        },
        {},
      ),
    };
  });

export const adminListProducts = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("*, categories:category_id ( id, name, slug )")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminListCategories = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { data: rows, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminListAdvertisements = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { data: rows, error } = await supabaseAdmin
      .from("advertisements")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminListOrders = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminGetSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { data: row, error } = await supabaseAdmin
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => productInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { token, id, ...payload } = data;
    void token;

    if (id) {
      const { error } = await supabaseAdmin
        .from("products")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }

    const { data: row, error } = await supabaseAdmin
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => categoryInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { token, id, ...payload } = data;
    void token;

    if (id) {
      const { error } = await supabaseAdmin.from("categories").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveAdvertisement = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => advertisementInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { token, id, ...payload } = data;
    void token;

    if (id) {
      const { error } = await supabaseAdmin.from("advertisements").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("advertisements")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteAdvertisement = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { error } = await supabaseAdmin.from("advertisements").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => settingsInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    const { token, id, ...payload } = data;
    void token;

    const { error } = await supabaseAdmin
      .from("store_settings")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUploadImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireAdmin } = await import("./admin-session.server");
    requireAdmin(data.token);

    if (!/^image\/(png|jpe?g|webp|avif|gif)$/.test(data.contentType)) {
      throw new Error("Only PNG, JPG, WEBP, AVIF or GIF images can be uploaded.");
    }

    const safeName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-60);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bytes = Buffer.from(data.dataBase64, "base64");

    if (bytes.byteLength > 6 * 1024 * 1024) {
      throw new Error("Images must be smaller than 6 MB.");
    }

    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);

    return { url: `/api/public/media/${path}` };
  });
