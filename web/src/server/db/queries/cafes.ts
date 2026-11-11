import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { CafeFilters, SortKey } from "@/features/cafes/schema";

import { getSql } from "../client";
import type { Cafe, CafeListResult } from "../types";
import { CACHE_TAG_CAFES } from "../cache-tags";
import { filterCafes, getCafeSnapshot, sortCafes, toCard } from "./snapshot";

export const PAGE_SIZE = 24;

/** Cột nhẹ cho card. Ép kiểu số để postgres.js không trả string (numeric). */
export function cardColumns() {
  const sql = getSql();
  return sql`
    c.place_id as "placeId", c.name, c.main_category as "mainCategory", c.address,
    c.short_address as "shortAddress", c.lat::float8 as lat, c.lng::float8 as lng,
    c.rating::float8 as rating, c.reviews::int as reviews, c.price_range as "priceRange",
    c.featured_image as "featuredImage", c.work_score::int as "workScore",
    c.drink_price_min::float8 as "drinkPriceMin", c.drink_price_median::float8 as "drinkPriceMedian",
    c.drink_price_max::float8 as "drinkPriceMax", coalesce(c.has_menu, false) as "hasMenu",
    coalesce(c.has_wifi, false) as "hasWifi", coalesce(c.laptop_friendly, false) as "laptopFriendly",
    coalesce(c.has_ac, false) as "hasAc", coalesce(c.has_outlets, false) as "hasOutlets",
    coalesce(c.outdoor_seating, false) as "outdoorSeating", coalesce(c.pet_friendly, false) as "petFriendly",
    coalesce(c.quiet, false) as "quiet"`;
}

/** Danh sách quán (phân trang PAGE_SIZE), lọc/sắp xếp trên snapshot đã cache — xem `snapshot.ts`. */
export async function listCafes(
  filters: CafeFilters,
  sort: SortKey = filters.sort,
  page: number = filters.page,
): Promise<CafeListResult> {
  const safePage = Math.max(1, Math.floor(page));
  const rows = sortCafes(await filterCafes(await getCafeSnapshot(), filters), sort);
  const total = rows.length;
  return {
    items: rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE).map(toCard),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getCafe(placeId: string): Promise<Cafe | null> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_CAFES);

  try {
    const sql = getSql();
    const rows = await sql`
      select ${cardColumns()}, c.categories, c.phone, c.website, c.maps_link as "mapsLink",
        c.description, c.hours, c.closed_on as "closedOn", c.reviews_per_rating as "reviewsPerRating",
        c.review_keywords as "reviewKeywords", c.featured_reviews as "featuredReviews",
        coalesce(c.menu_item_count, 0)::int as "menuItemCount",
        c.ac_source as "acSource", c.outlets_source as "outletsSource", to_jsonb(c) as raw
      from v_cafe_directory c where c.place_id = ${placeId} limit 1`;
    const row = rows[0];
    if (!row) return null;
    const { raw, ...rest } = row as Record<string, unknown> & { raw: Record<string, unknown> };
    const flags: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(raw)) if (typeof v === "boolean") flags[k] = v;
    return {
      ...(rest as unknown as Omit<Cafe, "flags">),
      categories: (rest.categories as string[]) ?? [],
      flags,
    };
  } catch (err) {
    console.error(`Lỗi khi truy vấn getCafe(${placeId}):`, err);
    return null;
  }
}
