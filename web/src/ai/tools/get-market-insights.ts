import "server-only";

import fs from "node:fs";
import path from "node:path";
import { tool } from "ai";
import { z } from "zod";

const REPORT_PATH = path.join(process.cwd(), "src/features/analytics/data/market-insights.md");

/**
 * Đọc toàn bộ hoặc một đoạn báo cáo thị trường chuyên sâu về Cafe An Thượng
 */
export function getMarketInsightsContent(): string {
  try {
    if (fs.existsSync(REPORT_PATH)) {
      return fs.readFileSync(REPORT_PATH, "utf-8");
    }
  } catch (err) {
    console.error("Không thể đọc file market-insights.md:", err);
  }
  return "";
}

export const getMarketInsightsTool = tool({
  description:
    "Tra cứu nội dung báo cáo phân tích thị trường F&B chuyên sâu của khu phố An Thượng (tổng kết từ 115 quán, phân tích cơ hội kinh doanh cho chủ quán, khoảng trống quán làm việc, ma trận giá menu, xu hướng khách Tây).",
  inputSchema: z.object({
    topic: z
      .enum(["summary", "work_friendly_gaps", "payment_trends", "menu_pricing_strategy", "location_advice", "all"])
      .default("all")
      .describe("Chủ đề cần trích xuất từ báo cáo thị trường"),
  }),
  execute: async ({ topic }) => {
    const content = getMarketInsightsContent();
    if (!content) {
      return { error: "Báo cáo thị trường đang được cập nhật." };
    }

    return {
      topic,
      reportSummary: content,
    };
  },
});
