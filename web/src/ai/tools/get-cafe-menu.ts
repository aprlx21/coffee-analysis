import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { getCafeMenu } from "@/server/db/queries/menu";

export const getCafeMenuTool = tool({
  description:
    "Lấy danh sách các món đồ uống và mức giá bóc tách OCR theo từng nhóm (Cà phê, Trà & Matcha, Nước ép...) của một quán cafe. Lưu ý: các món có isSuspicious=true hoặc matchUncertain=true cần được lưu ý khi tư vấn cho người dùng.",
  inputSchema: z.object({
    placeId: z.string().describe("placeId định danh của quán cafe"),
  }),
  execute: async ({ placeId }) => {
    const menuGroups = await getCafeMenu(placeId);
    return {
      placeId,
      groups: menuGroups.map((group) => ({
        category: group.label,
        items: group.items.map((item) => ({
          name: item.displayName,
          priceMin: item.priceMin,
          priceMax: item.priceMax,
          matchUncertain: item.matchUncertain,
          isSuspicious: item.isSuspicious,
          warningNote: item.warningNote,
        })),
      })),
    };
  },
});
