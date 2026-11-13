import type {
  FittedModel,
  NearestBeachPoint,
  PriceContribution,
  PriceSuggestion,
  ReliabilityInfo,
  ReliabilityLevel,
} from "./lib/regression";
import type { PricingAllShop, PricingBounds, PricingData, PricingDrinkData, PricingTrainingShop } from "@/server/db";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface PricingState {
  pin: LatLng | null;
  hasCardPayment: boolean;
  hasWork: boolean;
  selectedDrinkId: string;
}

export type {
  FittedModel,
  NearestBeachPoint,
  PriceContribution,
  PriceSuggestion,
  PricingAllShop,
  PricingBounds,
  PricingData,
  PricingDrinkData,
  PricingTrainingShop,
  ReliabilityInfo,
  ReliabilityLevel,
};
