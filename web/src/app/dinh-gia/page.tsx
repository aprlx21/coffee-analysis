import { Suspense } from "react";
import type { Metadata } from "next";

import { CoffeeRunningLoader } from "@/components/coffee-running-loader";
import { PricingPageView } from "@/features/pricing";
import { getPricingData } from "@/server/db";

export const metadata: Metadata = {
  title: "Định giá đồ uống cho quán cafe mới | Cafe An Thượng",
  description:
    "Mô phỏng định vị mặt bằng và gợi ý giá bán 3 thức uống chủ lực (Bạc xỉu, Cà phê muối, Cappuccino) tại khu phố du lịch An Thượng Đà Nẵng bằng mô hình hồi quy OLS từ dữ liệu thực tế.",
};

function PricingPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-8 w-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12">
        {/* Left skeleton (map + context) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="relative flex h-[360px] w-full items-center justify-center rounded-2xl border border-border glass bg-muted/60 shadow-glass-card sm:h-[420px] lg:h-[480px]">
            <div className="flex flex-col items-center gap-3 rounded-2xl glass-strong p-6 text-center shadow-glass-lg">
              <CoffeeRunningLoader
                size="md"
                title="Đang nạp mô hình định giá..."
                subtitle="Đang chuẩn bị dữ liệu hồi quy OLS cho các quán An Thượng ☕"
              />
            </div>
          </div>
          <div className="h-48 animate-pulse rounded-2xl border border-border glass bg-muted/30 p-4" />
        </div>

        {/* Right skeleton (controls + cards) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="h-40 animate-pulse rounded-2xl border border-border glass bg-muted/30 p-4" />
          <div className="space-y-3">
            <div className="h-48 animate-pulse rounded-2xl border border-border glass bg-muted/30 p-4" />
            <div className="h-48 animate-pulse rounded-2xl border border-border glass bg-muted/30 p-4" />
            <div className="h-48 animate-pulse rounded-2xl border border-border glass bg-muted/30 p-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function DinhGiaContent() {
  const pricingData = await getPricingData();
  return <PricingPageView data={pricingData} />;
}

export default function DinhGiaPage() {
  return (
    <Suspense fallback={<PricingPageSkeleton />}>
      <DinhGiaContent />
    </Suspense>
  );
}
