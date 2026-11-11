import type { CafeCard } from "@/server/db";
import {
  INDUSTRY_GROUPS,
  PRICE_TIERS,
  RATING_TIERS,
  SPATIAL_CLUSTERS,
  ULTRA_CORE_POLYGON,
  type ColorMode,
  type IndustryGroupKey,
  type PriceTierKey,
  type RatingTierKey,
  type SpatialClusterKey,
} from "./constants";

/**
 * Thuật toán Ray-Casting kiểm tra tọa độ [lat, lng] có nằm trong đa giác hay không.
 */
export function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  const n = polygon.length;
  let p1 = polygon[0];

  for (let i = 1; i <= n; i++) {
    const p2 = polygon[i % n];
    if (minVal(p1[0], p2[0]) < lat && lat <= maxVal(p1[0], p2[0])) {
      if (lng <= maxVal(p1[1], p2[1])) {
        const xinters = p1[0] !== p2[0] ? ((lat - p1[0]) * (p2[1] - p1[1])) / (p2[0] - p1[0]) + p1[1] : p1[1];
        if (p1[1] === p2[1] || lng <= xinters) {
          inside = !inside;
        }
      }
    }
    p1 = p2;
  }

  return inside;
}

function minVal(a: number, b: number): number {
  return a < b ? a : b;
}

function maxVal(a: number, b: number): number {
  return a > b ? a : b;
}

export interface ClassificationResult {
  key: string;
  label: string;
  shortLabel?: string;
  color: string;
}

/**
 * Phân cụm không gian theo tọa độ địa lý.
 * Thứ tự xét hình học tất định:
 * 1. Siêu Lõi Phố Đi Bộ & Đêm: nằm trong đa giác ULTRA_CORE_POLYGON
 * 2. Trục Mặt Biển: lng >= 108.2475
 * 3. Dải Dân Sinh – Sinh Viên (Phía Tây): lng < 108.2420
 * 4. Hành Lang Thương Mại Phía Bắc: phần còn lại
 */
export function spatialCluster(
  lat: number | null,
  lng: number | null,
): ClassificationResult & { key: SpatialClusterKey } {
  if (lat === null || lng === null) {
    return SPATIAL_CLUSTERS.north;
  }

  if (pointInPolygon(lat, lng, ULTRA_CORE_POLYGON)) {
    return SPATIAL_CLUSTERS.core;
  }

  if (lng >= 108.2475) {
    return SPATIAL_CLUSTERS.beach;
  }

  if (lng < 108.242) {
    return SPATIAL_CLUSTERS.west;
  }

  return SPATIAL_CLUSTERS.north;
}

/**
 * Phân loại nhóm ngành hàng từ `mainCategory`.
 */
export function industryGroup(mainCategory: string | null): ClassificationResult & { key: IndustryGroupKey } {
  if (!mainCategory) {
    return INDUSTRY_GROUPS.specialty_coffee;
  }

  const cat = mainCategory.trim();

  // Bar, Pub, Espresso bar, Sports bar, Irish pub
  if (/^(bar|pub|espresso bar|sports bar|irish pub)/i.test(cat)) {
    return INDUSTRY_GROUPS.bar;
  }

  // Nhà hàng, bistro
  if (/restaurant|bistro/i.test(cat)) {
    return INDUSTRY_GROUPS.restaurant;
  }

  // Cafe, Bakery, Juice shop, Internet cafe
  if (/^(cafe|bakery|juice shop|internet cafe)/i.test(cat)) {
    return INDUSTRY_GROUPS.cafe_bakery;
  }

  // Còn lại (Coffee shop, Coffee stand, Coworking...)
  return INDUSTRY_GROUPS.specialty_coffee;
}

/**
 * Phân khúc giá dựa vào giá đồ uống trung vị (`drinkPriceMedian`).
 */
export function priceTier(drinkPriceMedian: number | null): ClassificationResult & { key: PriceTierKey } {
  if (drinkPriceMedian === null || drinkPriceMedian === undefined) {
    return PRICE_TIERS.unknown;
  }

  if (drinkPriceMedian < 35000) {
    return PRICE_TIERS.budget;
  }

  if (drinkPriceMedian <= 50000) {
    return PRICE_TIERS.mid;
  }

  return PRICE_TIERS.high;
}

/**
 * Phân loại đánh giá sao (`rating`).
 */
export function ratingTier(rating: number | null): ClassificationResult & { key: RatingTierKey } {
  if (rating === null || rating === undefined || rating === 0) {
    return RATING_TIERS.unrated;
  }

  if (rating >= 4.7) {
    return RATING_TIERS.excellent;
  }

  if (rating >= 4.3) {
    return RATING_TIERS.good;
  }

  if (rating > 0) {
    return RATING_TIERS.average;
  }

  return RATING_TIERS.unrated;
}

/**
 * Lấy thông tin màu và nhãn hiển thị cho 1 quán cafe theo chế độ tô màu đang chọn.
 */
export function getCafeVisual(cafe: CafeCard, colorMode: ColorMode): ClassificationResult {
  switch (colorMode) {
    case "spatial":
      return spatialCluster(cafe.lat, cafe.lng);
    case "price":
      return priceTier(cafe.drinkPriceMedian);
    case "industry":
      return industryGroup(cafe.mainCategory);
    case "rating":
      return ratingTier(cafe.rating);
  }
}

/**
 * Chuẩn hóa chuỗi tiếng Việt: Bỏ dấu, chuyển chữ thường, thay thế đ/Đ.
 * Dùng cho ô tìm kiếm tức thì phía client.
 */
export function stripVietnamese(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
