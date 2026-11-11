import type { CafeCard } from "@/server/db";
import type { ColorMode, DisplayMode, SpatialClusterKey } from "./lib/constants";

export type { CafeCard, ColorMode, DisplayMode, SpatialClusterKey };
export * from "./lib/constants";

export interface MapSyncState {
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  selectCafe: (placeId: string | null, shouldPanMap?: boolean) => void;
  hoverCafe: (placeId: string | null) => void;
}

export type AmenityFilterKey = "outdoor" | "wifi" | "ac" | "outlets" | "pet" | "quiet" | "parking" | "card" | "menu";

export interface MapFilterState {
  searchQuery: string;
  clusterFilter: "all" | SpatialClusterKey;
  amenities: AmenityFilterKey[];
  colorMode: ColorMode;
  displayMode: DisplayMode;
}
