import "server-only";

import { z } from "zod";

/**
 * Biến môi trường phía server, được kiểm tra bằng zod ngay khi import.
 * - Thêm biến mới: khai báo ở đây + ghi vào `.env.example`.
 * - Biến cho client phải có tiền tố NEXT_PUBLIC_ và KHÔNG đặt ở file này.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- AI (tuỳ chọn) — xem src/ai/AGENTS.md ---
  AI_PROVIDER: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_API_KEY: z.string().min(1).optional(),

  // --- Database (tuỳ chọn) — xem src/server/AGENTS.md ---
  DATABASE_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Biến môi trường không hợp lệ:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Biến môi trường không hợp lệ. Kiểm tra file .env.local");
}

export const env = parsed.data;
