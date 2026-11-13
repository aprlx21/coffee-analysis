"use client";

import dynamic from "next/dynamic";
import { CoffeeRunningLoader } from "@/components/coffee-running-loader";
import type { LatLng, PricingAllShop, PricingTrainingShop } from "../types";

export interface PricingMapContainerProps {
  allShops: PricingAllShop[];
  activeDrinkShops?: PricingTrainingShop[];
  pin: LatLng | null;
  onSetPin: (pin: LatLng) => void;
  distToBeachM: number | null;
}

function PricingMapLoadingSkeleton() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden bg-muted">
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
          title="Đang nạp bản đồ định giá..."
          subtitle="Đang chuẩn bị toạ độ các quán cafe An Thượng ☕"
        />
      </div>
    </div>
  );
}

const DynamicPricingMapView = dynamic<PricingMapContainerProps>(
  () => import("./pricing-map-view").then((mod) => mod.PricingMapView),
  {
    ssr: false,
    loading: () => <PricingMapLoadingSkeleton />,
  },
);

export function PricingMapContainer(props: PricingMapContainerProps) {
  return <DynamicPricingMapView {...props} />;
}
