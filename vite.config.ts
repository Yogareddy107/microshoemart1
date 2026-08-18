// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig as baseDefineConfig } from "@lovable.dev/vite-tanstack-config";

const baseConfig = baseDefineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      tsconfigPaths: true,
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
        "@tanstack/react-router",
        "@tanstack/react-start",
        "@tanstack/start-client-core",
        "@tanstack/start-server-core",
        "@tanstack/history"
      ]
    },
  },
});

export default async (env: any) => {
  const config = await baseConfig(env);
  if (config.plugins) {
    config.plugins = config.plugins.filter((p: any) => {
      if (p && typeof p === "object" && "name" in p && p.name === "vite-tsconfig-paths") {
        return false;
      }
      return true;
    });
  }
  return config;
};

