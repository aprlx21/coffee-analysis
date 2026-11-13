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
  AI_PROVIDER: z.string().default("groq"),
  AI_MODEL: z.string().default("qwen/qwen3.8-27b"),
  // Model Gemini dự phòng (dùng GEMINI_API_KEY) khi model chính lỗi/quá tải; đặt rỗng để tắt.
  AI_FALLBACK_MODEL: z.string().default("gemini-3.5-flash-lite"),
  AI_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  RATE_LIMIT_SALT: z.string().default("coffee_analysis_salt_2026"),
  // Khóa Google AI Studio dùng cho embedding RAG; thiếu → searchKnowledge trả lỗi mềm.
  GEMINI_API_KEY: z.string().min(1).optional(),

  // --- Làm mới cache dữ liệu quán qua POST /api/revalidate (tuỳ chọn; thiếu → route trả 503) ---
  REVALIDATE_SECRET: z.string().min(16).optional(),

  // --- Database (tuỳ chọn) — xem src/server/AGENTS.md ---
  DATABASE_URL: z
    .string()
    .optional()
    .transform(
      (val) =>
        val ||
        process.env.SUPABASE_DB_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.DATABASE_URL_UNPOOLED,
    ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Biến môi trường không hợp lệ:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Biến môi trường không hợp lệ. Kiểm tra file .env.local");
}

export const env = parsed.data;
