import { z } from "zod";

/** Cờ tiện ích (boolean) có trong `v_cafe_directory`. Whitelist dùng chung cho UI, map và DAL. */
export const AMENITY_KEYS = [
  "has_wifi",
  "laptop_friendly",
  "outdoor_seating",
  "quiet",
  "cozy",
  "pet_friendly",
  "has_parking",
  "accepts_card",
  "accepts_nfc",
  "cash_only",
  "accepts_reservations",
  "vegan_options",
  "vegetarian_options",
  "rooftop",
  "live_music",
  "good_for_kids",
  // suy luận từ review
  "has_ac",
  "has_outlets",
] as const;
export type AmenityKey = (typeof AMENITY_KEYS)[number];

export const SORT_KEYS = ["rating", "reviews", "work_score", "price_asc", "price_desc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const PRICE_RANGES = ["D1-100,000", "D100-200K", "D200-300K"] as const;

/** `?a=1&a=2` hoặc `?a=1,2` → ["1","2"]; thiếu → undefined. */
const list = <T extends z.ZodType>(item: T) =>
  z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return undefined;
    const arr = Array.isArray(v) ? v : [v];
    return arr.flatMap((s) => String(s).split(",")).filter(Boolean);
  }, z.array(item).optional());

const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const blankToUndefined = (v: unknown) => (v === "" ? undefined : first(v));

export const cafeFiltersSchema = z.object({
  q: z.preprocess(blankToUndefined, z.string().trim().max(100).optional()),
  amenities: list(z.enum(AMENITY_KEYS)),
  categories: list(z.string().max(60)),
  priceRange: list(z.string().max(40)),
  minRating: z.preprocess(blankToUndefined, z.coerce.number().min(0).max(5).optional()),
  /** canonical_id của món (vd `ca_phe_sua`) */
  item: z.preprocess(
    blankToUndefined,
    z
      .string()
      .regex(/^[a-z0-9_]+$/)
      .max(60)
      .optional(),
  ),
  /** Giá tối đa (VND) của món `item` */
  maxItemPrice: z.preprocess(blankToUndefined, z.coerce.number().min(0).max(10_000_000).optional()),
  sort: z.preprocess(blankToUndefined, z.enum(SORT_KEYS).default("rating")),
  page: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(1000).default(1)),
});

export type CafeFilters = z.infer<typeof cafeFiltersSchema>;

/**
 * Parse searchParams của Next (hoặc URLSearchParams) → CafeFilters.
 * Giá trị sai bị bỏ qua (không ném lỗi) để URL hỏng vẫn render được.
 */
export function parseCafeFilters(input: Record<string, string | string[] | undefined> | URLSearchParams): CafeFilters {
  const raw: Record<string, unknown> = {};
  if (input instanceof URLSearchParams) {
    for (const key of new Set(input.keys())) {
      const all = input.getAll(key);
      raw[key] = all.length > 1 ? all : all[0];
    }
  } else {
    Object.assign(raw, input);
  }
  const result = cafeFiltersSchema.safeParse(raw);
  if (result.success) return result.data;
  // Bỏ riêng từng field lỗi thay vì loại cả bộ lọc.
  for (const issue of result.error.issues) delete raw[String(issue.path[0])];
  return cafeFiltersSchema.parse(raw);
}

/** CafeFilters → query string (bỏ giá trị mặc định) để ghi lên URL. */
export function cafeFiltersToSearchParams(f: Partial<CafeFilters>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.amenities?.length) p.set("amenities", f.amenities.join(","));
  if (f.categories?.length) p.set("categories", f.categories.join(","));
  if (f.priceRange?.length) p.set("priceRange", f.priceRange.join(","));
  if (f.minRating !== undefined) p.set("minRating", String(f.minRating));
  if (f.item) p.set("item", f.item);
  if (f.maxItemPrice !== undefined) p.set("maxItemPrice", String(f.maxItemPrice));
  if (f.sort && f.sort !== "rating") p.set("sort", f.sort);
  if (f.page && f.page > 1) p.set("page", String(f.page));
  return p;
}
