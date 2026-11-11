import { connection } from "next/server";

import { aiConfig } from "@/ai";
import { getSql, hasDatabaseUrl } from "@/server/db/client";

/**
 * GET /api/health — dùng để kiểm tra sau khi deploy (uptime monitor, CI smoke test).
 * `connection()` buộc route chạy lúc request thay vì prerender lúc build.
 */
export async function GET() {
  await connection();

  let dbStatus: { configured: boolean; connected: boolean; count?: number; error?: string } = {
    configured: hasDatabaseUrl(),
    connected: false,
  };

  if (hasDatabaseUrl()) {
    try {
      const sql = getSql();
      const [row] = await sql<{ count: number }[]>`select count(*)::int as count from v_cafe_directory`;
      dbStatus = {
        configured: true,
        connected: true,
        count: row?.count ?? 0,
      };
    } catch (err) {
      dbStatus = {
        configured: true,
        connected: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    database: dbStatus,
    features: { ai: aiConfig.enabled },
  });
}
