"use client";

import { useMemo, useState } from "react";

import type { CafeCard } from "@/server/db";
import { spatialCluster, stripVietnamese } from "../lib/classify";
import type { AmenityFilterKey, ColorMode, DisplayMode, SpatialClusterKey } from "../types";
import { MapWrapper } from "./map-container";
import { MapListPanel } from "./map-list-panel";
import { MapMobileDrawer } from "./map-mobile-drawer";
import { MapToolbar } from "./map-toolbar";
import { MapTrafficSheet } from "./map-traffic-sheet";

export interface MapPageViewProps {
  cafes: CafeCard[];
}

export function MapPageView({ cafes }: MapPageViewProps) {
  // Client-side instant filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterFilter, setClusterFilter] = useState<"all" | SpatialClusterKey>("all");
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityFilterKey[]>([]);
  const [colorMode, setColorMode] = useState<ColorMode>("spatial");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("points");

  // Selection & hover sync
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [trafficOpen, setTrafficOpen] = useState(false);

  const handleSelectCafe = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  const handleHoverCafe = (placeId: string | null) => {
    setHoveredPlaceId(placeId);
  };

  const handleToggleAmenity = (amenity: AmenityFilterKey) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]));
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setClusterFilter("all");
    setSelectedAmenities([]);
  };

  // Pre-calculate cluster distribution on the total dataset
  const clusterCounts = useMemo(() => {
    const counts: Record<"all" | SpatialClusterKey, number> = {
      all: cafes.length,
      core: 0,
      beach: 0,
      west: 0,
      north: 0,
    };
    for (const c of cafes) {
      const cl = spatialCluster(c.lat, c.lng);
      counts[cl.key] = (counts[cl.key] || 0) + 1;
    }
    return counts;
  }, [cafes]);

  // Memoize filtered cafes based on search, cluster, and amenities (AND logic)
  const filteredCafes = useMemo(() => {
    const cleanQuery = stripVietnamese(searchQuery);

    return cafes.filter((cafe) => {
      // 1. Cluster Filter
      if (clusterFilter !== "all") {
        const cluster = spatialCluster(cafe.lat, cafe.lng);
        if (cluster.key !== clusterFilter) return false;
      }

      // 2. Amenities (AND logic)
      for (const amenity of selectedAmenities) {
        switch (amenity) {
          case "outdoor":
            if (!cafe.outdoorSeating) return false;
            break;
          case "wifi":
            if (!cafe.hasWifi && !cafe.laptopFriendly) return false;
            break;
          case "ac":
            if (!cafe.hasAc) return false;
            break;
          case "outlets":
            if (!cafe.hasOutlets) return false;
            break;
          case "pet":
            if (!cafe.petFriendly) return false;
            break;
        }
      }

      // 3. Search query
      if (cleanQuery) {
        const cluster = spatialCluster(cafe.lat, cafe.lng);
        const searchable = stripVietnamese(
          `${cafe.name} ${cafe.address ?? ""} ${cafe.shortAddress ?? ""} ${cafe.mainCategory ?? ""} ${cluster.label} ${cluster.shortLabel}`,
        );
        if (!searchable.includes(cleanQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [cafes, clusterFilter, selectedAmenities, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-[1600px] p-2 sm:p-4 md:p-6">
      {/* 2-panel Soft Glass Container */}
      <div className="relative flex h-[calc(100dvh-3.5rem-5.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-border glass shadow-glass-card md:h-[calc(100vh-6rem)] md:flex-row">
        {/* Left Panel: Leaflet Map (~58%) */}
        <div className="relative size-full overflow-hidden border-border md:w-[58%] md:border-r">
          {/* Glass Toolbar floating on map */}
          <MapToolbar
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            colorMode={colorMode}
            onColorModeChange={setColorMode}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            clusterFilter={clusterFilter}
            onClusterFilterChange={setClusterFilter}
            clusterCounts={clusterCounts}
            selectedAmenities={selectedAmenities}
            onToggleAmenity={handleToggleAmenity}
            totalFiltered={filteredCafes.length}
            totalAll={cafes.length}
            onOpenTraffic={() => setTrafficOpen(true)}
          />

          <MapWrapper
            cafes={filteredCafes}
            colorMode={colorMode}
            displayMode={displayMode}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectCafe={handleSelectCafe}
            coreCount={clusterCounts.core}
          />

          {/* Mobile Bottom Floating Drawer (< 768px) */}
          <MapMobileDrawer
            cafes={filteredCafes}
            total={filteredCafes.length}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectCafe={handleSelectCafe}
            onHoverCafe={handleHoverCafe}
          />
        </div>

        {/* Right Panel: Cafe cards list (~42%) */}
        <div className="hidden size-full overflow-hidden md:flex md:w-[42%] md:flex-col">
          <MapListPanel
            cafes={filteredCafes}
            total={filteredCafes.length}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectCafe={handleSelectCafe}
            onHoverCafe={handleHoverCafe}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* 24-Hour Foot-traffic Sheet (Monday -> Sunday) */}
      <MapTrafficSheet
        open={trafficOpen}
        onOpenChange={setTrafficOpen}
        selectedCafe={selectedPlaceId ? cafes.find((c) => c.placeId === selectedPlaceId) : null}
      />
    </div>
  );
}
