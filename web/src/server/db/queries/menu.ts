import "server-only";

import { cacheLife } from "next/cache";

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

const FALLBACK = { key: "misc", label: "Khác" };

/** Thực đơn tiêu biểu (giá min/max theo món chuẩn hoá), nhóm theo loại món. */
export async function getCafeMenu(placeId: string): Promise<MenuGroup[]> {
  "use cache";
  cacheLife("hours");

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
    const bucket = buckets.get(g.key) ?? { key: g.key, label: g.label, items: [] };
    bucket.items.push(item);
    buckets.set(g.key, bucket);
  }
  const order = [...GROUPS.map((g) => g.key), FALLBACK.key];
  return order.flatMap((k) => buckets.get(k) ?? []);
}

/** 33 món chuẩn hoá, dùng cho bộ lọc "món". */
export async function listCanonicalItems(): Promise<CanonicalItem[]> {
  "use cache";
  cacheLife("hours");

  const sql = getSql();
  const rows = await sql<CanonicalItem[]>`
    select canonical_id as "canonicalId", display_name as "displayName"
    from canonical_item order by display_name`;
  return [...rows];
}
