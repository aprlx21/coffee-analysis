import type { PriceContribution } from "@/features/pricing";

export type LocationResolutionSource = "coordinates" | "shop-match" | "street-estimate" | "nominatim";

export interface ResolveLocationInput {
  address?: string;
  placeName?: string;
  lat?: number;
  lng?: number;
}

export interface ResolvedLocationSuccess {
  success: true;
  lat: number;
  lng: number;
  resolvedLabel: string;
  source: LocationResolutionSource;
  approximate: boolean;
}

export interface ResolvedLocationFailure {
  success: false;
  error: "MISSING_QUERY" | "LOCATION_NOT_FOUND";
  message: string;
}

export type ResolveLocationResult = ResolvedLocationSuccess | ResolvedLocationFailure;

export interface DrinkContributionItem {
  key: PriceContribution["key"];
  label: string;
  valueK: number;
  valueVND: number;
}

export interface NearestShopInfo {
  name: string;
  /** Link markdown dựng sẵn — model chép nguyên văn, không tự ghép placeId. */
  link: string;
  priceVND: number;
  distanceM: number;
}

export interface DrinkPriceSuggestionItem {
  canonicalId: "bac_xiu" | "ca_phe_muoi" | "cappuccino";
  displayName: string;
  recommended: number;
  lower: number;
  upper: number;
  n: number;
  looR2: number;
  reliability: "Tin cậy khá" | "Tham khảo" | "Độ tin cậy thấp";
  contributions: DrinkContributionItem[];
  nearestShops: NearestShopInfo[];
}

export interface SuggestDrinkPriceSuccess {
  success: true;
  location: {
    resolvedLabel: string;
    lat: number;
    lng: number;
    source: LocationResolutionSource;
    approximate: boolean;
  };
  distToBeachM: number;
  spatialCluster: string;
  competitorsIn200m: number;
  outsideDataRange: boolean;
  assumptions: {
    hasCardPayment: boolean;
    hasWork: boolean;
  };
  drinks: DrinkPriceSuggestionItem[];
  dinhGiaUrl: string;
}

export interface SuggestDrinkPriceFailure {
  success: false;
  error: string;
  message: string;
  dinhGiaUrl: string;
}

export type SuggestDrinkPriceOutput = SuggestDrinkPriceSuccess | SuggestDrinkPriceFailure;
