"use client";

import { Polygon, Polyline, Tooltip } from "react-leaflet";

import { BOUNDARY_POLYGON, COASTLINE_POLYLINE, ULTRA_CORE_POLYGON } from "../lib/constants";

interface MapOverlaysProps {
  coreCount?: number;
}

export function MapOverlays({ coreCount = 68 }: MapOverlaysProps) {
  return (
    <>
      {/* 1. Vành đai Khu du lịch An Thượng */}
      <Polygon
        positions={BOUNDARY_POLYGON}
        pathOptions={{
          color: "#3b82f6",
          weight: 1.5,
          dashArray: "6, 6",
          fillColor: "#93c5fd",
          fillOpacity: 0.04,
        }}
      >
        <Tooltip sticky direction="top" className="glass-area-tooltip">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="size-2 rounded-full bg-blue-500 ring-2 ring-white/60" />
            <span>VÀNH ĐAI KHU DU LỊCH AN THƯỢNG</span>
          </div>
        </Tooltip>
      </Polygon>

      {/* 2. Siêu Lõi Phố Đi Bộ & Đêm */}
      <Polygon
        positions={ULTRA_CORE_POLYGON}
        pathOptions={{
          color: "#ea580c",
          weight: 2.5,
          dashArray: "4, 4",
          fillColor: "#fde047",
          fillOpacity: 0.18,
        }}
      >
        <Tooltip sticky direction="top" className="glass-area-tooltip">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="size-2 rounded-full bg-orange-600 ring-2 ring-white/60" />
            <span>SIÊU LÕI PHỐ ĐI BỘ & ĐÊM — đi bộ dạo đêm 18h–23h ({coreCount} quán)</span>
          </div>
        </Tooltip>
      </Polygon>

      {/* 3. Đường bờ biển Bãi tắm Mỹ Khê */}
      <Polyline
        positions={COASTLINE_POLYLINE}
        pathOptions={{
          color: "#0ea5e9",
          weight: 5,
          dashArray: "10, 8",
          opacity: 0.8,
        }}
      >
        <Tooltip permanent direction="right" offset={[10, 0]} className="glass-area-tooltip">
          <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
            <span>🌊 BÃI BIỂN MỸ KHÊ</span>
          </div>
        </Tooltip>
      </Polyline>
    </>
  );
}
