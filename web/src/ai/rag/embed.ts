/**
 * Module embedding cho Next.js server runtime (server-only).
 *
 * LƯU Ý KIẾN TRÚC:
 * Khi chuyển đổi hoặc thay thế Embedding Provider (ví dụ: sang OpenAI, Cohere, v.v.),
 * CHỈ cần chỉnh sửa 2 module:
 * 1. `web/src/ai/rag/embed-core.ts` (logic khởi tạo client, retry/backoff, chuẩn hóa vector)
 * 2. `web/src/ai/rag/embed.ts` (lấy biến môi trường, quản lý singleton instance)
 * Toàn bộ các module khác (store.ts, chunk.ts, search-knowledge tool, Ask AI UI)
 * giữ nguyên không cần thay đổi.
 */

import "server-only";

import { env } from "@/lib/env";
import { createEmbedder, type Embedder } from "./embed-core";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./types";

let embedderInstance: Embedder | null = null;

function getEmbedder(): Embedder {
  if (!embedderInstance) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim().length === 0) {
      throw new Error(
        "Chưa cấu hình GEMINI_API_KEY. Vui lòng thiết lập GEMINI_API_KEY trong file .env.local để sử dụng tính năng embedding.",
      );
    }

    embedderInstance = createEmbedder({
      apiKey: env.GEMINI_API_KEY,
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
    });
  }

  return embedderInstance;
}

/**
 * Kiểm tra xem cấu hình embedding đã sẵn sàng chưa (có GEMINI_API_KEY).
 */
export function isEmbeddingConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
}

/**
 * Tạo vector embedding cho câu truy vấn người dùng (taskType = RETRIEVAL_QUERY).
 * Lazy khởi tạo embedder singleton theo mô hình và kích thước chuẩn cấu hình tại ./types.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const embedder = getEmbedder();
  return embedder.embedQuery(text);
}
