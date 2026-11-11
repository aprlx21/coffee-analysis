# ask-ai/ — Trợ lý AI Cà phê An Thượng

Feature quản lý giao diện và tương tác với Trợ lý AI chuyên biệt cho khu phố Tây An Thượng (Đà Nẵng).

## Mục tiêu & Trạng thái

- **Giai đoạn hiện tại (MVP v0.1)**: Giao diện tĩnh "Coming Soon" với khung chat Neubrutalism hoàn chỉnh, chuẩn bị chỗ cho Chatbot RAG (Retrieval-Augmented Generation).
- **Giai đoạn tiếp theo (Post-MVP)**: Kết nối API LLM (Gemini Flash) + pgvector / RAG truy xuất dữ liệu từ 115 quán cafe, 6.000+ món menu OCR và đánh giá thực tế.
- **Ranh giới nghiêm ngặt**: Ở phiên bản hiện tại, KHÔNG gọi API ngoài/LLM, KHÔNG thêm biến môi trường, KHÔNG cài thêm dependencies.

## Cấu trúc

```
features/ask-ai/
├── AGENTS.md                          # Tài liệu ngữ cảnh feature
├── index.ts                           # Public API xuất ra ngoài
└── components/
    └── ask-ai-view.tsx                # Khung chat tĩnh Neubrutalism chuẩn bị cho RAG
```

## Quy ước Thiết kế (Neubrutalism)

- Khung chat với viền đen `border-2 border-border`, bóng khối cứng `shadow-hard-card` (4px) và `shadow-hard` (3px).
- Nền kem `bg-background` (#FFFDF5), bề mặt card `bg-card` (#FFFFFF), điểm nhấn vàng `bg-primary` (#FFE600).
- Tin nhắn AI chào mừng trình bày rõ năng lực của trợ lý (làm việc, so sánh giá menu OCR, tiện ích).
- 4 câu hỏi gợi ý mẫu dạng chips tương tác xúc giác với tooltip và phản hồi demo.
- Ô nhập liệu và nút gửi ở trạng thái chuẩn bị (disabled) kèm ghi chú rõ ràng về lộ trình RAG.
