import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

import { env } from "@/lib/env";
import { CACHE_TAG_CAFES } from "@/server/db/cache-tags";

/**
 * POST /api/revalidate — gọi sau khi cập nhật dữ liệu trên Supabase.
 * Header: `Authorization: Bearer <REVALIDATE_SECRET>`.
 * - Mặc định (`?mode=soft`): đánh dấu cache cũ; lượt truy cập kế tiếp vẫn nhận bản cũ ngay, server làm mới ngầm.
 * - `?mode=hard`: xoá hẳn; lượt truy cập kế tiếp chờ query DB (~vài giây) nhưng chắc chắn thấy dữ liệu mới.
 */
function isAuthorized(header: string | null): boolean {
  const secret = env.REVALIDATE_SECRET;
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const given = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: NextRequest) {
  if (!env.REVALIDATE_SECRET) {
    return Response.json({ revalidated: false, error: "REVALIDATE_SECRET chưa cấu hình" }, { status: 503 });
  }
  if (!isAuthorized(request.headers.get("authorization"))) {
    return Response.json({ revalidated: false, error: "Unauthorized" }, { status: 401 });
  }

  const hard = request.nextUrl.searchParams.get("mode") === "hard";
  revalidateTag(CACHE_TAG_CAFES, hard ? { expire: 0 } : "max");

  return Response.json({ revalidated: true, tag: CACHE_TAG_CAFES, mode: hard ? "hard" : "soft", now: Date.now() });
}
