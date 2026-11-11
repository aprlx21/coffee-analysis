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

type InsightTopic =
  "summary" | "work_friendly_gaps" | "payment_trends" | "menu_pricing_strategy" | "location_advice" | "all";

/** Chủ đề → số thứ tự các mục `## N.` trong báo cáo. Chỉ gửi phần liên quan để tiết kiệm token. */
const TOPIC_SECTIONS: Record<Exclude<InsightTopic, "all">, number[]> = {
  summary: [1, 7],
  work_friendly_gaps: [5, 6],
  payment_trends: [6],
  menu_pricing_strategy: [2, 3],
  location_advice: [4, 5],
};

export function selectInsightSections(content: string, topic: InsightTopic): string {
  if (topic === "all") return content;
  const wanted = TOPIC_SECTIONS[topic];
  const sections = content.split(/\n(?=## )/);
  const picked = sections.filter((section) => {
    const match = /^## (\d+)\./.exec(section);
    return match ? wanted.includes(Number(match[1])) : false;
  });
  return picked.length > 0 ? picked.join("\n").replace(/^---\s*$/gm, "") : content;
}

export const getMarketInsightsTool = tool({
  description:
    "Tra cứu nội dung báo cáo phân tích thị trường F&B chuyên sâu của khu phố An Thượng (tổng kết từ 115 quán, phân tích cơ hội kinh doanh cho chủ quán, khoảng trống quán làm việc, ma trận giá menu, xu hướng khách Tây). Chọn topic hẹp nhất phù hợp câu hỏi; chỉ dùng 'all' khi câu hỏi bao quát nhiều mảng.",
  inputSchema: z.object({
    topic: z
      .enum(["summary", "work_friendly_gaps", "payment_trends", "menu_pricing_strategy", "location_advice", "all"])
      .default("all")
      .describe(
        "summary: quy mô & giới hạn dữ liệu · work_friendly_gaps: quán làm việc, giờ đông khách · payment_trends: thanh toán, thuần chay · menu_pricing_strategy: phân tầng giá đồ uống, cơ cấu menu · location_advice: vị trí, khoảng cách biển, nhịp giờ",
      ),
  }),
  execute: async ({ topic }) => {
    const content = getMarketInsightsContent();
    if (!content) {
      return { error: "Báo cáo thị trường đang được cập nhật." };
    }

    return {
      topic,
      report: selectInsightSections(content, topic),
    };
  },
});
