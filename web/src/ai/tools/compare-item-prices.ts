import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { CANONICAL_BENCHMARKS, formatPrice } from "@/features/cafe-detail/benchmark-data";
import { getSql } from "@/server/db/client";
import { COFFEE_CANONICAL_IDS } from "@/server/db/queries/menu";

export const compareItemPricesTool = tool({
  description:
    "So sánh giá của một loại đồ uống chuẩn hóa (ví dụ: ca_phe_sua, bac_xiu, cold_brew, matcha_latte, ca_phe_muoi...) giữa các quán cafe tại An Thượng. Trả về các quán có giá rẻ nhất hoặc phổ biến nhất. ĐẶC BIỆT: Nếu kết quả có cờ 'isSuspicious' hoặc 'isUnusualPrice' (ví dụ giá < 18.000đ cho cà phê), AI KHÔNG ĐƯỢC khẳng định chắc nịch giá đó mà BẮT BUỘC phải kèm cảnh báo cho người dùng rằng đó có thể là giá take-away, quán vỉa hè hoặc sai sót bóc tách OCR.",
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
    const isCoffee = COFFEE_CANONICAL_IDS.has(canonicalId);
    const benchmark = CANONICAL_BENCHMARKS[canonicalId];

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

    const benchmarkMedian = benchmark ? Math.round((benchmark.medianMin + benchmark.medianMax) / 2) : null;

    const cafes = rows.map((r) => {
      // Đánh dấu bất thường nếu:
      // 1. Nhóm cà phê mà giá < 18.000đ (thấp bất thường so với mặt bằng phố Tây An Thượng)
      // 2. Độ lệch lớn: thấp hơn 50% trung vị khu vực
      const isSuspicious =
        (isCoffee && r.priceMin < 18000) || (benchmarkMedian !== null && r.priceMin < benchmarkMedian * 0.5);

      const warningNote = isSuspicious
        ? `Mức giá ${formatPrice(r.priceMin)} thấp bất thường so với mặt bằng chung An Thượng (trung vị ~${benchmarkMedian ? formatPrice(benchmarkMedian) : "35.000đ"}). Có thể là giá mang về (take-away), quán bình dân vỉa hè hoặc sai sót bóc tách OCR. Khuyến cáo kiểm tra lại với quán.`
        : undefined;

      return {
        placeId: r.placeId,
        url: `/quan/${r.placeId}`,
        shopName: r.shopName,
        drinkName: r.displayName,
        priceMin: r.priceMin,
        priceMax: r.priceMax,
        rating: r.rating,
        workScore: r.workScore,
        isSuspicious,
        isUnusualPrice: isSuspicious,
        warningNote,
      };
    });

    const hasUnusualPrice = cafes.some((c) => c.isSuspicious);

    return {
      canonicalId,
      totalCompared: rows.length,
      medianBenchmark: benchmarkMedian,
      hasUnusualPrice,
      adviceForAI: hasUnusualPrice
        ? "CẢNH BÁO CHO AI: Một số quán có cờ isSuspicious=true (giá < 18.000đ cho cà phê hoặc thấp hơn 50% trung vị). KHÔNG khẳng định chắc nịch đây là giá phục vụ tại quán. Hãy ghi chú rõ cho người dùng đây là mức giá thấp bất thường, có thể là giá take-away, quán vỉa hè hoặc sai số nhận diện OCR."
        : undefined,
      cafes,
    };
  },
});
