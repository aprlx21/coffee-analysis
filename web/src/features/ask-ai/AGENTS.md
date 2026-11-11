# ask-ai/ — Trợ lý AI Cà phê An Thượng

Giao diện chat thật với trợ lý AI (Groq + tool-calling trên dữ liệu Supabase). Trang: `/hoi-ai`.

## Luồng

```
AskAiView ("use client")
  → useAskAi()  ── GET  /api/ai/quota        (số lượt còn lại)
                └─ POST /api/ai/chat         (SSE UI message stream của AI SDK)
                     → validate → trừ lượt → streamText(Groq + tools trong @/ai)
```

- `hooks/use-ask-ai.ts` tự đọc SSE (`data: {type: "text-delta" | "tool-input-start" | "error" ...}`), **không** dùng `@ai-sdk/react` để khỏi thêm dependency. Nếu sau này cài `@ai-sdk/react` thì thay hook này bằng `useChat`.
- Client chỉ gửi phần text của lịch sử; server giữ tối đa 8 tin gần nhất, câu hỏi tối đa 1000 ký tự (UI chặn ở 500).
- Lượt hỏi: `AI_DAILY_QUOTA` (3 lượt/24h) ở `@/server/rate-limit/ai-quota`. Server trả header `X-AI-Remaining-Quota`, `X-AI-Quota-Max`; hết lượt trả 429 `QUOTA_EXCEEDED` kèm `reset_at`.
- Lỗi luôn có dạng `{ error: CODE, message: "tiếng Việt hiển thị được" }` — UI in thẳng `message`.

## Cấu trúc

```
features/ask-ai/
├── index.ts
├── hooks/use-ask-ai.ts            # state chat + đọc stream + quota
└── components/ask-ai-view.tsx     # khung chat, gợi ý, bong bóng, ô nhập
```

Câu trả lời render bằng `@/components/markdown` (bảng, danh sách, link nội bộ `/quan/<placeId>`).

## Lưu ý

- Khung chat cao theo viewport (`100dvh` trừ header/bottom-nav); vùng tin nhắn cuộn bên trong, tự bám đáy trừ khi người dùng cuộn lên.
- Thêm tool mới ở `@/ai/tools` thì bổ sung nhãn tiếng Việt vào `TOOL_LABELS` / `TOOL_DONE_LABELS`.
- Máy lạnh/ổ cắm là dữ liệu suy luận từ review — giữ dòng cảnh báo dưới ô nhập.
- Test tay sẽ trừ lượt thật trong bảng `ai_rate_limits` (định danh = hash IP + User-Agent).
