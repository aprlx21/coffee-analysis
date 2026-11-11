import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { getCafe } from "@/server/db/queries/cafes";

export const getCafeDetailTool = tool({
  description:
    "Lấy thông tin chi tiết đầy đủ của một quán cafe theo placeId: giờ mở cửa, số điện thoại, mô tả, đánh giá nổi bật của khách hàng.",
  inputSchema: z.object({
    placeId: z.string().describe("placeId định danh của quán cafe"),
  }),
  execute: async ({ placeId }) => {
    const cafe = await getCafe(placeId);
    if (!cafe) {
      return { error: `Không tìm thấy quán với placeId: ${placeId}` };
    }

    return {
      placeId: cafe.placeId,
      name: cafe.name,
      address: cafe.address,
      phone: cafe.phone,
      rating: cafe.rating,
      reviewsCount: cafe.reviews,
      workScore: cafe.workScore,
      description: cafe.description,
      hours: cafe.hours,
      reviewKeywords: cafe.reviewKeywords,
      featuredReviews: Array.isArray(cafe.featuredReviews) ? cafe.featuredReviews.slice(0, 3) : cafe.featuredReviews,
      amenities: cafe.flags,
    };
  },
});
