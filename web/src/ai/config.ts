import "server-only";

import { env } from "@/lib/env";

/**
 * Cấu hình AI tập trung. Mọi chỗ cần biết "AI có bật không, dùng model nào"
 * đều đọc từ đây — không đọc process.env trực tiếp trong feature.
 */
export const aiConfig = {
  provider: env.AI_PROVIDER,
  model: env.AI_MODEL,
  enabled: Boolean(env.AI_PROVIDER && env.AI_MODEL && env.AI_API_KEY),
} as const;

export function assertAIEnabled() {
  if (!aiConfig.enabled) {
    throw new Error(
      "AI chưa được cấu hình. Đặt AI_PROVIDER, AI_MODEL, AI_API_KEY trong .env.local (xem src/ai/AGENTS.md).",
    );
  }
}
