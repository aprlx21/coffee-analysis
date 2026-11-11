import type { Metadata } from "next";
import Link from "next/link";
import { Filter, Map, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Khám phá quán cafe An Thượng",
  description: "Tra cứu hơn 115 quán cafe tại khu phố Tây An Thượng Đà Nẵng với đầy đủ tiện ích và khoảng giá.",
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Hero header */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="text-xs font-bold tracking-wide">
            ĐÀ NẴNG · AN THƯỢNG
          </Badge>
          <Badge variant="secondary" className="text-xs font-bold">
            115 QUÁN CAFE
          </Badge>
        </div>

        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Khám phá Cafe An Thượng
        </h1>

        <p className="max-w-2xl text-base font-medium text-muted-foreground sm:text-lg">
          Dữ liệu chi tiết về tiện ích làm việc, máy lạnh, wifi và giá đồ uống chuẩn xác tại khu phố Tây An Thượng.
        </p>
      </div>

      {/* Control row placeholder */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border-2 border-border bg-card p-4 shadow-hard">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold">
            <Filter className="mr-1 size-3 stroke-[2.5]" />
            Bộ lọc & Sắp xếp (Issue #4)
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">Sẵn sàng kết nối dữ liệu Supabase</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ban-do" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>
            <Map className="mr-1 size-3.5 stroke-[2.5]" />
            Xem bản đồ
          </Link>
          <Link href="/hoi-ai" className={cn(buttonVariants({ variant: "default", size: "sm" }), "text-xs")}>
            <Sparkles className="mr-1 size-3.5 stroke-[2.5]" />
            Hỏi AI
          </Link>
        </div>
      </div>

      {/* Grid placeholder cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border-2 border-border bg-primary text-xl font-black text-primary-foreground shadow-hard-sm">
              💻
            </div>
            <CardTitle>Không gian làm việc</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-muted-foreground">
              Đánh giá điểm Work-Friendly dựa trên bàn ghế phù hợp laptop, ổ cắm điện dồi dào và mức độ yên tĩnh.
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border-2 border-border bg-primary text-xl font-black text-primary-foreground shadow-hard-sm">
              🥤
            </div>
            <CardTitle>Menu & Bảng giá chuẩn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-muted-foreground">
              Trích xuất dữ liệu giá thật từ ảnh menu qua OCR, so sánh khoảng giá cà phê sữa, bạc xỉu, cold brew.
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:-translate-x-0.5 hover:-translate-y-0.5">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg border-2 border-border bg-primary text-xl font-black text-primary-foreground shadow-hard-sm">
              🧭
            </div>
            <CardTitle>Lọc đa chiều thông minh</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-muted-foreground">
              Dễ dàng tìm quán mở khuya, có máy lạnh mát mẻ, cho phép thú cưng hoặc hỗ trợ thanh toán thẻ / Apple Pay.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
