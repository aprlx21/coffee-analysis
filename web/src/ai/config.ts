import "server-only";

import { env } from "@/lib/env";

const apiKey = env.GROQ_API_KEY || env.AI_API_KEY;

/**
 * Cấu hình AI tập trung. Mọi chỗ cần biết "AI có bật không, dùng model nào"
 * đều đọc từ đây — không đọc process.env trực tiếp trong feature.
 */
export const aiConfig = {
  provider: env.AI_PROVIDER,
  model: env.AI_MODEL,
  /** Model Gemini dự phòng; chỉ bật khi có GEMINI_API_KEY và AI_FALLBACK_MODEL không rỗng. */
  fallbackModel: env.GEMINI_API_KEY ? env.AI_FALLBACK_MODEL : "",
  geminiApiKey: env.GEMINI_API_KEY,
  apiKey,
  enabled: Boolean(env.AI_PROVIDER && env.AI_MODEL && apiKey),
} as const;

export function assertAIEnabled() {
  if (!aiConfig.enabled) {
    throw new Error(
      "AI chưa được cấu hình. Đặt GROQ_API_KEY (hoặc AI_API_KEY) trong .env.local (xem src/ai/AGENTS.md).",
    );
  }
}
