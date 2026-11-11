import "server-only";

import type { CafeFilters } from "@/features/cafes/schema";
import { AMENITY_KEYS } from "@/features/cafes/schema";

import type { Facets, MapPoint } from "../types";
import { filterCafes, getCafeSnapshot } from "./snapshot";

function countBy(values: (string | null)[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of values) if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
}

/** Số quán theo từng tiện ích / loại quán / khoảng giá (toàn bộ quán, không áp filter). Tính từ snapshot. */
export async function getFacets(): Promise<Facets> {
  const rows = await getCafeSnapshot();
  const amenities: Record<string, number> = {};
  for (const key of AMENITY_KEYS) amenities[key] = rows.filter((c) => c.flags[key]).length;

  const categories = [...countBy(rows.map((c) => c.mainCategory))]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  const priceRanges = [...countBy(rows.map((c) => c.priceRange))]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));

  return { total: rows.length, amenities, categories, priceRanges };
}

/** Điểm nhẹ cho bản đồ (chỉ quán có toạ độ), áp cùng bộ lọc với `listCafes`. */
export async function getMapPoints(filters: CafeFilters): Promise<MapPoint[]> {
  const rows = await filterCafes(await getCafeSnapshot(), filters);
  return rows
    .filter((c) => c.lat !== null && c.lng !== null)
    .map((c) => ({
      placeId: c.placeId,
      name: c.name,
      lat: c.lat as number,
      lng: c.lng as number,
      rating: c.rating,
      featuredImage: c.featuredImage,
      priceRange: c.priceRange,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
