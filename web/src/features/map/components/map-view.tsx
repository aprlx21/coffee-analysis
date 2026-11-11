"use client";

import React, { useRef } from "react";
import { LayersControl, MapContainer, TileLayer } from "react-leaflet";

import type { CafeCard } from "@/server/db";
import {
  AN_THUONG_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_LAYERS,
  type ColorMode,
  type DisplayMode,
} from "../lib/constants";
import { MapControls } from "./map-controls";
import { MapLegend } from "./map-legend";
import { MapMarkers } from "./map-markers";
import { MapOverlays } from "./map-overlays";

import "../styles/leaflet-glass.css";

export interface MapViewProps {
  cafes: CafeCard[];
  colorMode: ColorMode;
  displayMode: DisplayMode;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
  coreCount?: number;
}

export function MapView({
  cafes,
  colorMode,
  displayMode,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectCafe,
  coreCount = 68,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative size-full overflow-hidden bg-muted">
      <MapContainer
        center={AN_THUONG_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        className="z-0 size-full"
      >
        {/* Base Layer Switcher (L.control.layers, topright) */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={TILE_LAYERS[0].name}>
            <TileLayer
              attribution={TILE_LAYERS[0].attribution}
              url={TILE_LAYERS[0].url}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={TILE_LAYERS[1].name}>
            <TileLayer
              attribution={TILE_LAYERS[1].attribution}
              url={TILE_LAYERS[1].url}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={TILE_LAYERS[2].name}>
            <TileLayer
              attribution={TILE_LAYERS[2].attribution}
              url={TILE_LAYERS[2].url}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Lớp phủ bản đồ: Vành đai, Siêu lõi, Bờ biển Mỹ Khê */}
        <MapOverlays coreCount={coreCount} />

        {/* Markers quán cafe (Rời rạc hoặc Gom cụm) */}
        <MapMarkers
          cafes={cafes}
          colorMode={colorMode}
          displayMode={displayMode}
          selectedPlaceId={selectedPlaceId}
          hoveredPlaceId={hoveredPlaceId}
          onSelectCafe={onSelectCafe}
        />

        {/* Nút điều khiển Zoom + Về tâm An Thượng ở góc dưới trái */}
        <MapControls />
      </MapContainer>

      {/* Chú giải kéo thả (draggable glass legend) */}
      <MapLegend colorMode={colorMode} filteredCafes={cafes} containerRef={containerRef} />
    </div>
  );
}
