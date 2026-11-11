"use client";

import { MapContainer, TileLayer } from "react-leaflet";

import { AN_THUONG_CENTER, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, type MapPoint } from "../types";
import { MapControls } from "./map-controls";
import { MapMarkers } from "./map-markers";

import "../styles/leaflet-neubrutalism.css";

export interface MapViewProps {
  points: MapPoint[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectPoint: (placeId: string) => void;
}

export function MapView({ points, selectedPlaceId, hoveredPlaceId, onSelectPoint }: MapViewProps) {
  return (
    <div className="relative size-full overflow-hidden bg-muted">
      <MapContainer
        center={AN_THUONG_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        className="z-0 size-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={MAX_ZOOM}
        />
        <MapControls />
        <MapMarkers
          points={points}
          selectedPlaceId={selectedPlaceId}
          hoveredPlaceId={hoveredPlaceId}
          onSelectPoint={onSelectPoint}
        />
      </MapContainer>
    </div>
  );
}
