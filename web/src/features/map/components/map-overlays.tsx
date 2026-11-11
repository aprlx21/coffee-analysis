"use client";

import { Polygon, Polyline, Tooltip } from "react-leaflet";

import { BOUNDARY_POLYGON, COASTLINE_POLYLINE, ULTRA_CORE_POLYGON } from "../lib/constants";

interface MapOverlaysProps {
  coreCount?: number;
  isSatellite?: boolean;
}

export function MapOverlays({ coreCount = 68, isSatellite = false }: MapOverlaysProps) {
  return (
    <>
      {/* 1. Vành đai Khu du lịch An Thượng */}
      <Polygon
        positions={BOUNDARY_POLYGON}
        pathOptions={{
          color: isSatellite ? "#60a5fa" : "#2563eb",
          weight: isSatellite ? 2.5 : 2,
          dashArray: "6, 6",
          fillColor: "#60a5fa",
          fillOpacity: isSatellite ? 0.08 : 0.04,
        }}
      >
        <Tooltip sticky direction="top" className="glass-area-tooltip">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="size-2 rounded-full bg-blue-400 ring-2 ring-white/60" />
            <span>VÀNH ĐAI KHU DU LỊCH AN THƯỢNG</span>
          </div>
        </Tooltip>
      </Polygon>

      {/* 2. Siêu Lõi Phố Đi Bộ & Đêm */}
      <Polygon
        positions={ULTRA_CORE_POLYGON}
        pathOptions={{
          color: isSatellite ? "#fb923c" : "#ea580c",
          weight: isSatellite ? 3.5 : 2.5,
          dashArray: "4, 4",
          fillColor: isSatellite ? "#fbbf24" : "#fde047",
          fillOpacity: isSatellite ? 0.24 : 0.18,
        }}
      >
        <Tooltip sticky direction="top" className="glass-area-tooltip">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="size-2 rounded-full bg-amber-400 ring-2 ring-white/60" />
            <span>SIÊU LÕI PHỐ ĐI BỘ & ĐÊM — đi bộ dạo đêm 18h–23h ({coreCount} quán)</span>
          </div>
        </Tooltip>
      </Polygon>

      {/* 3. Đường bờ biển Bãi tắm Mỹ Khê */}
      <Polyline
        positions={COASTLINE_POLYLINE}
        pathOptions={{
          color: isSatellite ? "#38bdf8" : "#0284c7",
          weight: isSatellite ? 6 : 5,
          dashArray: "10, 8",
          opacity: 0.9,
        }}
      >
        <Tooltip permanent direction="right" offset={[10, 0]} className="glass-area-tooltip">
          <div className="flex items-center gap-1.5 font-bold text-sky-300">
            <span>🌊 BÃI BIỂN MỸ KHÊ</span>
          </div>
        </Tooltip>
      </Polyline>
    </>
  );
}
