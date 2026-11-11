import { connection } from "next/server";

import { aiConfig } from "@/ai";

/**
 * GET /api/health — dùng để kiểm tra sau khi deploy (uptime monitor, CI smoke test).
 * `connection()` buộc route chạy lúc request thay vì prerender lúc build.
 */
export async function GET() {
  await connection();

  return Response.json({
    status: "ok",
    time: new Date().toISOString(),
    features: { ai: aiConfig.enabled },
  });
}
