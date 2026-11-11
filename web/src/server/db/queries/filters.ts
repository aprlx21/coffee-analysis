import "server-only";

import type { CafeFilters } from "@/features/cafes/schema";
import { AMENITY_KEYS } from "@/features/cafes/schema";

import { getSql } from "../client";

const AMENITY_SET = new Set<string>(AMENITY_KEYS);

/** Đoạn WHERE tham số hoá (postgres.js fragment) cho `v_cafe_directory` alias `c`. */
export function buildWhere(f: CafeFilters) {
  const sql = getSql();
  const parts = [sql`true`];

  if (f.q) {
    const like = `%${f.q.replace(/[\\%_]/g, "\\$&")}%`;
    parts.push(sql`(c.name ilike ${like} or c.address ilike ${like})`);
  }
  for (const key of f.amenities ?? []) {
    // Tên cột chỉ lấy từ whitelist → an toàn khi dùng làm identifier.
    if (AMENITY_SET.has(key)) parts.push(sql`c.${sql(key)} is true`);
  }
  if (f.categories?.length) parts.push(sql`c.main_category in ${sql(f.categories)}`);
  if (f.priceRange?.length) parts.push(sql`c.price_range in ${sql(f.priceRange)}`);
  if (f.minRating !== undefined) parts.push(sql`c.rating >= ${f.minRating}`);
  if (f.item) {
    parts.push(sql`exists (
      select 1 from v_typical_price_v2 p
      where p.place_id = c.place_id and p.canonical_id = ${f.item}
        ${f.maxItemPrice !== undefined ? sql`and p.price_min <= ${f.maxItemPrice}` : sql``}
    )`);
  }
  return parts.reduce((acc, p) => sql`${acc} and ${p}`);
}
