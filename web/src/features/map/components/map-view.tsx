"use client";

import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { AN_THUONG_CENTER, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, type MapPoint } from "../types";
import { AnThuongCorePolygon } from "./an-thuong-polygon";
import { MapControls, type TileLayerType } from "./map-controls";
import { MapMarkers } from "./map-markers";

import "../styles/leaflet-neubrutalism.css";

export interface MapViewProps {
  points: MapPoint[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectPoint: (placeId: string) => void;
}

const TILE_PROVIDERS: Record<TileLayerType, { url: string; attribution: string; subdomains?: string }> = {
  // 1. CARTO Voyager: Đẹp rực rỡ, hiển thị rõ nét tên đường, công viên, bờ biển, phố đi bộ
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  // 2. Esri World Imagery: Ảnh vệ tinh thực tế rõ nét từng tòa nhà và bãi biển Mỹ Khê
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
  },
  // 3. CARTO Positron: Sạch sẽ, phong cách tối giản
  positron: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
};

export function MapView({ points, selectedPlaceId, hoveredPlaceId, onSelectPoint }: MapViewProps) {
  const [layerType, setLayerType] = useState<TileLayerType>("voyager");
  const currentTile = TILE_PROVIDERS[layerType];

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
          key={layerType}
          attribution={currentTile.attribution}
          url={currentTile.url}
          subdomains={currentTile.subdomains || "abc"}
          maxZoom={MAX_ZOOM}
        />
        {/* Vùng lõi Phố Du lịch An Thượng */}
        <AnThuongCorePolygon />

        {/* Nút điều khiển: Đổi layer ảnh thật/vệ tinh + Reset toạ độ */}
        <MapControls currentLayer={layerType} onChangeLayer={setLayerType} />

        {/* Danh sách Markers */}
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
