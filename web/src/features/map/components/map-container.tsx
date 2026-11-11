"use client";

import dynamic from "next/dynamic";
import { Coffee, Loader2 } from "lucide-react";

import type { MapViewProps } from "./map-view";

function MapLoadingSkeleton() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden bg-muted">
      {/* Decorative background grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#000000 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 rounded-2xl glass-strong p-6 text-center shadow-glass-lg">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glass-sm">
          <Coffee className="size-6 stroke-[2]" />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-foreground">Đang tải bản đồ An Thượng</h3>
          <p className="text-xs font-medium text-muted-foreground">Đang kết nối toạ độ các quán cafe...</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Vui lòng đợi giây lát</span>
        </div>
      </div>
    </div>
  );
}

const DynamicMapView = dynamic<MapViewProps>(() => import("./map-view").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

export function MapWrapper(props: MapViewProps) {
  return <DynamicMapView {...props} />;
}
