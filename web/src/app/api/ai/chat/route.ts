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
  searchCafesTool,
  systemPrompt,
} from "@/ai";
import { checkAndConsumeAiQuota, getClientIdentifier } from "@/server/rate-limit/ai-quota";

const chatRequestSchema = z.object({
  messages: z.array(z.any()).min(1),
});

export async function POST(req: Request) {
  await connection();
  if (!aiConfig.enabled) {
    return Response.json(
      {
        error: "AI chưa được cấu hình trên hệ thống.",
      },
      { status: 503 },
    );
  }

  // 1. Kiểm tra và áp dụng Rate Limit (Tối đa 3 lượt)
  const identifier = await getClientIdentifier();
  const quota = await checkAndConsumeAiQuota(identifier, 3);

  if (!quota.allowed) {
    return Response.json(
      {
        error: "QUOTA_EXCEEDED",
        message:
          "Bạn đã dùng hết 3 lượt hỏi AI miễn phí trong ngày. Vui lòng quay lại sau 24h hoặc sử dụng bộ lọc tìm kiếm trên trang chủ!",
        remaining: 0,
        max: quota.max,
        reset_at: quota.reset_at,
      },
      {
        status: 429,
        headers: {
          "X-AI-Remaining-Quota": "0",
        },
      },
    );
  }

  // 2. Validate nội dung tin nhắn gửi lên
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return Response.json({ error: "Yêu cầu không hợp lệ (Invalid JSON)" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(bodyJson);
  if (!parsed.success) {
    return Response.json({ error: "Danh sách tin nhắn không đúng định dạng" }, { status: 400 });
  }

  const messages: UIMessage[] = parsed.data.messages;

  // 3. Thực thi Streaming RAG qua Groq + Tools
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
      },
      stopWhen: stepCountIs(4), // Cho phép tối đa 4 bước gọi tool và suy luận
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "X-AI-Remaining-Quota": String(quota.remaining),
      },
    });
  } catch (err: unknown) {
    console.error("Lỗi khi xử lý luồng AI streaming:", err);
    return Response.json({ error: "Đã xảy ra lỗi trong quá trình suy luận của mô hình AI." }, { status: 500 });
  }
}
