# ai/ — Lớp tích hợp AI & RAG

Mọi thứ liên quan tới LLM và tìm kiếm ngữ nghĩa nằm tập trung ở đây để: đổi provider/model không phải sửa feature, prompt được review như code, và API key không bao giờ lọt ra client. **Server-only.**

## Cấu trúc

```
ai/
├── index.ts        # public API — feature chỉ import từ "@/ai"
├── config.ts       # provider (groq/openai), model, cờ enabled (đọc từ env)
├── model.ts        # khởi tạo client OpenAI/Groq (@ai-sdk/openai)
├── prompts/        # prompt = code, mỗi prompt có id + version
│   └── system.ts   # System prompt chuyên gia Cà phê An Thượng (id: an-thuong-coffee-expert-v4)
├── rag/            # Tầng RAG ngữ nghĩa (LanceDB + gemini-embedding-001)
│   ├── types.ts       # Hợp đồng chung: 4 kinds, 768 dimensions, table name, types chunk/hit/filter
│   ├── chunk.ts       # Sinh chunk định dạng chuẩn cho review, profile, menu, insight; contentHash sha1
│   ├── embed-core.ts  # Client Gemini embedding (@ai-sdk/google), chuẩn hóa L2, retry/backoff phân loại lỗi
│   ├── embed.ts       # Singleton embedder runtime (server-only), embedQuery (taskType: RETRIEVAL_QUERY)
│   └── store.ts       # Truy vấn LanceDB read-only lúc runtime, cosine distance, lọc metadata an toàn
└── tools/          # Tool-calling tra cứu dữ liệu thật từ Supabase & LanceDB
    ├── search-cafes.ts        # Lọc quán theo tiện ích, khoảng giá, rating (v_cafe_directory)
    ├── get-cafe-detail.ts     # Xem chi tiết giờ giấc, liên hệ, đánh giá nổi bật
    ├── get-cafe-menu.ts       # Xem danh mục đồ uống bóc tách OCR
    ├── compare-item-prices.ts # So sánh giá món chuẩn hoá giữa các quán (v_typical_price_v2)
    ├── suggest-drink-price.ts # Gợi ý định giá đồ uống OLS từ địa chỉ/mặt bằng mở quán (@/server/pricing)
    ├── get-market-insights.ts # Trích mục liên quan (theo topic) từ features/analytics/data/market-insights.md
    └── search-knowledge.ts    # RAG ngữ nghĩa: tìm review, hồ sơ, món thô, báo cáo thị trường (LanceDB)
```

Dữ liệu & script liên quan (ngoài thư mục `src/ai/`):
- `web/scripts/build-rag-index.ts`: Script CLI nạp dữ liệu từ DB/file, embed và ghi bảng LanceDB.
- `web/data/lancedb/`: Thư mục chỉ mục vector LanceDB (chỉ đọc lúc runtime, commit vào repository).

## Luồng chuẩn

```
UI (features/ask-ai/components, "use client")
  → Route Handler app/api/ai/chat/route.ts
      → Validate body bằng zod (chỉ nhận text, tối đa 8 tin gần nhất) — TRƯỚC khi trừ lượt
      → Rate Limit: bản MVP TẮT (AI_QUOTA_ENABLED = false); khi bật: AI_DAILY_QUOTA = 5 câu/24h (checkAndConsumeAiQuota)
      → streamText() với model Groq + tools tra cứu cấu trúc & searchKnowledge (RAG ngữ nghĩa)
          → searchKnowledge: embed truy vấn (gemini-embedding-001, 768d, RETRIEVAL_QUERY) → tìm k vector gần nhất (LanceDB cosine)
          → Lỗi mềm: nếu thiếu GEMINI_API_KEY hoặc chưa build index, searchKnowledge trả thông điệp lỗi mềm thân thiện, AI tự động dùng các tool cấu trúc khác mà không ngắt stream
          → Trả về streaming UIMessage kèm header X-AI-Remaining-Quota
```

## RAG ngữ nghĩa (LanceDB + gemini-embedding-001)

### 1. Phân loại nội dung (4 `kind`) & nguồn dữ liệu
- `review`: Bóc tách từ `v_cafe_directory.featured_reviews`. Bỏ qua review < 15 ký tự, cắt tối đa 800 ký tự. Kèm metadata: tên quán, tác giả, rating, ngày đăng.
- `profile`: Tổng hợp từ `v_cafe_directory`. Gồm mô tả quán, danh mục, các cờ tiện ích boolean chuyển thành văn bản tự nhiên (wifi, máy lạnh, làm việc laptop...), và top 10 từ khóa nổi bật trích từ `review_keywords`.
- `menu`: Ghép dữ liệu món thô từ `menu_item` và `canonical_item`. Khử trùng lặp theo tên raw chuẩn hóa, nhóm theo danh mục chuẩn, định dạng khoảng giá VND. Các món có cờ `is_suspicious` được đánh dấu "giá chưa xác minh". Giới hạn chunk tối đa ~2500 ký tự.
- `insight`: Đọc từ `features/analytics/data/market-insights.md`. Chia chunk theo cấp độ heading Markdown (`#`, `##`, `###`), độ dài tối đa 1500 ký tự, phần thân dài được cắt đoạn kèm overlap ~150 ký tự.

### 2. Schema bảng LanceDB `knowledge`
Bảng `knowledge` lưu trong `web/data/lancedb/`:
- `id`: `Utf8` — Khóa chính logic: `sha1(kind + placeId + source)`.
- `kind`: `Utf8` — Thuộc tập `["review", "profile", "menu", "insight"]`.
- `placeId`: `Utf8` (nullable) — `null` đối với `kind = insight`.
- `text`: `Utf8` — Nội dung văn bản đưa vào tìm kiếm ngữ nghĩa.
- `contentHash`: `Utf8` — `sha1(text)`, dùng để resume (bỏ qua chunk đã embed nếu nội dung không đổi).
- `rating`: `Float32` (nullable).
- `workScore`: `Float32` (nullable).
- Cờ tiện ích boolean: `hasWifi`, `quiet`, `hasAc`, `hasOutlets`, `laptopFriendly`, `petFriendly`.
- `meta`: `Utf8` — JSON string lưu metadata mở rộng (`placeName`, `author`, `heading`, `publishedAt`...).
- `vector`: `FixedSizeList<Float32>[768]` — Vector embedding chuẩn hóa Euclidean (L2 norm).

### 3. Quy ước import `.ts` & `node --experimental-strip-types`
Script `scripts/build-rag-index.ts` chạy độc lập bằng Node 22 với cờ `--experimental-strip-types` (không qua bundler của Next.js).
- Để tương thích với trình strip-types của Node, các file dùng chung giữa script và app (`types.ts`, `chunk.ts`, `embed-core.ts`) khi import lẫn nhau hoặc khi script import phải dùng đường dẫn tương đối có đuôi file rõ ràng (ví dụ: `import ... from "./types.ts"`).
- Vì `tsconfig.json` không bật `allowImportingTsExtensions` (để Next.js build bình thường), tại các vị trí import đuôi `.ts` trong script dùng comment `// @ts-expect-error` để bỏ qua lỗi typecheck TS5097.
- Không import `"server-only"` trong các file dùng chung này.

### 4. Build index (`pnpm rag:build`)
- **Lệnh thực thi**: Chạy trong thư mục `web/`:
  ```bash
  pnpm rag:build
  ```
  *(Lưu ý: gọi trực tiếp như `pnpm rag:build --dry-run`, không cần truyền `--` thừa; nếu pnpm vẫn chuyển nguyên `--` vào script thì `parseArgs` sẽ tự động bỏ qua token `--` đứng riêng).*
- **Các cờ CLI hỗ trợ**:
  - `--dry-run`: Chạy thử bóc tách và chunking dữ liệu, in thống kê mà không gọi Gemini API embedding và không ghi LanceDB.
  - `--out <dir>`: Chỉ định thư mục lưu trữ index LanceDB (mặc định: `data/lancedb`).
  - `--only <kind>`: Chỉ xây dựng cho một loại dữ liệu cụ thể (`review`, `profile`, `menu`, hoặc `insight`).
  - `--fresh`: Xóa bảng cũ và build lại từ đầu toàn bộ dữ liệu, bỏ qua cơ chế resume.
  - `--fake-embed`: Dùng vector xác định sinh từ sha1 (không phải ngẫu nhiên), chỉ dùng cho kiểm thử nhanh quy trình mà không gọi API Gemini. Script TỪ CHỐI chạy nếu thiếu `--out` trỏ ra ngoài `data/lancedb`.

### 5. Điều kiện cần khi build index
- `DATABASE_URL`: Chuỗi kết nối Supabase Postgres (read-only) để đọc `v_cafe_directory`, `menu_item`, `canonical_item`.
- `GEMINI_API_KEY`: API key Google AI Studio có quyền gọi model `gemini-embedding-001`.

### 6. Xử lý 429 rate limit, resume & tính idempotent
- **Tính Idempotent**: Khóa `id` được sinh ổn định theo công thức `sha1(kind|placeId|source)`. Chạy build nhiều lần cho ra kết quả trùng khớp, không bị nhân đôi dữ liệu.
- **Cơ chế Resume**: So khớp `contentHash` (`sha1(text)`) với các bản ghi đã tồn tại trong index. Những chunk chưa từng thay đổi văn bản sẽ được giữ nguyên vector cũ, giúp tiết kiệm đáng kể thời gian và quota API khi chạy lại.
- **Xử lý Rate Limit (429)**: Trong `embed-core.ts`, client tự động đọc header `Retry-After`, áp dụng exponential backoff có jitter (chờ từ 2s đến 60s, thử lại tối đa 6 lần). Các lỗi vĩnh viễn (400, 401, 403, 404, quota=0) được phát hiện ngay để dừng script sớm, tránh retry vô ích.

### 7. Đồng nhất embedding & taskType
- Index và truy vấn bắt buộc phải dùng **CÙNG model** (`gemini-embedding-001`) và **CÙNG kích thước 768 chiều** (`outputDimensionality: 768`).
- Vector luôn được chuẩn hóa chuẩn L2 (`normalizeVector`) trước khi lưu trữ hoặc so khớp cosine distance.
- Sử dụng đúng `taskType`:
  - `RETRIEVAL_DOCUMENT`: Khi tạo vector tài liệu trong lúc build index.
  - `RETRIEVAL_QUERY`: Khi tạo vector cho câu hỏi người dùng tại runtime.

### 8. Vận hành thủ công (Manual Pipeline)
- Không có pipeline tự động chạy ngầm hay cron job. Khi dữ liệu quán trên Supabase hoặc file `market-insights.md` có cập nhật lớn, lập trình viên chạy lệnh `pnpm rag:build` bằng tay trên môi trường phát triển để cập nhật index.

### 9. Triển khai trên Vercel
- **Cấu hình Next.js (`next.config.ts`)**:
  - `serverExternalPackages: ["@lancedb/lancedb"]`: Giữ LanceDB nguyên dạng native package, tránh bị Turbopack/Webpack đóng gói sai.
  - `outputFileTracingIncludes: { "/api/ai/chat": ["./data/lancedb/**/*"] }`: Đóng gói thư mục dữ liệu LanceDB đi kèm theo serverless function của route chat.
- **Kho dữ liệu read-only**: Thư mục `web/data/lancedb/` được commit trực tiếp vào Git. Tại môi trường serverless, LanceDB chỉ mở ở chế độ đọc (`openTable`), không thực hiện bất kỳ thao tác ghi file nào.
- **Kích thước gói nén**: Vercel giới hạn kích thước serverless function (~250MB sau giải nén). Cần đo và kiểm soát dung lượng thư mục `data/lancedb/` trước khi commit.
- **Biến môi trường**: Đặt `GEMINI_API_KEY` đầy đủ ở cả môi trường **Production** và **Preview** trên Vercel Dashboard.

### 10. Cơ chế lỗi mềm (Graceful Fallback)
- Runtime kiểm tra tính khả dụng bằng `isEmbeddingConfigured()` (kiểm tra `GEMINI_API_KEY`) và `hasKnowledgeIndex()` (kiểm tra mở bảng `knowledge`).
- Khi thiếu key, chưa build index hoặc lỗi mạng bất ngờ: tool `searchKnowledge` trả về đối tượng `{ error: "..." }`. Model AI sẽ nhận biết tình trạng này, tiếp tục giải quyết yêu cầu bằng các tool dữ liệu có cấu trúc và thông báo nhẹ nhàng với người dùng mà không làm ngắt quãng luồng streaming SSE.

## Biến môi trường

Khai báo trong `.env.local`:
- `GROQ_API_KEY`: API Key từ console.groq.com (dùng cho mô hình hội thoại).
- `AI_PROVIDER`: `groq` (mặc định).
- `AI_MODEL`: `qwen/qwen3.8-27b` hoặc model hỗ trợ trên Groq.
- `AI_FALLBACK_MODEL`: model Gemini dự phòng (mặc định `gemini-3.5-flash-lite`, dùng `GEMINI_API_KEY`; thiếu key hoặc rỗng = tắt). `getModel()` tự chuyển sang model này nếu model chính lỗi lúc mở stream (429/5xx/404/401…, trừ 400/413/422). Lỗi giữa chừng khi đã stream một phần thì không thử lại.
- Hoàn lượt: nếu AI lỗi/không trả lời được, route gọi `refundAiQuota` (SQL `web/sql/003_refund_ai_quota.sql` — cần chạy trên Supabase) để không mất lượt oan.
- `RATE_LIMIT_SALT`: Chuỗi ngẫu nhiên dùng để băm định danh client phục vụ giới hạn lượt hỏi.
- `GEMINI_API_KEY`: API Key từ Google AI Studio (aistudio.google.com) cho `gemini-embedding-001`. Cần thiết lập ở cả Production & Preview. Thiếu key → `searchKnowledge` trả lỗi mềm.
- `DATABASE_URL`: Chuỗi kết nối Supabase Postgres (read-only), bắt buộc khi build index RAG và cho Data Access Layer.

## Quy ước tool & prompt

- **Phân định trách nhiệm dữ liệu**: Giá, rating và các tiện ích cốt lõi (wifi, máy lạnh, ổ cắm...) **LUÔN** lấy từ các tool cấu trúc (`searchCafes`, `getCafeDetail`, `getCafeMenu`, `compareItemPrices`). **KHÔNG** lấy giá, rating hay tiện ích từ kết quả `searchKnowledge` — RAG chỉ dùng để trích dẫn review, nắm bắt phong cách/vibe và thực đơn ngoài danh mục chuẩn.
- **Bắt buộc trích dẫn nguồn**: Khi trả lời từ tri thức của `searchKnowledge`, phải nêu rõ nguồn: "theo đánh giá của khách", "theo hồ sơ quán", "theo thực đơn", hoặc "theo báo cáo thị trường".
- **Link nội bộ**: Tên quán nhắc tới phải link tới trang chi tiết dạng `**[Tên quán](/quan/<placeId>)**` (sử dụng trường `url` trả về từ tool).
- **System prompt version**: System prompt hiện tại có id `an-thuong-coffee-expert-v5`. Sửa prompt thì phải tăng version.
- **Cảnh báo giá bất thường**: Các món có cờ `isSuspicious` hoặc giá lệch sâu không được khẳng định chắc chắn; bắt buộc kèm ghi chú cảnh báo (ví dụ giá mang đi, vỉa hè hoặc sai sót bóc tách OCR).
- **Tối ưu token**: Kết quả tool trả về càng gọn càng tốt; `getMarketInsights` chỉ trả các mục `## N.` khớp chủ đề.
- `market-insights.md` được đọc bằng `fs` lúc chạy; trang `/insights` cũng render chính file này.
