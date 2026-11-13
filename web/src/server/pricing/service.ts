import "server-only";

import { distanceM, distToBeachFrontM, getReliability, suggestPrice } from "@/features/pricing";
import { getCafeSnapshot, getPricingData } from "@/server/db";

import { resolveLocation } from "./location-resolver";
import type { DrinkPriceSuggestionItem, SuggestDrinkPriceOutput } from "./types";

const ULTRA_CORE_POLYGON: [number, number][] = [
  [16.0525, 108.2468],
  [16.0475, 108.2474],
  [16.0463, 108.244],
  [16.0513, 108.2422],
];

function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  const n = polygon.length;
  let p1 = polygon[0];
  for (let i = 1; i <= n; i++) {
    const p2 = polygon[i % n];
    if (Math.min(p1[0], p2[0]) < lat && lat <= Math.max(p1[0], p2[0])) {
      if (lng <= Math.max(p1[1], p2[1])) {
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

function getSpatialClusterLabel(lat: number, lng: number): string {
  if (pointInPolygon(lat, lng, ULTRA_CORE_POLYGON)) {
    return "Siêu Lõi Phố Đi Bộ & Đêm";
  }
  if (lng >= 108.2475) {
    return "Trục Mặt Biển";
  }
  if (lng < 108.242) {
    return "Dải Dân Sinh – Sinh Viên (Phía Tây)";
  }
  return "Hành Lang Thương Mại Phía Bắc";
}

export interface SuggestDrinkPriceServiceOptions {
  address?: string;
  placeName?: string;
  lat?: number;
  lng?: number;
  hasCardPayment?: boolean;
  hasWork?: boolean;
  drinks?: ("bac_xiu" | "ca_phe_muoi" | "cappuccino")[];
}

/**
 * Dịch vụ gợi ý định giá đồ uống dựa trên mô hình hồi quy OLS và địa chỉ/vị trí mặt bằng.
 */
export async function suggestDrinkPricesService(
  options: SuggestDrinkPriceServiceOptions,
): Promise<SuggestDrinkPriceOutput> {
  const {
    address,
    placeName,
    lat,
    lng,
    hasCardPayment = false,
    hasWork = false,
    drinks = ["bac_xiu", "ca_phe_muoi", "cappuccino"],
  } = options;

  const [pricingData, cafes] = await Promise.all([getPricingData(), getCafeSnapshot()]);

  const resolved = await resolveLocation({ address, placeName, lat, lng }, cafes);

  if (!resolved.success) {
    return {
      success: false,
      error: resolved.error,
      message: resolved.message,
      dinhGiaUrl: "/dinh-gia",
    };
  }

  const distToBeachM = Math.round(distToBeachFrontM(resolved.lat, resolved.lng));
  const spatialCluster = getSpatialClusterLabel(resolved.lat, resolved.lng);

  // Số lượng đối thủ trong bán kính 200m
  const competitorsIn200m = pricingData.allShops.filter(
    (s) => distanceM(resolved.lat, resolved.lng, s.lat, s.lng) <= 200,
  ).length;

  // Cảnh báo vị trí ngoại suy (ngoài phạm vi khảo sát mở rộng 150m hoặc nằm phía biển)
  const LAT_PAD_150M = 0.00135;
  const LNG_PAD_150M = 0.0014;
  const outsideLat =
    resolved.lat < pricingData.bounds.minLat - LAT_PAD_150M || resolved.lat > pricingData.bounds.maxLat + LAT_PAD_150M;
  const outsideLng =
    resolved.lng < pricingData.bounds.minLng - LNG_PAD_150M || resolved.lng > pricingData.bounds.maxLng + LNG_PAD_150M;
  const outsideDataRange = outsideLat || outsideLng || distToBeachM < 0;

  const selectedDrinkSet = new Set(drinks);
  const drinkResults: DrinkPriceSuggestionItem[] = [];

  for (const drink of pricingData.drinks) {
    if (!selectedDrinkSet.has(drink.canonicalId as "bac_xiu" | "ca_phe_muoi" | "cappuccino")) {
      continue;
    }
    if (!drink.model) {
      continue;
    }

    const suggestion = suggestPrice(drink.model, {
      distToBeachM,
      hasCardPayment,
      hasWork,
    });

    const reliabilityInfo = getReliability(drink.model.looR2);

    const contributionLabels: Record<string, string> = {
      intercept: "Mức giá cơ sở (hệ số chặn OLS)",
      distToBeachM: `Cự ly ra trục biển (${distToBeachM} m)`,
      hasCardPayment: hasCardPayment ? "Có thanh toán thẻ / NFC" : "Không thanh toán thẻ",
      hasWork: hasWork ? "Định vị làm việc laptop" : "Không định vị làm việc laptop",
    };

    const contributions = suggestion.contributions.map((c) => ({
      key: c.key,
      label: contributionLabels[c.key] || c.key,
      valueK: Math.round(c.valueK * 10) / 10,
      valueVND: Math.round(c.valueK * 1000),
    }));

    // 3 quán gần nhất thực tế bán món này
    const nearestShops = drink.shops
      .map((shop) => ({
        name: shop.name,
        link: `**[${shop.name}](/quan/${shop.placeId})**`,
        priceVND: Math.round(shop.priceK * 1000),
        distanceM: Math.round(distanceM(resolved.lat, resolved.lng, shop.lat, shop.lng)),
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 3);

    drinkResults.push({
      canonicalId: drink.canonicalId as "bac_xiu" | "ca_phe_muoi" | "cappuccino",
      displayName: drink.displayName,
      recommended: suggestion.recommended,
      lower: suggestion.lower,
      upper: suggestion.upper,
      n: drink.model.n,
      looR2: Math.round(drink.model.looR2 * 1000) / 1000,
      reliability: reliabilityInfo.shortLabel,
      contributions,
      nearestShops,
    });
  }

  return {
    success: true,
    location: {
      resolvedLabel: resolved.resolvedLabel,
      lat: resolved.lat,
      lng: resolved.lng,
      source: resolved.source,
      approximate: resolved.approximate,
    },
    distToBeachM,
    spatialCluster,
    competitorsIn200m,
    outsideDataRange,
    assumptions: {
      hasCardPayment,
      hasWork,
    },
    drinks: drinkResults,
    dinhGiaUrl: "/dinh-gia",
  };
}
