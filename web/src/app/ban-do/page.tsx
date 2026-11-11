import { Suspense } from "react";
import type { Metadata } from "next";

import { CoffeeRunningLoader } from "@/components/coffee-running-loader";
import { parseCafeFilters } from "@/features/cafes/schema";
import { MapPageView } from "@/features/map";
import { getAllMapCafes } from "@/server/db";

export const metadata: Metadata = {
  title: "Bản đồ quán cafe An Thượng",
  description:
    "Bản đồ tương tác hơn 115 quán cafe tại khu phố Tây An Thượng Đà Nẵng với bộ lọc tiện ích và bảng giá chi tiết.",
};

function MapPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-2 sm:p-4 md:p-6">
      <div className="relative flex h-[calc(100dvh-3.5rem-5.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-border glass shadow-glass-card md:h-[calc(100vh-6rem)] md:flex-row">
        {/* Left skeleton (map) */}
        <div className="relative flex size-full items-center justify-center border-border bg-muted/60 md:w-[58%] md:border-r">
          <div className="flex flex-col items-center gap-3 rounded-2xl glass-strong p-6 text-center shadow-glass-lg">
            <CoffeeRunningLoader
              size="md"
              title="Đang tải bản đồ An Thượng..."
              subtitle="Cappuccino Ninja đang đồng bộ toạ độ 115 quán cafe ☕"
            />
          </div>
        </div>

        {/* Right skeleton (list) */}
        <div className="hidden size-full flex-col bg-background/50 p-4 md:flex md:w-[42%]">
          <div className="mb-4 h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-border glass p-3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function BanDoContent() {
  // Tải danh sách toàn bộ quán trên bản đồ (mặc định lấy tất cả quán có lat/lng)
  const allCafes = await getAllMapCafes(parseCafeFilters({}));

  return <MapPageView cafes={allCafes} />;
}

export default function BanDoPage() {
  return (
    <Suspense fallback={<MapPageSkeleton />}>
      <BanDoContent />
    </Suspense>
  );
}
