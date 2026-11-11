"use client";

import dynamic from "next/dynamic";

import { CoffeeRunningLoader } from "@/components/coffee-running-loader";
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
        <CoffeeRunningLoader
          size="md"
          title="Đang tải bản đồ An Thượng..."
          subtitle="Cappuccino Ninja đang kết nối toạ độ các quán cafe ☕"
        />
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
