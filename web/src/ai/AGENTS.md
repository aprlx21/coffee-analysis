# ai/ — Lớp tích hợp AI

Mọi thứ liên quan tới LLM nằm tập trung ở đây để: đổi provider/model không phải sửa feature, prompt được review như code, và API key không bao giờ lọt ra client. **Server-only.**

## Cấu trúc

```
ai/
├── index.ts        # public API — feature chỉ import từ "@/ai"
├── config.ts       # provider, model, cờ enabled (đọc từ env)
├── prompts/        # prompt = code, mỗi prompt có id + version
│   └── system.ts
├── tools/          # (tạo khi cần) tool cho tool-calling, mỗi tool một file + zod schema
└── schemas/        # (tạo khi cần) zod schema cho structured output
```

## Luồng chuẩn

```
UI (features/<x>/components, "use client")
  → Server Action (features/<x>/server/actions.ts)   # trả lời một lần
  → hoặc Route Handler app/api/ai/<x>/route.ts        # streaming
      → "@/ai" (generate/stream, prompt, tools)
          → Provider SDK
```

## Quy ước

- Không gọi SDK của provider ở ngoài folder này. Không hard-code tên model — dùng `aiConfig.model`.
- Kiểm tra `aiConfig.enabled`; khi tắt, feature phải ẩn hoặc báo "chưa bật AI" chứ không crash.
- Validate input người dùng (zod, giới hạn độ dài) trước khi đưa vào prompt; output dạng dữ liệu phải parse bằng zod schema.
- Route AI phải có xác thực + giới hạn tần suất (rate limit) trước khi lên production — tốn tiền thật.
- Không log nội dung prompt/response có dữ liệu cá nhân.

## Bật AI

1. Đặt `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` trong `.env.local`.
2. Làm theo skill `.agents/skills/ai-integration` (cài SDK, viết hàm generate/stream, tạo route).
3. Kiểm tra: `GET /api/health` trả `features.ai: true`.
