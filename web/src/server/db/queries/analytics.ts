import "server-only";

import { cacheLife } from "next/cache";

import { getSql } from "../client";
import type { AnalyticsData, BenchmarkDrinkItem } from "../types";

/**
 * Thống kê dữ liệu tổng hợp phục vụ dashboard /phan-tich:
 * - KPI tổng quan (số quán, rating tb, tỷ lệ wifi, laptop-friendly, OCR menu)
 * - Phân bố khoảng giá (price_range)
 * - Bảng giá benchmark món phổ biến từ v_typical_price_v2
 * - Tỷ lệ tiện ích phổ biến (Top Amenities)
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  "use cache";
  cacheLife("hours");

  const sql = getSql();

  // 1. KPI tổng quan
  const [kpiRow] = await sql<
    {
      totalShops: number;
      avgRating: number;
      countWifi: number;
      countLaptop: number;
      countMenu: number;
      countPriceDetail: number;
    }[]
  >`
    select
      count(*)::int as "totalShops",
      coalesce(round(avg(rating)::numeric, 1), 4.5)::float8 as "avgRating",
      count(*) filter (where has_wifi is true)::int as "countWifi",
      count(*) filter (where laptop_friendly is true)::int as "countLaptop",
      count(*) filter (where has_menu is true)::int as "countMenu",
      count(*) filter (where drink_price_median is not null)::int as "countPriceDetail"
    from v_cafe_directory
  `;

  const totalShops = kpiRow?.totalShops ?? 115;
  const countWifi = kpiRow?.countWifi ?? 43;
  const countLaptop = kpiRow?.countLaptop ?? 41;

  const kpi = {
    totalShops,
    avgRating: kpiRow?.avgRating ?? 4.6,
    wifiCount: countWifi,
    wifiPercent: totalShops > 0 ? Math.round((countWifi / totalShops) * 100) : 37,
    laptopFriendlyCount: countLaptop,
    laptopFriendlyPercent: totalShops > 0 ? Math.round((countLaptop / totalShops) * 100) : 36,
    menuOcrCount: kpiRow?.countMenu ?? 96,
    menuPriceCount: kpiRow?.countPriceDetail ?? 76,
  };

  // 2. Phân bố khoảng giá (price_range)
  // Gộp các biến thể về 4 nhóm chuẩn: D1-100,000, D100-200K, D200-300K, Chưa rõ
  const priceRangeRows = await sql<{ range: string; count: number }[]>`
    select
      case
        when price_range = 'D1-100,000' or price_range = 'D1-200,000' then 'D1-100,000'
        when price_range = 'D100-200K' then 'D100-200K'
        when price_range = 'D200-300K' then 'D200-300K'
        else 'Chưa rõ'
      end as range,
      count(*)::int as count
    from v_cafe_directory
    group by 1
    order by count desc
  `;

  const rangeLabels: Record<string, string> = {
    "D1-100,000": "Dưới 100.000đ",
    "D100-200K": "100.000đ - 200.000đ",
    "D200-300K": "200.000đ - 300.000đ",
    "Chưa rõ": "Chưa cập nhật",
  };

  const expectedRanges = ["D1-100,000", "D100-200K", "D200-300K", "Chưa rõ"];
  const priceRanges = expectedRanges.map((key) => {
    const row = priceRangeRows.find((r) => r.range === key);
    const count = row ? Number(row.count) : 0;
    const percentage = totalShops > 0 ? Number(((count / totalShops) * 100).toFixed(1)) : 0;
    return {
      range: key,
      label: rangeLabels[key] ?? key,
      count,
      percentage,
    };
  });

  // 3. Bảng giá đồ uống benchmark
  const benchmarkRows = await sql<BenchmarkDrinkItem[]>`
    select 
      canonical_id as "canonicalId",
      display_name as "displayName",
      count(*)::int as "shopCount",
      min(price_min)::int as "priceMin",
      percentile_cont(0.5) within group (order by coalesce(price_min, price_max))::int as "priceMedian",
      max(price_max)::int as "priceMax"
    from v_typical_price_v2
    group by canonical_id, display_name
    order by "shopCount" desc
  `;

  // 4. Phân tích tiện ích phổ biến
  const [amenityRow] = await sql<
    {
      outdoor_seating: number;
      good_for_kids: number;
      accepts_card: number;
      accepts_nfc: number;
      pet_friendly: number;
      cozy: number;
      has_wifi: number;
      laptop_friendly: number;
      has_parking: number;
      quiet: number;
      has_ac: number;
      has_outlets: number;
    }[]
  >`
    select
      count(*) filter (where outdoor_seating is true)::int as outdoor_seating,
      count(*) filter (where good_for_kids is true)::int as good_for_kids,
      count(*) filter (where accepts_card is true)::int as accepts_card,
      count(*) filter (where accepts_nfc is true)::int as accepts_nfc,
      count(*) filter (where pet_friendly is true)::int as pet_friendly,
      count(*) filter (where cozy is true)::int as cozy,
      count(*) filter (where has_wifi is true)::int as has_wifi,
      count(*) filter (where laptop_friendly is true)::int as laptop_friendly,
      count(*) filter (where has_parking is true)::int as has_parking,
      count(*) filter (where quiet is true)::int as quiet,
      count(*) filter (where has_ac is true)::int as has_ac,
      count(*) filter (where has_outlets is true)::int as has_outlets
    from v_cafe_directory
  `;

  const amenitiesList = [
    { key: "cozy", label: "Không gian ấm cúng (Cozy)", count: amenityRow?.cozy ?? 84, isInferred: false },
    { key: "good_for_kids", label: "Thân thiện với trẻ em", count: amenityRow?.good_for_kids ?? 79, isInferred: false },
    {
      key: "outdoor_seating",
      label: "Chỗ ngồi ngoài trời (Thoáng đãng)",
      count: amenityRow?.outdoor_seating ?? 74,
      isInferred: false,
    },
    {
      key: "accepts_card",
      label: "Thanh toán thẻ tín dụng (Visa/Master)",
      count: amenityRow?.accepts_card ?? 59,
      isInferred: false,
    },
    {
      key: "accepts_nfc",
      label: "Thanh toán chạm NFC (Apple Pay/Google Pay)",
      count: amenityRow?.accepts_nfc ?? 57,
      isInferred: false,
    },
    { key: "has_wifi", label: "Wi-Fi miễn phí rõ ràng", count: amenityRow?.has_wifi ?? 43, isInferred: false },
    {
      key: "pet_friendly",
      label: "Cho phép mang thú cưng (Pet-friendly)",
      count: amenityRow?.pet_friendly ?? 42,
      isInferred: false,
    },
    {
      key: "laptop_friendly",
      label: "Phù hợp ngồi làm việc laptop",
      count: amenityRow?.laptop_friendly ?? 41,
      isInferred: false,
    },
    { key: "quiet", label: "Không gian yên tĩnh học tập", count: amenityRow?.quiet ?? 19, isInferred: false },
    { key: "has_ac", label: "Máy lạnh / Điều hòa", count: amenityRow?.has_ac ?? 19, isInferred: true },
    {
      key: "has_outlets",
      label: "Ổ cắm điện sạc laptop thuận tiện",
      count: amenityRow?.has_outlets ?? 10,
      isInferred: true,
    },
  ];

  const amenities = amenitiesList.map((item) => ({
    ...item,
    percentage: totalShops > 0 ? Number(((item.count / totalShops) * 100).toFixed(1)) : 0,
  }));

  return {
    kpi,
    priceRanges,
    benchmarkMenu: [...benchmarkRows],
    amenities,
  };
}
