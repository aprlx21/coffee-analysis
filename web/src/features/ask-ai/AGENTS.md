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
- Lượt hỏi: bản MVP **không giới hạn** (`AI_QUOTA_ENABLED = false` → `/api/ai/quota` trả `{ unlimited: true }`, UI ẩn bộ đếm). Khi bật lại: `AI_DAILY_QUOTA` (5 lượt/24h) ở `@/server/rate-limit/ai-quota`. Server trả header `X-AI-Remaining-Quota`, `X-AI-Quota-Max`; hết lượt trả 429 `QUOTA_EXCEEDED` kèm `reset_at`.
- Lỗi luôn có dạng `{ error: CODE, message: "tiếng Việt hiển thị được" }` — UI in thẳng `message`.

## Cấu trúc

```
features/ask-ai/
├── index.ts
├── hooks/use-ask-ai.ts            # state chat + đọc stream + quota
├── components/ask-ai-view.tsx     # trang /hoi-ai: khung chat, gợi ý, ô nhập
├── components/chat-message.tsx    # MessageBubble/AssistantAvatar + nhãn tool dùng chung
├── components/chat-launcher.tsx   # nút nổi góc phải + bong bóng gợi ý (mount ở app/layout.tsx)
└── components/chat-popup-panel.tsx # panel chat popup (next/dynamic, chỉ tải khi mở lần đầu)
```

Câu trả lời render bằng `@/components/markdown` (bảng, danh sách, link nội bộ `/quan/<placeId>`).

## Lưu ý

- Khung chat cao theo viewport (`100dvh` trừ header/bottom-nav); vùng tin nhắn cuộn bên trong, tự bám đáy trừ khi người dùng cuộn lên.
- Các tool (`searchCafes`, `getCafeDetail`, `getCafeMenu`, `compareItemPrices`, `getMarketInsights`, `searchKnowledge`, `suggestDrinkPrice`) đều có nhãn hiển thị trong `components/chat-message.tsx` (`TOOL_LABELS` lúc đang gọi và `TOOL_DONE_LABELS` khi hoàn thành). Khi thêm tool mới ở `@/ai/tools`, bắt buộc phải bổ sung nhãn tiếng Việt tương ứng vào cả hai map.
- Máy lạnh/ổ cắm là dữ liệu suy luận từ review — giữ dòng cảnh báo dưới ô nhập.
- Test tay sẽ trừ lượt thật trong bảng `ai_rate_limits` (định danh = hash IP + User-Agent).

## Popup chat nhanh (`ChatLauncher`)

- Mount trong `app/layout.tsx` (trong `<Suspense>`, sau `<AppShell>`), ẩn ở `/hoi-ai`. Panel chỉ được tải/mount khi mở lần đầu (để `useAskAi` không fetch quota ở mọi trang), sau đó giữ mounted và ẩn bằng CSS để hội thoại không mất.
- Bong bóng gợi ý hiện sau ~4s, nhớ trạng thái đã đóng/đã mở bằng `localStorage["ask-ai-teaser-done"]` (luôn try/catch).
- Ở `/quan/[placeId]`, chip đầu tiên gắn `placeId` vào câu hỏi để AI gọi `getCafeDetail`.
- z-index: launcher 45, panel 46 (trên bottom-nav 40, dưới Sheet/overlay 50).
