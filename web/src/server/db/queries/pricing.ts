import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { distToBeachFrontM, fitOls, type TrainingRow } from "@/features/pricing/lib/regression";

import { CACHE_TAG_CAFES } from "../cache-tags";
import type { PricingAllShop, PricingBounds, PricingData, PricingDrinkData, PricingTrainingShop } from "../types";
import { getCafeSnapshot, getItemPriceSnapshot } from "./snapshot";

const TARGET_DRINKS = [
  { canonicalId: "bac_xiu", fallbackName: "Bạc xỉu" },
  { canonicalId: "ca_phe_muoi", fallbackName: "Cà phê muối" },
  { canonicalId: "cappuccino", fallbackName: "Cappuccino" },
] as const;

/**
 * Lấy dữ liệu hồi quy giá đồ uống cho 3 món chuẩn hóa: bạc xỉu, cà phê muối, cappuccino.
 * Dữ liệu được tính toán từ snapshot cached (getCafeSnapshot + getItemPriceSnapshot),
 * không thực hiện truy vấn DB bổ sung.
 */
export async function getPricingData(): Promise<PricingData> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAG_CAFES);

  const [cafes, prices] = await Promise.all([getCafeSnapshot(), getItemPriceSnapshot()]);

  const cafeMap = new Map(cafes.map((c) => [c.placeId, c]));

  const allShops: PricingAllShop[] = cafes
    .filter((c): c is typeof c & { lat: number; lng: number } => c.lat !== null && c.lng !== null)
    .map((c) => ({
      placeId: c.placeId,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
    }));

  let minLat = 16.035;
  let maxLat = 16.065;
  let minLng = 108.235;
  let maxLng = 108.255;

  if (allShops.length > 0) {
    minLat = Math.min(...allShops.map((s) => s.lat));
    maxLat = Math.max(...allShops.map((s) => s.lat));
    minLng = Math.min(...allShops.map((s) => s.lng));
    maxLng = Math.max(...allShops.map((s) => s.lng));
  }

  const bounds: PricingBounds = { minLat, maxLat, minLng, maxLng };

  const drinks: PricingDrinkData[] = TARGET_DRINKS.map(({ canonicalId, fallbackName }) => {
    const drinkPrices = prices.filter((p) => p.canonicalId === canonicalId);
    const seenPlaceIds = new Set<string>();
    const trainingRows: TrainingRow[] = [];
    const trainingShops: PricingTrainingShop[] = [];
    let displayName: string = fallbackName;

    for (const p of drinkPrices) {
      if (seenPlaceIds.has(p.placeId)) continue;
      seenPlaceIds.add(p.placeId);

      if (p.displayName && displayName === fallbackName) {
        displayName = p.displayName;
      }

      const cafe = cafeMap.get(p.placeId);
      if (!cafe || cafe.lat === null || cafe.lng === null || p.priceMin === null || p.priceMax === null) {
        continue;
      }

      const priceK = (p.priceMin + p.priceMax) / 2 / 1000;
      const distToBeachM = distToBeachFrontM(cafe.lat, cafe.lng);
      const hasCardPayment = Boolean(cafe.flags?.accepts_card || cafe.flags?.accepts_nfc);
      const hasWork = Boolean(cafe.flags?.laptop_friendly);

      trainingRows.push({ distToBeachM, hasCardPayment, hasWork, priceK });
      trainingShops.push({
        placeId: cafe.placeId,
        name: cafe.name,
        lat: cafe.lat,
        lng: cafe.lng,
        priceK,
        hasCardPayment,
        hasWork,
      });
    }

    const model = fitOls(trainingRows);

    return {
      canonicalId,
      displayName,
      model,
      shops: trainingShops,
    };
  });

  return {
    drinks,
    allShops,
    bounds,
  };
}
