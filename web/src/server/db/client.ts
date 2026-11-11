import "server-only";

import postgres from "postgres";

import { env } from "@/lib/env";

type Sql = ReturnType<typeof postgres>;

const globalForDb = globalThis as unknown as { __sql?: Sql };

export function hasDatabaseUrl(): boolean {
  return Boolean(env.DATABASE_URL);
}

/**
 * Singleton postgres.js (Supabase transaction pooler :6543).
 * - `prepare: false` bắt buộc với pooler transaction mode.
 * - Chỉ dùng cho SELECT. Không log URL/secret.
 */
export function getSql(): Sql {
  if (globalForDb.__sql) return globalForDb.__sql;
  if (!env.DATABASE_URL) {
    throw new Error("Thiếu DATABASE_URL (Supabase pooler URI). Xem .env.example");
  }
  globalForDb.__sql = postgres(env.DATABASE_URL, {
    prepare: false,
    ssl: "require",
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  return globalForDb.__sql;
}
