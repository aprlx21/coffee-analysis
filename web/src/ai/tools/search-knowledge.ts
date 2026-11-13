import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { embedQuery, isEmbeddingConfigured } from "@/ai/rag/embed";
import { hasKnowledgeIndex, queryKnowledge } from "@/ai/rag/store";
import { KNOWLEDGE_KINDS, type KnowledgeHit, type KnowledgeKind } from "@/ai/rag/types";

const MAX_TEXT_CHARS = 500;

const KIND_LABELS: Record<KnowledgeKind, string> = {
  review: "Đánh giá của khách",
  profile: "Hồ sơ quán",
  menu: "Thực đơn quán",
  insight: "Báo cáo thị trường An Thượng",
};

function truncate(text: string): string {
  const clean = text.trim();
  return clean.length > MAX_TEXT_CHARS ? `${clean.slice(0, MAX_TEXT_CHARS).trimEnd()}…` : clean;
}

function metaString(meta: KnowledgeHit["meta"], key: string): string | null {
  const value = meta?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toResult(hit: KnowledgeHit) {
  let source = KIND_LABELS[hit.kind] ?? "Tri thức";
  if (hit.kind === "insight") {
    const heading = metaString(hit.meta, "heading");
    if (heading) source = `${source} — ${heading}`;
  }
  return {
    kind: hit.kind,
    placeId: hit.placeId,
    name: metaString(hit.meta, "placeName"),
    text: truncate(hit.text),
    url: hit.placeId ? `/quan/${hit.placeId}` : null,
    source,
  };
}

export const searchKnowledgeTool = tool({
  description:
    "Tìm kiếm theo NGỮ NGHĨA trong kho tri thức: review của khách, hồ sơ/phong cách/không khí quán, thực đơn thô (kể cả món không có trong danh mục chuẩn) và báo cáo thị trường An Thượng. Dùng cho câu hỏi định tính như 'quán nào yên tĩnh, view đẹp', 'khách nói gì về quán X', 'quán có món độc lạ'. KHÔNG dùng để lấy giá, rating hay tiện ích (wifi, máy lạnh, ổ cắm...) — các số liệu đó phải lấy từ các tool dữ liệu có cấu trúc (searchCafes, getCafeDetail, getCafeMenu, compareItemPrices). Có thể lọc theo kind và placeId.",
  inputSchema: z.object({
    query: z.string().min(1).max(300).describe("Câu truy vấn tự nhiên bằng tiếng Việt hoặc tiếng Anh"),
    kind: z.enum(KNOWLEDGE_KINDS).optional().describe("Giới hạn loại nội dung: review | profile | menu | insight"),
    placeId: z.string().max(100).optional().describe("Chỉ tìm trong một quán cụ thể"),
    k: z.number().int().min(1).max(8).default(5).describe("Số kết quả tối đa"),
  }),
  execute: async ({ query, kind, placeId, k }) => {
    try {
      if (!isEmbeddingConfigured() || !(await hasKnowledgeIndex())) {
        return { error: "Tính năng tìm kiếm ngữ nghĩa hiện chưa khả dụng. Hãy dùng các tool dữ liệu có cấu trúc." };
      }
      const vector = await embedQuery(query);
      const hits = await queryKnowledge(vector, { kind, placeId }, k);
      if (hits.length === 0) {
        return { results: [], note: "Không tìm thấy nội dung phù hợp." };
      }
      return { results: hits.map(toResult) };
    } catch (err: unknown) {
      console.error("Lỗi searchKnowledge:", err instanceof Error ? err.message : "unknown");
      return { error: "Không thể tìm kiếm ngữ nghĩa lúc này. Hãy thử lại hoặc dùng tool dữ liệu có cấu trúc." };
    }
  },
});
