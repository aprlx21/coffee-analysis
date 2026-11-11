import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lightbulb, Map } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BenchmarkMenu, KpiTiles, PriceDistribution, TopAmenities } from "@/features/analytics";
import { cn } from "@/lib/utils";
import { getAnalyticsData } from "@/server/db";

export const metadata: Metadata = {
  title: "Phân tích Thị trường Cafe An Thượng",
  description:
    "Thống kê phổ giá đồ uống, phân bố khoảng giá và mật độ tiện ích làm việc, máy lạnh, wifi tại hơn 115 quán cafe khu phố Tây An Thượng Đà Nẵng.",
};

export default async function PhanTichPage() {
  const data = await getAnalyticsData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="text-xs font-bold tracking-wide">
            ĐÀ NẴNG · AN THƯỢNG
          </Badge>
          <Badge variant="secondary" className="text-xs font-bold">
            DỮ LIỆU THỰC TẾ 100%
          </Badge>
          <Badge variant="outline" className="text-xs font-bold">
            {data.kpi.totalShops} QUÁN CAFE
          </Badge>
        </div>

        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Phân Tích Thị Trường & Bảng Giá
        </h1>

        <p className="max-w-3xl text-base font-medium text-muted-foreground sm:text-lg">
          Báo cáo thống kê dựa trên dữ liệu Google Maps và thực đơn OCR thực tế tại khu phố Tây An Thượng. Không sử dụng
          dữ liệu mô phỏng.
        </p>
      </div>

      {/* 1. KPI Tiles Block */}
      <section className="mb-8" aria-label="Chỉ số quan trọng">
        <KpiTiles kpi={data.kpi} />
      </section>

      {/* 2 & 3. Price Distribution & Amenities Analysis Grid */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Price Range Distribution */}
        <section aria-label="Phân bố khoảng giá">
          <PriceDistribution priceRanges={data.priceRanges} totalShops={data.kpi.totalShops} />
        </section>

        {/* Top Amenities */}
        <section aria-label="Tiện ích phổ biến">
          <TopAmenities amenities={data.amenities} totalShops={data.kpi.totalShops} />
        </section>
      </div>

      {/* 4. Market Benchmark Menu Table */}
      <section className="mb-8" aria-label="Bảng giá đồ uống điển hình">
        <BenchmarkMenu items={data.benchmarkMenu} />
      </section>

      {/* Quick Navigation Footer Banner */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-lg border-2 border-border bg-card p-6 shadow-hard-card sm:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 stroke-[2.5] text-foreground" />
            <h3 className="font-heading text-base font-extrabold text-foreground">
              Tìm hiểu sâu hơn về cơ hội kinh doanh F&B?
            </h3>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
            Đọc báo cáo thị trường chuyên sâu hoặc hỏi trực tiếp trợ lý AI.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            href="/ban-do"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 font-bold sm:flex-initial")}
          >
            <Map className="mr-1.5 size-4 stroke-[2.5]" />
            Xem Bản Đồ
          </Link>
          <Link
            href="/insights"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "flex-1 font-bold sm:flex-initial")}
          >
            Xem Insights
            <ArrowRight className="ml-1.5 size-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
