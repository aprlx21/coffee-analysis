import "server-only";

import { cacheLife } from "next/cache";

import type { CafeFilters } from "@/features/cafes/schema";
import { AMENITY_KEYS } from "@/features/cafes/schema";

import { getSql } from "../client";
import type { Facets, MapPoint } from "../types";
import { buildWhere } from "./filters";

/** Số quán theo từng tiện ích / loại quán / khoảng giá (toàn bộ quán, không áp filter). */
export async function getFacets(): Promise<Facets> {
  "use cache";
  cacheLife("hours");

  try {
    const sql = getSql();
    // Tên cột lấy từ whitelist AMENITY_KEYS.
    const counts = AMENITY_KEYS.map((k) => sql`count(*) filter (where ${sql(k)} is true)::int as ${sql(k)}`).reduce(
      (a, b) => sql`${a}, ${b}`,
    );
    const [totals] = await sql`select count(*)::int as total, ${counts} from v_cafe_directory`;
    const categories = await sql<{ value: string; count: number }[]>`
      select main_category as value, count(*)::int as count from v_cafe_directory
      where main_category is not null group by 1 order by 2 desc, 1`;
    const priceRanges = await sql<{ value: string; count: number }[]>`
      select price_range as value, count(*)::int as count from v_cafe_directory
      where price_range is not null group by 1 order by 1`;

    const { total, ...amenities } = totals as unknown as { total: number } & Record<string, number>;
    return { total, amenities, categories: [...categories], priceRanges: [...priceRanges] };
  } catch (err) {
    console.error("Lỗi khi truy vấn getFacets:", err);
    return {
      total: 0,
      amenities: {} as Record<string, number>,
      categories: [],
      priceRanges: [],
    };
  }
}

/** Điểm nhẹ cho bản đồ (chỉ quán có toạ độ), áp cùng bộ lọc với `listCafes`. */
export async function getMapPoints(filters: CafeFilters): Promise<MapPoint[]> {
  "use cache";
  cacheLife("hours");

  try {
    const sql = getSql();
    const rows = await sql<MapPoint[]>`
      select c.place_id as "placeId", c.name, c.lat::float8 as lat, c.lng::float8 as lng,
        c.rating::float8 as rating, c.featured_image as "featuredImage", c.price_range as "priceRange"
      from v_cafe_directory c
      where c.lat is not null and c.lng is not null and ${buildWhere(filters)}
      order by c.name`;
    return [...rows];
  } catch (err) {
    console.error("Lỗi khi truy vấn getMapPoints:", err);
    return [];
  }
}
