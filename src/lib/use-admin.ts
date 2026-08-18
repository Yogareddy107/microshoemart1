import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getAdminToken } from "./admin-client";

/** Reads the admin PIN session token, redirecting to the storefront when absent. */
export function useAdminToken(): string | null {
  const [token] = useState<string | null>(() => getAdminToken());
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      void navigate({ to: "/" });
    }
  }, [token, navigate]);

  return token;
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error("Failed to parse base64 data"));
      }
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export const STOREFRONT_KEYS = [
  ["store-settings"],
  ["advertisements"],
  ["categories"],
  ["products"],
] as const;
