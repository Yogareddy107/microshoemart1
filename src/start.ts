import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Robust custom CSRF protection middleware that replaces createCsrfMiddleware
// to bypass bundling resolution bugs on edge/serverless runtimes.
const csrfMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  if (request && request.method === "POST") {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");

    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host && !originUrl.host.endsWith(host || "")) {
          return new Response("CSRF Validation Failed: Origin mismatch", { status: 403 });
        }
      } catch {
        return new Response("CSRF Validation Failed: Invalid origin", { status: 403 });
      }
    } else if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host !== host && !refererUrl.host.endsWith(host || "")) {
          return new Response("CSRF Validation Failed: Referer mismatch", { status: 403 });
        }
      } catch {
        return new Response("CSRF Validation Failed: Invalid referer", { status: 403 });
      }
    }
  }
  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
