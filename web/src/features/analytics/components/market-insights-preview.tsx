import Link from "next/link";
import * as React from "react";
import { ArrowLeft, ArrowRight, BarChart, BookOpen, BrainCircuit, Sparkles, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarketInsightsPreview() {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Outer Mock Report Container */}
      <div className="relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 shadow-hard-card sm:p-10">
        {/* Mock Report Header */}
        <div className="border-b-2 border-border pb-6 opacity-40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
              CONFIDENTIAL · F&B MARKET RESEARCH
            </span>
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              Q4 / 2026 · COFFEE ANALYSIS AI
            </span>
          </div>
          <h2 className="mt-2 font-heading text-2xl font-black text-foreground sm:text-3xl">
            BÁO CÁO THỊ TRƯỜNG & CHIẾN LƯỢC KINH DOANH F&B AN THƯỢNG
          </h2>
          <p className="mt-1 font-mono text-xs font-medium text-muted-foreground">
            Khảo sát 115 cơ sở · Bóc tách 6.107 dòng dữ liệu giá · Tổng hợp bởi Trí tuệ Nhân tạo
          </p>
        </div>

        {/* Mock Content Body with low opacity */}
        <div className="mt-6 space-y-8 opacity-40">
          {/* Section 1: Executive Summary */}
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 stroke-[2.5]" />
              <h3 className="font-heading text-base font-extrabold tracking-wide text-foreground uppercase">
                1. Tóm Tắt Điều Hành (Executive Summary)
              </h3>
            </div>
            <div className="mt-3 space-y-2 rounded-lg border-2 border-border bg-muted/40 p-4 text-xs font-medium text-foreground">
              <p>
                • <strong>Áp lực cạnh tranh giá:</strong> 56.5% quán định vị dưới 100.000đ/người. Mức giá trung vị cà
                phê sữa (30.000đ) và bạc xỉu (35.000đ) là ngưỡng tâm lý quan trọng.
              </p>
              <p>
                • <strong>Khoảng trống hạ tầng:</strong> 35.7% quán phù hợp ngồi làm việc nhưng chỉ 8.7% được ghi nhận
                có ổ cắm điện sẵn sàng. Cơ hội lớn cho quán nhắm vào tệp Digital Nomads.
              </p>
              <p>
                • <strong>Xu hướng thanh toán:</strong> Tỷ lệ chấp nhận thẻ và NFC đạt xấp xỉ 50%, cao vượt trội so với
                các khu vực dân cư truyền thống tại Đà Nẵng.
              </p>
            </div>
          </div>

          {/* Section 2: Table of Contents */}
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 stroke-[2.5]" />
              <h3 className="font-heading text-base font-extrabold tracking-wide text-foreground uppercase">
                2. Mục Lục Báo Cáo Chuyên Sâu
              </h3>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs font-bold text-foreground sm:grid-cols-2">
              <div className="rounded-md border-2 border-border bg-card p-3 shadow-hard-sm">
                01. Phân tầng phổ giá & Phân tích điểm hòa vốn đồ uống
              </div>
              <div className="rounded-md border-2 border-border bg-card p-3 shadow-hard-sm">
                02. Bản đồ nhiệt cơ hội: Các tuyến đường thiếu quán máy lạnh
              </div>
              <div className="rounded-md border-2 border-border bg-card p-3 shadow-hard-sm">
                03. Chân dung khách hàng: Digital Nomads vs Khách du lịch biển
              </div>
              <div className="rounded-md border-2 border-border bg-card p-3 shadow-hard-sm">
                04. Ma trận Menu Engineering tối ưu hóa biên lợi nhuận
              </div>
            </div>
          </div>

          {/* Section 3: Simulated Charts */}
          <div>
            <div className="flex items-center gap-2">
              <BarChart className="size-4 stroke-[2.5]" />
              <h3 className="font-heading text-base font-extrabold tracking-wide text-foreground uppercase">
                3. Mô Hình Phân Bổ Tiềm Năng (Simulated Analytics)
              </h3>
            </div>
            <div className="mt-3 space-y-3 rounded-lg border-2 border-border bg-muted/40 p-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Nhu cầu ngồi làm việc (Digital Nomad)</span>
                  <span>41% quán</span>
                </div>
                <div className="h-4 w-full rounded border border-border bg-card">
                  <div className="h-full w-[41%] bg-primary" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Cung cấp ổ cắm sạc thuận tiện</span>
                  <span>8.7% quán</span>
                </div>
                <div className="h-4 w-full rounded border border-border bg-card">
                  <div className="h-full w-[8.7%] bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal striped screen overlay (NO BLUR per DESIGN.md) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--border)_10px,var(--border)_11px)] opacity-15"
        />

        {/* Central Coming Soon Neubrutalism Floating Card */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-lg border-2 border-border bg-background p-6 text-center shadow-hard-lg sm:p-8">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Badge variant="default" className="px-3 py-1 text-xs font-extrabold tracking-wider uppercase">
                SẮP RA MẮT
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase">
                COMING SOON
              </Badge>
            </div>

            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg border-2 border-border bg-primary text-primary-foreground shadow-hard sm:size-16">
              <BrainCircuit className="size-7 stroke-[2.5]" />
            </div>

            <h3 className="mb-2 font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Báo Cáo AI Đang Được Tổng Hợp
            </h3>

            <p className="mx-auto mb-6 max-w-sm text-xs leading-relaxed font-medium text-muted-foreground sm:text-sm">
              Mô hình AI đang huấn luyện và phân tích cơ hội kinh doanh F&B, khoảng trống thị trường và đề xuất chiến
              lược thực đơn cho chủ quán tại An Thượng.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/phan-tich"
                className={cn(buttonVariants({ variant: "default" }), "w-full cursor-pointer font-bold sm:w-auto")}
              >
                <TrendingUp className="mr-1.5 size-4 stroke-[2.5]" />
                XEM DỮ LIỆU THỰC TẾ
                <ArrowRight className="ml-1.5 size-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }), "w-full cursor-pointer font-bold sm:w-auto")}
              >
                <ArrowLeft className="mr-1.5 size-4 stroke-[2.5]" />
                VỀ KHÁM PHÁ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
