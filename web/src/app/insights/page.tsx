import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MarketInsightsPreview } from "@/features/analytics";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Coffee Insights & Báo cáo Thị trường (AI)",
  description:
    "Báo cáo thị trường & Phân tích cơ hội kinh doanh cho chủ quán do AI tổng hợp từ dữ liệu 115 quán cafe An Thượng.",
};

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/phan-tich"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 px-2.5 text-xs font-bold")}
          >
            <ArrowLeft className="mr-1 size-3.5 stroke-[2.5]" />
            Dữ liệu phân tích
          </Link>
          <Badge variant="default" className="text-xs font-extrabold uppercase">
            SẮP RA MẮT
          </Badge>
          <Badge variant="secondary" className="text-xs font-bold">
            <Sparkles className="mr-1 size-3 stroke-[2.5]" />
            AI INSIGHTS
          </Badge>
        </div>

        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Coffee Insights & Báo Cáo
        </h1>

        <p className="max-w-2xl text-base font-medium text-muted-foreground sm:text-lg">
          Báo cáo thị trường & Phân tích cơ hội kinh doanh cho chủ quán do AI tổng hợp từ dữ liệu thực tế hơn 115 quán
          cafe tại khu phố Tây An Thượng.
        </p>
      </div>

      {/* Mock Report Preview with Neubrutalism Overlay & SẮP RA MẮT Badge */}
      <MarketInsightsPreview />
    </div>
  );
}
