"use client";

import { MapContainer, TileLayer } from "react-leaflet";

import { AN_THUONG_CENTER, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, type MapPoint } from "../types";
import { AnThuongCorePolygon } from "./an-thuong-polygon";
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
        {/*
          Esri World Street Map — không cần API key.
          KHÔNG dùng basemaps.cartocdn.com: CARTO đã bắt buộc API key, tile trả về hình chữ "API KEY REQUIRED".
        */}
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, OpenStreetMap contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          maxZoom={MAX_ZOOM}
          maxNativeZoom={18}
        />

        {/* Vùng lõi Phố Du lịch An Thượng */}
        <AnThuongCorePolygon />

        {/* Nút điều khiển: Zoom in/out + Reset về tâm An Thượng */}
        <MapControls />

        {/* Danh sách Markers quán cafe */}
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
