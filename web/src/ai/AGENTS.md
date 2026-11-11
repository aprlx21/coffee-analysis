# ai/ — Lớp tích hợp AI & RAG

Mọi thứ liên quan tới LLM nằm tập trung ở đây để: đổi provider/model không phải sửa feature, prompt được review như code, và API key không bao giờ lọt ra client. **Server-only.**

## Cấu trúc

```
ai/
├── index.ts        # public API — feature chỉ import từ "@/ai"
├── config.ts       # provider (groq/openai), model, cờ enabled (đọc từ env)
├── model.ts        # khởi tạo client OpenAI/Groq (@ai-sdk/openai)
├── prompts/        # prompt = code, mỗi prompt có id + version
│   └── system.ts   # System prompt chuyên gia Cà phê An Thượng
└── tools/          # Tool-calling RAG tra cứu dữ liệu thật từ Supabase
    ├── search-cafes.ts        # Lọc quán theo tiện ích, khoảng giá, rating (v_cafe_directory)
    ├── get-cafe-detail.ts     # Xem chi tiết giờ giấc, liên hệ, đánh giá nổi bật
    ├── get-cafe-menu.ts       # Xem danh mục đồ uống bóc tách OCR
    └── compare-item-prices.ts # So sánh giá món chuẩn hoá giữa các quán (v_typical_price_v2)
```

## Luồng chuẩn

```
UI (features/ask-ai/components, "use client")
  → Route Handler app/api/ai/chat/route.ts
      → Kiểm tra Rate Limit 3 câu/24h (checkAndConsumeAiQuota)
      → streamText() với model Groq + tools RAG
          → Trả về streaming UIMessage kèm header X-AI-Remaining-Quota
```

## Biến môi trường

Khai báo trong `.env.local`:
- `GROQ_API_KEY`: API Key từ console.groq.com
- `AI_PROVIDER`: `groq` (mặc định)
- `AI_MODEL`: `qwen/qwen3.8-27b` hoặc model hỗ trợ trên Groq
- `RATE_LIMIT_SALT`: Chuỗi ngẫu nhiên dùng để băm định danh client
