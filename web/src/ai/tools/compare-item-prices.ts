import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { getSql } from "@/server/db/client";

export const compareItemPricesTool = tool({
  description:
    "So sánh giá của một loại đồ uống chuẩn hóa (ví dụ: ca_phe_sua, bac_xiu, cold_brew, matcha_latte, ca_phe_muoi...) giữa các quán cafe tại An Thượng. Trả về các quán có giá rẻ nhất hoặc phổ biến nhất.",
  inputSchema: z.object({
    canonicalId: z
      .string()
      .describe(
        "Mã định danh món đồ uống chuẩn: ca_phe_den, ca_phe_sua, bac_xiu, ca_phe_muoi, ca_phe_dua, ca_phe_trung, americano, espresso, latte, cappuccino, cold_brew, matcha_latte, tra_dao, tra_vai, sinh_to_bo, v.v.",
      ),
    maxPrice: z.number().optional().describe("Mức giá tối đa mong muốn (VND)"),
    limit: z.number().int().min(1).max(10).default(5).describe("Số lượng quán muốn so sánh"),
  }),
  execute: async ({ canonicalId, maxPrice, limit }) => {
    const sql = getSql();
    const rows = await sql<
      {
        placeId: string;
        shopName: string;
        displayName: string;
        priceMin: number;
        priceMax: number;
        rating: number | null;
        workScore: number | null;
      }[]
    >`
      SELECT 
        p.place_id as "placeId",
        p.shop_name as "shopName",
        p.display_name as "displayName",
        p.price_min::float8 as "priceMin",
        p.price_max::float8 as "priceMax",
        c.rating::float8 as rating,
        c.work_score::int as "workScore"
      FROM v_typical_price_v2 p
      JOIN v_cafe_directory c ON c.place_id = p.place_id
      WHERE p.canonical_id = ${canonicalId}
        ${maxPrice ? sql`AND p.price_min <= ${maxPrice}` : sql``}
      ORDER BY p.price_min ASC NULLS LAST, c.rating DESC NULLS LAST
      LIMIT ${limit}
    `;

    return {
      canonicalId,
      totalCompared: rows.length,
      cafes: rows.map((r) => ({
        placeId: r.placeId,
        shopName: r.shopName,
        drinkName: r.displayName,
        priceMin: r.priceMin,
        priceMax: r.priceMax,
        rating: r.rating,
        workScore: r.workScore,
      })),
    };
  },
});
