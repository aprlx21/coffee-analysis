import "server-only";

import { cacheLife } from "next/cache";

import type { CafeFilters, SortKey } from "@/features/cafes/schema";

import { getSql } from "../client";
import type { Cafe, CafeCard, CafeListResult } from "../types";
import { buildWhere } from "./filters";

export const PAGE_SIZE = 24;

/** Cột nhẹ cho card. Ép kiểu số để postgres.js không trả string (numeric). */
function cardColumns() {
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

function orderBy(sort: SortKey) {
  const sql = getSql();
  switch (sort) {
    case "reviews":
      return sql`c.reviews desc nulls last, c.rating desc nulls last, c.name`;
    case "work_score":
      return sql`c.work_score desc nulls last, c.rating desc nulls last, c.name`;
    case "price_asc":
      return sql`c.drink_price_median asc nulls last, c.rating desc nulls last, c.name`;
    case "price_desc":
      return sql`c.drink_price_median desc nulls last, c.rating desc nulls last, c.name`;
    default:
      return sql`c.rating desc nulls last, c.reviews desc nulls last, c.name`;
  }
}

/** Danh sách quán (phân trang PAGE_SIZE). `sort`/`page` mặc định lấy từ `filters`. */
export async function listCafes(
  filters: CafeFilters,
  sort: SortKey = filters.sort,
  page: number = filters.page,
): Promise<CafeListResult> {
  "use cache";
  cacheLife("hours");

  const sql = getSql();
  const where = buildWhere(filters);
  const safePage = Math.max(1, Math.floor(page));
  const [{ total }] = await sql<{ total: number }[]>`
    select count(*)::int as total from v_cafe_directory c where ${where}`;
  const items = await sql<CafeCard[]>`
    select ${cardColumns()} from v_cafe_directory c where ${where}
    order by ${orderBy(sort)} limit ${PAGE_SIZE} offset ${(safePage - 1) * PAGE_SIZE}`;
  return {
    items: [...items],
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Chi tiết một quán; null nếu không tồn tại. */
export async function getCafe(placeId: string): Promise<Cafe | null> {
  "use cache";
  cacheLife("hours");

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
}
