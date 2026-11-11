import type { CafeCard, Facets, MapPoint } from "@/server/db";
import type { CafeFilters } from "@/features/cafes/schema";

export type { CafeCard, Facets, MapPoint };

export const AN_THUONG_CENTER: [number, number] = [16.0497, 108.244];
export const DEFAULT_ZOOM = 16;
export const MIN_ZOOM = 13;
export const MAX_ZOOM = 19;

export interface MapPageData {
  points: MapPoint[];
  cafes: CafeCard[];
  total: number;
  facets: Facets;
  filters: CafeFilters;
}

export interface MapSyncState {
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  selectCafe: (placeId: string | null, shouldPanMap?: boolean) => void;
  hoverCafe: (placeId: string | null) => void;
}
