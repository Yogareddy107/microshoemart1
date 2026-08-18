import { createHmac, timingSafeEqual } from "crypto";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function secret(): string {
  const value = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_URL"];
  if (!value) throw new Error("Admin session secret unavailable");
  return `micro-shoe-mart-admin::${value}`;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function issueAdminToken(): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;

  const expected = Buffer.from(sign(expiresAt));
  const received = Buffer.from(signature);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export function requireAdmin(token: string | null | undefined): void {
  if (!isValidAdminToken(token)) {
    throw new Error("Admin session expired. Please enter the PIN again.");
  }
}
