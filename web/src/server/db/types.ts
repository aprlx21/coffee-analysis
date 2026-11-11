/** Kiểu dữ liệu trả về từ DAL (JSON-serializable). */

export interface CafeCard {
  placeId: string;
  name: string;
  mainCategory: string | null;
  address: string | null;
  shortAddress: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  reviews: number | null;
  priceRange: string | null;
  featuredImage: string | null;
  workScore: number | null;
  drinkPriceMin: number | null;
  drinkPriceMedian: number | null;
  drinkPriceMax: number | null;
  hasMenu: boolean;
  hasWifi: boolean;
  laptopFriendly: boolean;
  hasAc: boolean;
  hasOutlets: boolean;
  outdoorSeating: boolean;
  petFriendly: boolean;
  quiet: boolean;
}

export interface Cafe extends CafeCard {
  categories: string[];
  phone: string | null;
  website: string | null;
  mapsLink: string | null;
  description: string | null;
  hours: unknown;
  closedOn: string | null;
  reviewsPerRating: unknown;
  reviewKeywords: unknown;
  featuredReviews: unknown;
  menuItemCount: number;
  /** Mọi cờ boolean của view, key = tên cột snake_case (has_wifi, ...). */
  flags: Record<string, boolean>;
  /** 'review_keywords' | 'review_text' | null — nguồn suy luận (hiện nhãn "suy luận từ review"). */
  acSource: string | null;
  outletsSource: string | null;
}

export interface CafeListResult {
  items: CafeCard[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface MenuItem {
  canonicalId: string;
  displayName: string;
  priceMin: number | null;
  priceMax: number | null;
  matchUncertain: boolean;
}

export interface MenuGroup {
  key: string;
  label: string;
  items: MenuItem[];
}

export interface Facets {
  total: number;
  amenities: Record<string, number>;
  categories: { value: string; count: number }[];
  priceRanges: { value: string; count: number }[];
}

export interface CanonicalItem {
  canonicalId: string;
  displayName: string;
}

export interface MapPoint {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  rating: number | null;
  featuredImage: string | null;
  priceRange: string | null;
}

export interface AnalyticsKpi {
  totalShops: number;
  avgRating: number;
  wifiCount: number;
  wifiPercent: number;
  laptopFriendlyCount: number;
  laptopFriendlyPercent: number;
  menuOcrCount: number;
  menuPriceCount: number;
}

export interface PriceRangeStat {
  range: string;
  label: string;
  count: number;
  percentage: number;
}

export interface BenchmarkDrinkItem {
  canonicalId: string;
  displayName: string;
  shopCount: number;
  priceMin: number;
  priceMedian: number;
  priceMax: number;
}

export interface AmenityStat {
  key: string;
  label: string;
  count: number;
  percentage: number;
  isInferred?: boolean;
}

export interface AnalyticsData {
  kpi: AnalyticsKpi;
  priceRanges: PriceRangeStat[];
  benchmarkMenu: BenchmarkDrinkItem[];
  amenities: AmenityStat[];
}
