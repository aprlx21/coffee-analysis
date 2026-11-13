import "server-only";

import { connection } from "next/server";
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { z } from "zod";

import {
  aiConfig,
  compareItemPricesTool,
  getCafeDetailTool,
  getCafeMenuTool,
  getMarketInsightsTool,
  getModel,
  isProviderSideError,
  searchCafesTool,
  searchKnowledgeTool,
  suggestDrinkPriceTool,
  systemPrompt,
} from "@/ai";
import {
  AI_DAILY_QUOTA,
  AI_QUOTA_ENABLED,
  checkAndConsumeAiQuota,
  getClientIdentifier,
  refundAiQuota,
} from "@/server/rate-limit/ai-quota";

/** Groq + tối đa 5 bước tool-calling có thể vượt 10s mặc định của serverless. */
export const maxDuration = 60;

const MAX_HISTORY_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 1000;

/** Chỉ nhận phần text từ client — tool call/result luôn được server tự sinh lại, không tin dữ liệu client. */
const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().max(100).optional(),
        role: z.enum(["user", "assistant"]),
        parts: z
          .array(z.object({ type: z.literal("text"), text: z.string().max(8000) }))
          .min(1)
          .max(8),
      }),
    )
    .min(1)
    .max(40),
});

const STREAM_ERROR_MESSAGE = "Mô hình AI đang quá tải hoặc gặp sự cố. Bạn vui lòng thử lại sau ít phút nhé.";

export async function POST(req: Request) {
  await connection();
  if (!aiConfig.enabled) {
    return Response.json({ error: "AI_DISABLED", message: "AI chưa được cấu hình trên hệ thống." }, { status: 503 });
  }

  // 1. Validate TRƯỚC khi trừ lượt — request hỏng không được làm mất lượt hỏi của người dùng.
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return Response.json({ error: "BAD_REQUEST", message: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return Response.json(
      { error: "BAD_REQUEST", message: "Danh sách tin nhắn không đúng định dạng." },
      { status: 400 },
    );
  }

  const history = parsed.data.messages.slice(-MAX_HISTORY_MESSAGES);
  const last = history[history.length - 1];
  const question = last.parts
    .map((part) => part.text)
    .join("")
    .trim();

  if (last.role !== "user" || !question) {
    return Response.json({ error: "BAD_REQUEST", message: "Bạn chưa nhập câu hỏi." }, { status: 400 });
  }
  if (question.length > MAX_MESSAGE_CHARS) {
    return Response.json(
      { error: "BAD_REQUEST", message: `Câu hỏi quá dài (tối đa ${MAX_MESSAGE_CHARS} ký tự).` },
      { status: 400 },
    );
  }

  // 2. Kiểm tra và trừ lượt hỏi
  // Bản MVP tắt giới hạn (AI_QUOTA_ENABLED = false) → bỏ qua toàn bộ bước trừ/hoàn lượt.
  const identifier = AI_QUOTA_ENABLED ? await getClientIdentifier() : null;
  const quota = identifier ? await checkAndConsumeAiQuota(identifier, AI_DAILY_QUOTA) : null;

  if (quota && !quota.allowed) {
    return Response.json(
      {
        error: "QUOTA_EXCEEDED",
        message: `Bạn đã dùng hết ${quota.max} lượt hỏi AI miễn phí trong ngày. Vui lòng quay lại sau hoặc dùng bộ lọc ở trang Khám phá nhé!`,
        remaining: 0,
        max: quota.max,
        reset_at: quota.reset_at,
      },
      { status: 429, headers: { "X-AI-Remaining-Quota": "0" } },
    );
  }

  // 3. Streaming qua Groq + tools tra cứu dữ liệu thật
  const messages: UIMessage[] = history.map((message, index) => ({
    id: message.id ?? `m${index}`,
    role: message.role,
    parts: message.parts,
  }));

  // Lỗi phía provider (429/5xx/mạng) khi chưa có câu trả lời → hoàn lượt đúng 1 lần. Người dùng tự dừng thì không hoàn.
  let hasOutput = false;
  let refunded = false;
  const refundOnce = async () => {
    if (!identifier || refunded || hasOutput || req.signal.aborted) return;
    refunded = true;
    await refundAiQuota(identifier);
  };

  try {
    const result = streamText({
      model: getModel(),
      system: systemPrompt.text,
      messages: await convertToModelMessages(messages),
      tools: {
        searchCafes: searchCafesTool,
        getCafeDetail: getCafeDetailTool,
        getCafeMenu: getCafeMenuTool,
        compareItemPrices: compareItemPricesTool,
        getMarketInsights: getMarketInsightsTool,
        searchKnowledge: searchKnowledgeTool,
        suggestDrinkPrice: suggestDrinkPriceTool,
      },
      temperature: 0.3,
      // 6 bước: searchCafes → searchKnowledge → getCafeDetail → getCafeMenu vẫn còn dư 1–2 bước để chốt câu trả lời.
      stopWhen: stepCountIs(6),
      abortSignal: req.signal,
      onChunk: ({ chunk }) => {
        if (chunk.type === "text-delta") hasOutput = true;
      },
      onError: async ({ error }) => {
        console.error("Lỗi stream AI:", error);
        if (isProviderSideError(error)) await refundOnce();
      },
    });

    return result.toUIMessageStreamResponse({
      headers: quota
        ? {
            "X-AI-Remaining-Quota": String(quota.remaining),
            "X-AI-Quota-Max": String(quota.max),
          }
        : undefined,
      // Mặc định SDK che lỗi thành chuỗi rỗng; trả thông điệp thân thiện để UI hiển thị.
      onError: () => STREAM_ERROR_MESSAGE,
    });
  } catch (err: unknown) {
    console.error("Lỗi khi khởi tạo luồng AI streaming:", err);
    if (isProviderSideError(err)) await refundOnce();
    return Response.json({ error: "AI_ERROR", message: STREAM_ERROR_MESSAGE }, { status: 500 });
  }
}
