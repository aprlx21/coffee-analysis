import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAG_CAFES } from "../cache-tags";

import { getSql } from "../client";
import type { CanonicalItem, MenuGroup, MenuItem } from "../types";

/** `canonical_item` chưa có cột nhóm → nhóm theo canonical_id ở đây. */
const GROUPS: { key: string; label: string; ids: string[] }[] = [
  {
    key: "coffee",
    label: "Cà phê",
    ids: [
      "ca_phe_den",
      "ca_phe_sua",
      "ca_phe_sua_tuoi",
      "bac_xiu",
      "ca_phe_muoi",
      "ca_phe_dua",
      "ca_phe_trung",
      "americano",
      "espresso",
      "latte",
      "cappuccino",
      "flat_white",
      "mocha",
      "caramel_macchiato",
      "cold_brew",
    ],
  },
  {
    key: "tea",
    label: "Trà & matcha",
    ids: [
      "tra_dao",
      "tra_chanh",
      "tra_tac",
      "tra_vai",
      "tra_sen_vang",
      "tra_xanh",
      "hong_tra",
      "tra_sua_tran_chau",
      "matcha_latte",
    ],
  },
  {
    key: "other",
    label: "Nước ép, sinh tố & khác",
    ids: [
      "nuoc_cam",
      "nuoc_dua",
      "chanh_day",
      "soda_chanh",
      "sinh_to_bo",
      "sinh_to_dau",
      "sinh_to_xoai",
      "sua_chua",
      "cacao",
    ],
  },
];

export const COFFEE_CANONICAL_IDS = new Set([
  "ca_phe_den",
  "ca_phe_sua",
  "ca_phe_sua_tuoi",
  "bac_xiu",
  "ca_phe_muoi",
  "ca_phe_dua",
  "ca_phe_trung",
  "americano",
  "espresso",
  "latte",
  "cappuccino",
  "flat_white",
  "mocha",
  "caramel_macchiato",
  "cold_brew",
]);

const FALLBACK = { key: "misc", label: "Khác" };

/** Thực đơn tiêu biểu (giá min/max theo món chuẩn hoá), nhóm theo loại món. */
export async function getCafeMenu(placeId: string): Promise<MenuGroup[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_CAFES);

  try {
    const sql = getSql();
    const rows = await sql<MenuItem[]>`
      select canonical_id as "canonicalId", display_name as "displayName",
        price_min::float8 as "priceMin", price_max::float8 as "priceMax",
        coalesce(match_uncertain, 0) <> 0 as "matchUncertain"
      from v_typical_price_v2 where place_id = ${placeId}
      order by display_name`;

    const buckets = new Map<string, MenuGroup>();
    for (const item of rows) {
      const g = GROUPS.find((x) => x.ids.includes(item.canonicalId)) ?? FALLBACK;
      const isCoffee = COFFEE_CANONICAL_IDS.has(item.canonicalId);
      const isSuspicious =
        (isCoffee && item.priceMin !== null && item.priceMin < 18000) ||
        (item.priceMin !== null && item.priceMin < 12000);
      const enrichedItem: MenuItem = {
        ...item,
        isSuspicious,
        isUnusualPrice: isSuspicious,
        warningNote: isSuspicious
          ? `Mức giá ${item.priceMin?.toLocaleString("vi-VN")}đ thấp bất thường so với mặt bằng An Thượng (có thể là đồ uống mang về take-away hoặc OCR cần đối chiếu)`
          : undefined,
      };
      const bucket = buckets.get(g.key) ?? { key: g.key, label: g.label, items: [] };
      bucket.items.push(enrichedItem);
      buckets.set(g.key, bucket);
    }
    const order = [...GROUPS.map((g) => g.key), FALLBACK.key];
    return order.flatMap((k) => buckets.get(k) ?? []);
  } catch (err) {
    console.error(`Lỗi khi truy vấn getCafeMenu(${placeId}):`, err);
    return [];
  }
}

/** 33 món chuẩn hoá, dùng cho bộ lọc "món". */
export async function listCanonicalItems(): Promise<CanonicalItem[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_CAFES);

  try {
    const sql = getSql();
    const rows = await sql<CanonicalItem[]>`
      select canonical_id as "canonicalId", display_name as "displayName"
      from canonical_item order by display_name`;
    return [...rows];
  } catch (err) {
    console.error("Lỗi khi truy vấn listCanonicalItems, dùng fallback danh sách món:", err);
    return DEFAULT_CANONICAL_ITEMS;
  }
}

const DEFAULT_CANONICAL_ITEMS: CanonicalItem[] = [
  { canonicalId: "ca_phe_den", displayName: "Cà phê đen" },
  { canonicalId: "ca_phe_sua", displayName: "Cà phê sữa" },
  { canonicalId: "ca_phe_sua_tuoi", displayName: "Cà phê sữa tươi" },
  { canonicalId: "bac_xiu", displayName: "Bạc xỉu" },
  { canonicalId: "ca_phe_muoi", displayName: "Cà phê muối" },
  { canonicalId: "ca_phe_dua", displayName: "Cà phê dừa" },
  { canonicalId: "ca_phe_trung", displayName: "Cà phê trứng" },
  { canonicalId: "americano", displayName: "Americano" },
  { canonicalId: "espresso", displayName: "Espresso" },
  { canonicalId: "latte", displayName: "Latte" },
  { canonicalId: "cappuccino", displayName: "Cappuccino" },
  { canonicalId: "flat_white", displayName: "Flat White" },
  { canonicalId: "mocha", displayName: "Mocha" },
  { canonicalId: "caramel_macchiato", displayName: "Caramel Macchiato" },
  { canonicalId: "cold_brew", displayName: "Cold Brew" },
  { canonicalId: "tra_dao", displayName: "Trà đào" },
  { canonicalId: "tra_chanh", displayName: "Trà chanh" },
  { canonicalId: "tra_tac", displayName: "Trà tắc" },
  { canonicalId: "tra_vai", displayName: "Trà vải" },
  { canonicalId: "tra_sen_vang", displayName: "Trà sen vàng" },
  { canonicalId: "tra_xanh", displayName: "Trà xanh" },
  { canonicalId: "hong_tra", displayName: "Hồng trà" },
  { canonicalId: "tra_sua_tran_chau", displayName: "Trà sữa trân châu" },
  { canonicalId: "matcha_latte", displayName: "Matcha Latte" },
  { canonicalId: "nuoc_cam", displayName: "Nước cam" },
  { canonicalId: "nuoc_dua", displayName: "Nước dừa" },
  { canonicalId: "chanh_day", displayName: "Chanh dây" },
  { canonicalId: "soda_chanh", displayName: "Soda chanh" },
  { canonicalId: "sinh_to_bo", displayName: "Sinh tố bơ" },
  { canonicalId: "sinh_to_dau", displayName: "Sinh tố dâu" },
  { canonicalId: "sinh_to_xoai", displayName: "Sinh tố xoài" },
  { canonicalId: "sua_chua", displayName: "Sữa chua" },
  { canonicalId: "cacao", displayName: "Cacao" },
];
