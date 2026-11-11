import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CoffeeRunningLoader } from "@/components/coffee-running-loader";
import {
  AmenitiesList,
  CafeHeader,
  FeaturedReviews,
  MenuTable,
  OpeningHours,
  ReviewKeywords,
} from "@/features/cafe-detail";
import { getCafe, getCafeMenu } from "@/server/db";

interface PageProps {
  params: Promise<{ placeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { placeId } = await params;
  const cafe = await getCafe(placeId);

  if (!cafe) {
    return {
      title: "Không tìm thấy quán — Cà phê An Thượng",
    };
  }

  return {
    title: `${cafe.name} — Cà phê An Thượng`,
    description:
      cafe.description ||
      `Thông tin chi tiết về không gian làm việc, tiện ích máy lạnh, wifi, giờ mở cửa và bảng giá thực đơn tại ${cafe.name}, An Thượng, Đà Nẵng.`,
  };
}

async function CafeDetailContent({ params }: PageProps) {
  const { placeId } = await params;
  const cafe = await getCafe(placeId);

  if (!cafe) {
    notFound();
  }

  const menu = await getCafeMenu(placeId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 md:py-10">
      <div className="space-y-8">
        {/* Header quán: Thông tin chung, ảnh, đánh giá & nút hành động */}
        <section aria-label="Thông tin chung quán">
          <CafeHeader cafe={cafe} />
        </section>

        {/* Khối Giờ mở cửa & Tiện ích */}
        <section aria-label="Giờ hoạt động và tiện ích" className="grid gap-6 md:grid-cols-2">
          <OpeningHours hours={cafe.hours} />
          <AmenitiesList cafe={cafe} />
        </section>

        {/* Khối Bảng giá thực đơn OCR */}
        <section aria-label="Bảng giá thực đơn tiêu biểu">
          <MenuTable menu={menu} mapsLink={cafe.mapsLink} />
        </section>

        {/* Khối Đánh giá nổi bật */}
        {cafe.featuredReviews ? (
          <section aria-label="Đánh giá từ khách hàng">
            <FeaturedReviews featuredReviews={cafe.featuredReviews} />
          </section>
        ) : null}

        {/* Khối Từ khóa đánh giá */}
        {cafe.reviewKeywords ? (
          <section aria-label="Từ khóa đánh giá">
            <ReviewKeywords reviewKeywords={cafe.reviewKeywords} />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function CafeDetailSkeleton() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/80 glass-strong p-8 text-center shadow-glass-lg">
        <CoffeeRunningLoader
          size="md"
          title="Đang tải chi tiết quán cafe..."
          subtitle="Cappuccino Ninja đang chuẩn bị thực đơn và thông tin tiện ích ☕"
        />
      </div>
    </div>
  );
}

export default function CafeDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<CafeDetailSkeleton />}>
      <CafeDetailContent {...props} />
    </Suspense>
  );
}
