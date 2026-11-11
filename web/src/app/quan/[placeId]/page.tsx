import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

export default async function CafeDetailPage({ params }: PageProps) {
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
