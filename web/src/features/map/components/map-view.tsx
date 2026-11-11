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
        {/* Bản đồ phố CARTO Voyager tiêu chuẩn: Đẹp, rõ nét tên đường, công viên, bờ biển */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={MAX_ZOOM}
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
