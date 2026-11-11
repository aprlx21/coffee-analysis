import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { AMENITY_KEYS, cafeFiltersSchema } from "@/features/cafes/schema";
import { listCafes } from "@/server/db/queries/cafes";

export const searchCafesTool = tool({
  description:
    "Tìm kiếm các quán cafe tại khu phố Tây An Thượng (Đà Nẵng) dựa trên bộ lọc: wifi, máy lạnh, ổ cắm, làm việc yên tĩnh, thú cưng, mức giá, hoặc từ khóa.",
  inputSchema: z.object({
    q: z.string().optional().describe("Từ khóa tìm theo tên quán hoặc tên đường"),
    amenities: z
      .array(z.enum(AMENITY_KEYS))
      .optional()
      .describe(
        "Danh sách tiện ích cần có: has_wifi, has_ac, has_outlets, laptop_friendly, quiet, pet_friendly, outdoor_seating, rooftop, accepts_card, v.v.",
      ),
    item: z
      .string()
      .regex(/^[a-z0-9_]+$/)
      .optional()
      .describe(
        "Chỉ lấy quán có bán món chuẩn hoá này (canonical id): ca_phe_den, ca_phe_sua, bac_xiu, ca_phe_muoi, cold_brew, latte, matcha_latte, tra_dao...",
      ),
    maxItemPrice: z.number().min(0).optional().describe("Giá tối đa (VND) của món `item`. Chỉ dùng kèm `item`."),
    minRating: z.number().min(0).max(5).optional().describe("Mức rating Google Maps tối thiểu (0-5)"),
    sort: z
      .enum(["rating", "reviews", "work_score", "price_asc", "price_desc"])
      .optional()
      .describe("Tiêu chí sắp xếp: work_score (cho người làm việc), rating, price_asc (giá rẻ), reviews"),
    page: z.number().int().min(1).default(1).describe("Trang kết quả"),
  }),
  execute: async (input) => {
    const filters = cafeFiltersSchema.parse(input);
    const result = await listCafes(filters, input.sort || "work_score", input.page || 1);

    // Rút gọn thông tin để tối ưu hóa tokens cho context của LLM
    return {
      totalFound: result.total,
      currentPage: result.page,
      cafes: result.items.slice(0, 8).map((c) => ({
        placeId: c.placeId,
        url: `/quan/${c.placeId}`,
        name: c.name,
        address: c.shortAddress || c.address,
        rating: c.rating,
        reviews: c.reviews,
        workScore: c.workScore,
        priceMin: c.drinkPriceMin,
        priceMedian: c.drinkPriceMedian,
        priceMax: c.drinkPriceMax,
        amenities: {
          wifi: c.hasWifi,
          laptopFriendly: c.laptopFriendly,
          ac: c.hasAc,
          outlets: c.hasOutlets,
          quiet: c.quiet,
          petFriendly: c.petFriendly,
          outdoor: c.outdoorSeating,
        },
      })),
    };
  },
});
