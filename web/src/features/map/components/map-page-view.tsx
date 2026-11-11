"use client";

import { useState } from "react";

import type { MapPageData } from "../types";
import { MapWrapper } from "./map-container";
import { MapListPanel } from "./map-list-panel";
import { MapMobileDrawer } from "./map-mobile-drawer";

export function MapPageView({ points, cafes, total, facets, filters }: MapPageData) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  const handleSelectCafe = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  const handleHoverCafe = (placeId: string | null) => {
    setHoveredPlaceId(placeId);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] p-2 sm:p-4 md:p-6">
      {/* 2-panel Dribbble container */}
      <div className="relative flex h-[calc(100dvh-3.5rem-5.5rem)] w-full flex-col overflow-hidden rounded-xl border-2 border-border bg-card shadow-hard-card md:h-[calc(100vh-6rem)] md:flex-row">
        {/* Left Panel: Leaflet Map (~58%) */}
        <div className="relative size-full overflow-hidden border-border md:w-[58%] md:border-r-2">
          <MapWrapper
            points={points}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectPoint={handleSelectCafe}
          />

          {/* Mobile Bottom Floating Drawer (< 768px) */}
          <MapMobileDrawer
            cafes={cafes}
            total={total}
            facets={facets}
            filters={filters}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectCafe={handleSelectCafe}
            onHoverCafe={handleHoverCafe}
          />
        </div>

        {/* Right Panel: Cafe cards list (~42%) */}
        <div className="hidden size-full overflow-hidden md:flex md:w-[42%] md:flex-col">
          <MapListPanel
            cafes={cafes}
            total={total}
            facets={facets}
            filters={filters}
            selectedPlaceId={selectedPlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectCafe={handleSelectCafe}
            onHoverCafe={handleHoverCafe}
          />
        </div>
      </div>
    </div>
  );
}
