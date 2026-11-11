import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";

import { getMarketInsightsContent } from "@/ai";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Insights · Báo cáo Thị trường F&B An Thượng",
  description:
    "Báo cáo thị trường và cơ hội kinh doanh cho chủ quán, tổng hợp từ dữ liệu 115 quán cafe khu phố Tây An Thượng, Đà Nẵng.",
};

const STATS = [
  { value: "115", label: "quán khảo sát" },
  { value: "6.107", label: "mức giá từ menu" },
  { value: "764", label: "giá chuẩn hoá" },
  { value: "73", label: "quán có giờ đông khách" },
];

export default function InsightsPage() {
  // Bỏ tiêu đề H1 và dòng phụ đề của file gốc — trang đã có tiêu đề riêng.
  const report = getMarketInsightsContent()
    .replace(/^# .*\n(\*.*\*\n)*/, "")
    .replace(/^\s*---\s*\n/, "");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="text-xs font-bold tracking-wide">
            ĐÀ NẴNG · AN THƯỢNG
          </Badge>
          <Badge variant="secondary" className="text-xs font-bold">
            BÁO CÁO THỊ TRƯỜNG
          </Badge>
        </div>

        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Insights Thị Trường Cafe
        </h1>

        <p className="max-w-2xl text-base font-medium text-muted-foreground sm:text-lg">
          Phân tầng giá đồ uống, cơ cấu menu, nhịp hoạt động theo giờ và khoảng trống đầu tư cho chủ quán tại khu phố
          Tây An Thượng.
        </p>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-lg border-2 border-border bg-card p-4 shadow-hard-sm">
            <dd className="font-mono text-2xl font-bold text-foreground">{stat.value}</dd>
            <dt className="mt-0.5 text-xs font-bold text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>

      {report ? (
        <article className="rounded-lg border-2 border-border bg-card p-5 shadow-hard-card sm:p-8">
          <Markdown content={report} size="article" />
        </article>
      ) : (
        <div className="rounded-lg border-2 border-border bg-card p-8 text-center text-sm font-bold text-muted-foreground shadow-hard-card">
          Báo cáo đang được cập nhật. Bạn quay lại sau nhé.
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border-2 border-border bg-primary p-6 shadow-hard-card sm:flex-row">
        <div>
          <h2 className="font-heading text-base font-extrabold text-primary-foreground">Muốn đào sâu một con số?</h2>
          <p className="mt-1 text-xs font-medium text-primary-foreground sm:text-sm">
            Hỏi trợ lý AI hoặc xem số liệu thống kê trực tiếp từ cơ sở dữ liệu.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link
            href="/phan-tich"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 sm:flex-initial")}
          >
            <BarChart3 className="stroke-[2.5]" />
            Xem số liệu
          </Link>
          <Link
            href="/hoi-ai"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 sm:flex-initial")}
          >
            <Sparkles className="stroke-[2.5]" />
            Hỏi AI
            <ArrowRight className="stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
