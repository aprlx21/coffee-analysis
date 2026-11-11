---
name: ai-integration
description: Thêm tính năng AI (chat, tóm tắt, phân loại, sinh nội dung, structured output, tool calling) vào dự án bằng Vercel AI SDK, đặt đúng vào lớp src/ai/. Dùng khi người dùng nhắc tới AI, LLM, chatbot, prompt, model, OpenAI, Anthropic/Claude, Gemini.
metadata:
  version: "1.0"
---

# AI integration

Mục tiêu: feature gọi AI qua **một cửa** là `@/ai`; provider, model, key, prompt đều nằm trong `src/ai/`. Đọc `src/ai/AGENTS.md` trước.

## Bước 1 — Cài SDK (cần người dùng đồng ý vì thêm thư viện)

```bash
pnpm add ai @ai-sdk/react
pnpm add @ai-sdk/anthropic      # hoặc @ai-sdk/openai, @ai-sdk/google — chỉ cài provider đang dùng
```

`.env.local`: `AI_PROVIDER=anthropic`, `AI_MODEL=<model id của provider>`, `AI_API_KEY=...`

## Bước 2 — Tạo `src/ai/model.ts` (chỗ duy nhất biết provider)

```ts
import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";
import { env } from "@/lib/env";
import { aiConfig, assertAIEnabled } from "./config";

export function getModel() {
  assertAIEnabled();
  switch (aiConfig.provider) {
    case "anthropic":
      return createAnthropic({ apiKey: env.AI_API_KEY })(aiConfig.model!);
    default:
      throw new Error(`AI provider chưa hỗ trợ: ${aiConfig.provider}`);
  }
}
```

## Bước 3 — Hàm nghiệp vụ AI trong `src/ai/` rồi export qua `index.ts`

Trả lời một lần (dùng trong Server Action):

```ts
// src/ai/generate-reply.ts
import "server-only";
import { generateText } from "ai";
import { getModel } from "./model";
import { systemPrompt } from "./prompts/system";

export async function generateReply(input: string) {
  const { text } = await generateText({ model: getModel(), system: systemPrompt.text, prompt: input });
  return text;
}
```

Streaming chat (Route Handler `src/app/api/ai/chat/route.ts`):

```ts
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { aiConfig, getModel, systemPrompt } from "@/ai";

export async function POST(req: Request) {
  if (!aiConfig.enabled) return Response.json({ error: "AI chưa bật" }, { status: 503 });
  // TODO: kiểm tra đăng nhập + rate limit trước khi lên production
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: getModel(),
    system: systemPrompt.text,
    messages: await convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}
```

Client: `useChat()` từ `@ai-sdk/react` trong component `"use client"` của feature (mặc định gọi `/api/ai/chat`).

## Bước 4 — Mở rộng khi cần

- **Structured output:** `generateText({ ..., output: Output.object({ schema }) })` với zod schema đặt ở `src/ai/schemas/`.
- **Tool calling:** mỗi tool một file trong `src/ai/tools/` dùng `tool({ description, inputSchema, execute })`; giới hạn vòng lặp bằng `stopWhen: stepCountIs(5)`.
- API của AI SDK đổi nhanh giữa các major version — khi lỗi type, đọc `node_modules/ai/README.md` / docs ai-sdk.dev thay vì đoán.

## Checklist

- [ ] Không có SDK provider nào bị import ngoài `src/ai/`
- [ ] Không hard-code model id; tắt AI (xoá env) app vẫn chạy
- [ ] Input người dùng có giới hạn độ dài + validate zod
- [ ] Route AI có auth + rate limit trước khi deploy public
- [ ] `/api/health` trả `features.ai: true` khi đã cấu hình
- [ ] Cập nhật `src/ai/AGENTS.md` nếu thêm tool/prompt/schema mới
