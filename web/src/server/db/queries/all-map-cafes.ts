import "server-only";

import { cacheLife } from "next/cache";

import type { CafeFilters, SortKey } from "@/features/cafes/schema";

import { getSql } from "../client";
import type { CafeCard } from "../types";
import { buildWhere } from "./filters";
import { cardColumns, orderBy } from "./cafes";

/**
 * Lấy toàn bộ danh sách quán (không phân trang) cho màn hình bản đồ.
 * Chỉ tốn 1 query duy nhất thay vì N query lặp lại.
 */
export async function getAllMapCafes(
  filters: CafeFilters,
  sort: SortKey = filters.sort,
): Promise<CafeCard[]> {
  "use cache";
  cacheLife("hours");

  try {
    const sql = getSql();
    const where = buildWhere(filters);
    const items = await sql<CafeCard[]>`
      select ${cardColumns()} from v_cafe_directory c
      where c.lat is not null and c.lng is not null and ${where}
      order by ${orderBy(sort)}`;
    return [...items];
  } catch (err) {
    console.error("Lỗi khi truy vấn getAllMapCafes:", err);
    return [];
  }
}
