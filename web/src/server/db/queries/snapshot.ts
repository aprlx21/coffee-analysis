import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { AmenityKey, CafeFilters, SortKey } from "@/features/cafes/schema";
import { AMENITY_KEYS } from "@/features/cafes/schema";

import { getSql } from "../client";
import { CACHE_TAG_CAFES } from "../cache-tags";
import type { CafeCard } from "../types";
import { cardColumns } from "./cafes";

/**
 * SNAPSHOT TOÀN BỘ QUÁN (~115 dòng) — nguồn chung cho danh sách, bản đồ và facets.
 *
 * `v_cafe_directory` parse lại raw_json + regex review mỗi lần đọc (~2,4 s cho 115 quán), nên ta chỉ đọc nó
 * MỘT lần, cache cả snapshot, rồi lọc/sắp xếp/phân trang bằng JS (< 1 ms với 115 dòng). Nhờ đó mọi tổ hợp
 * bộ lọc đều trúng cùng một mục cache thay vì mỗi tổ hợp một lần query.
 *
 * Làm mới: tự hết hạn theo `cacheLife("days")`, hoặc gọi ngay `POST /api/revalidate` (tag `cafes`).
 */
export interface CafeSnapshotRow extends CafeCard {
  flags: Record<AmenityKey, boolean>;
}

export interface ItemPriceRow {
  placeId: string;
  canonicalId: string;
  priceMin: number | null;
}

export async function getCafeSnapshot(): Promise<CafeSnapshotRow[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_CAFES);

  try {
    const sql = getSql();
    // Tên cột lấy từ whitelist AMENITY_KEYS → an toàn khi dùng làm identifier.
    const flagCols = AMENITY_KEYS.map((k) => sql`coalesce(c.${sql(k)}, false) as ${sql(`f_${k}`)}`).reduce(
      (a, b) => sql`${a}, ${b}`,
    );
    const rows = await sql<Record<string, unknown>[]>`
      select ${cardColumns()}, ${flagCols} from v_cafe_directory c`;

    return rows.map((row) => {
      const flags = {} as Record<AmenityKey, boolean>;
      const card: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (key.startsWith("f_")) flags[key.slice(2) as AmenityKey] = Boolean(value);
        else card[key] = value;
      }
      return { ...(card as unknown as CafeCard), flags };
    });
  } catch (err) {
    console.error("Lỗi khi truy vấn getCafeSnapshot:", err);
    return [];
  }
}

/** Giá thấp nhất theo món chuẩn hoá của từng quán — phục vụ bộ lọc `item` / `maxItemPrice`. */
export async function getItemPriceSnapshot(): Promise<ItemPriceRow[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_CAFES);

  try {
    const sql = getSql();
    const rows = await sql<ItemPriceRow[]>`
      select place_id as "placeId", canonical_id as "canonicalId", price_min::float8 as "priceMin"
      from v_typical_price_v2`;
    return [...rows];
  } catch (err) {
    console.error("Lỗi khi truy vấn getItemPriceSnapshot:", err);
    return [];
  }
}

/** Tương đương `buildWhere` (SQL) cũ, chạy trên snapshot. */
export async function filterCafes(rows: CafeSnapshotRow[], f: CafeFilters): Promise<CafeSnapshotRow[]> {
  let out = rows;

  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((c) => c.name.toLowerCase().includes(q) || (c.address ?? "").toLowerCase().includes(q));
  }
  for (const key of f.amenities ?? []) out = out.filter((c) => c.flags[key]);
  if (f.categories?.length) {
    const set = new Set(f.categories);
    out = out.filter((c) => c.mainCategory !== null && set.has(c.mainCategory));
  }
  if (f.priceRange?.length) {
    const set = new Set(f.priceRange);
    out = out.filter((c) => c.priceRange !== null && set.has(c.priceRange));
  }
  if (f.minRating !== undefined) {
    const min = f.minRating;
    out = out.filter((c) => c.rating !== null && c.rating >= min);
  }
  if (f.item) {
    const prices = await getItemPriceSnapshot();
    const ok = new Set(
      prices
        .filter(
          (p) =>
            p.canonicalId === f.item &&
            (f.maxItemPrice === undefined || (p.priceMin !== null && p.priceMin <= f.maxItemPrice)),
        )
        .map((p) => p.placeId),
    );
    out = out.filter((c) => ok.has(c.placeId));
  }
  return out;
}

type Num = number | null;
/** So sánh kiểu SQL `desc nulls last` / `asc nulls last`. */
const cmp = (a: Num, b: Num, dir: 1 | -1) => (a === null ? (b === null ? 0 : 1) : b === null ? -1 : (a - b) * dir);

/** Tương đương `orderBy` (SQL) cũ. */
export function sortCafes<T extends CafeCard>(rows: T[], sort: SortKey): T[] {
  const byName = (a: T, b: T) => a.name.localeCompare(b.name);
  const rating = (a: T, b: T) => cmp(a.rating, b.rating, -1);
  const comparators: Record<SortKey, (a: T, b: T) => number> = {
    rating: (a, b) => rating(a, b) || cmp(a.reviews, b.reviews, -1) || byName(a, b),
    reviews: (a, b) => cmp(a.reviews, b.reviews, -1) || rating(a, b) || byName(a, b),
    work_score: (a, b) => cmp(a.workScore, b.workScore, -1) || rating(a, b) || byName(a, b),
    price_asc: (a, b) => cmp(a.drinkPriceMedian, b.drinkPriceMedian, 1) || rating(a, b) || byName(a, b),
    price_desc: (a, b) => cmp(a.drinkPriceMedian, b.drinkPriceMedian, -1) || rating(a, b) || byName(a, b),
  };
  return [...rows].sort(comparators[sort]);
}

/** Bỏ `flags` trước khi gửi xuống client để payload gọn như trước. */
export function toCard(row: CafeSnapshotRow): CafeCard {
  const card: Partial<CafeSnapshotRow> = { ...row };
  delete card.flags;
  return card as CafeCard;
}
