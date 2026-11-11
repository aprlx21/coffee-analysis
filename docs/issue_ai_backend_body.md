## Bối cảnh
Người dùng đã cấu hình `GROQ_API_KEY` trong môi trường. Hệ thống cần hoàn thiện tầng Backend / Server AI cho tính năng Hỏi đáp thông minh (`/hoi-ai`) sử dụng Hybrid Tool-calling RAG trên dữ liệu thật của 115 quán cafe An Thượng (`v_cafe_directory`, `v_typical_price_v2`), đồng thời thực thi cơ chế Rate Limiting nghiêm ngặt giới hạn tối đa 3 câu hỏi / người dùng (IP/Session) trong vòng 24h để bảo vệ API key và kiểm soát chi phí.

## Phạm vi
- Tạo file SQL migration `web/sql/002_ai_rate_limits.sql` cho bảng rate limit và PostgreSQL stored procedure.
- Cập nhật `web/src/lib/env.ts` và `web/.env.example` để đọc `GROQ_API_KEY` (hoặc `AI_API_KEY`, `AI_MODEL`, `AI_PROVIDER=groq`).
- Cài đặt dependency cần thiết: `ai`, `@ai-sdk/openai` (kết nối endpoint Groq OpenAI-compatible) trong `web/package.json`.
- Hoàn thiện lớp `src/ai/`:
  - `src/ai/config.ts` & `src/ai/model.ts`: Khởi tạo Groq model (`llama-3.3-70b-versatile` hoặc `llama-3.1-8b-instant`).
  - `src/ai/prompts/system.ts`: System prompt trợ lý cafe An Thượng.
  - `src/ai/tools/search-cafes.ts`: Tool lọc quán từ view `v_cafe_directory` (dựa trên schema `CafeFilters`).
  - `src/ai/tools/get-menu.ts`: Tool tra cứu giá và menu từ view `v_typical_price_v2`.
- Hoàn thiện tầng Rate Limit server-side:
  - `src/server/rate-limit/ai-quota.ts`: Hash identifier (IP + User-Agent + salt) và gọi hàm atomic check-and-consume quota.
- Tạo API Route Handlers:
  - `POST /api/ai/chat`: Kiểm tra quota (chặn HTTP 429 nếu >= 3 câu), chạy `streamText` với Groq model và tools, trả về stream kèm header `X-AI-Remaining-Quota`.
  - `GET /api/ai/quota`: Trả về số lượt hỏi còn lại và thời gian reset cho client.
- Cập nhật `src/ai/AGENTS.md` và `src/server/AGENTS.md`.

## Chi tiết kỹ thuật
1. **Migration SQL (`web/sql/002_ai_rate_limits.sql`)**:
   - Bảng `ai_rate_limits`: `identifier TEXT PRIMARY KEY`, `questions_used INT DEFAULT 0`, `max_questions INT DEFAULT 3`, `first_asked_at TIMESTAMPTZ`, `last_asked_at TIMESTAMPTZ`, `reset_at TIMESTAMPTZ`.
   - Function `check_and_consume_ai_quota(p_identifier TEXT, p_max_limit INT DEFAULT 3)`: Atomic update với `FOR UPDATE`, tự động reset sau 24h nếu quá `reset_at`, trả về json `{ allowed: boolean, remaining: number, reset_at: string }`.
2. **Groq Provider (`src/ai/model.ts`)**:
   - Sử dụng `@ai-sdk/openai` với `baseURL: "https://api.groq.com/openai/v1"` và `apiKey: env.GROQ_API_KEY || env.AI_API_KEY`.
   - Default model: `llama-3.3-70b-versatile` (hỗ trợ tool-calling rất tốt và tốc độ cực cao trên Groq LPU).
3. **AI Tools**:
   - `search_cafes`: Nhận params từ `CafeFilters` (wifi, ac, quiet, outlets, maxPrice, ...), truy vấn parameterized SQL vào `v_cafe_directory`.
   - `get_menu_pricing`: Nhận `placeId` hoặc `canonicalId`, truy vấn `v_typical_price_v2`.
4. **Bảo mật & Rate limit**:
   - Identifier tạo bằng SHA-256 của `(client_ip + user_agent + secret_salt)`.
   - Validate input: Giới hạn câu hỏi tối đa 300 ký tự bằng Zod.
   - Giới hạn lặp: `maxSteps: 3` trong `streamText` để chống vòng lặp vô hạn.

## Ngoài phạm vi
- Giao diện người dùng phức tạp (UI Chat box hoàn chỉnh tại `/hoi-ai` sẽ do Antigravity đảm nhiệm ghép nối ở issue sau). Issue này chỉ tập trung vào Backend API, SQL, Tool-calling RAG và Rate Limiting.

## Phụ thuộc
- Cần xong #1 (view `v_cafe_directory`) và #2 (DAL Supabase).
- Hỗ trợ cho: #7 (trang `/hoi-ai`).

## Tiêu chí hoàn thành
- [ ] File SQL `web/sql/002_ai_rate_limits.sql` tạo thành công và chạy idempotent trên Supabase.
- [ ] Route `GET /api/ai/quota` trả về đúng `{ remaining: 3, allowed: true }` cho client mới.
- [ ] Route `POST /api/ai/chat` gọi được Groq model, thực thi tool calling tra cứu đúng dữ liệu từ `v_cafe_directory` và stream kết quả về client.
- [ ] Khi hỏi liên tiếp 3 câu, câu thứ 4 bị từ chối với status 429 và thông báo lỗi rõ ràng.
- [ ] Biến môi trường mới khai báo trong `src/lib/env.ts` và `.env.example`.
- [ ] `src/ai/AGENTS.md` và `src/server/AGENTS.md` được cập nhật đầy đủ.
- [ ] (DoD chung web) `pnpm check` và `pnpm build` trong `web/` chạy sạch lỗi.
- [ ] (DoD chung web) Không commit file `.env*` hay secret key lên git.

## 🤖 Agent brief
**Goal (đặt làm goal của phiên):** Hoàn thành Backend API cho Groq Tool-calling RAG và Rate Limiting (giới hạn 3 câu/24h), tích hợp đầy đủ SQL function, DAL và Route Handler, `pnpm check && pnpm build` sạch.
**Thực hiện:** Claude Opus
**Model gợi ý:** Claude Opus
**Review:** Antigravity review PR trước khi merge
**Đọc trước (theo thứ tự, không đọc thêm nếu không cần):** docs/CONTEXT_PACK.md → web/AGENTS.md → web/src/ai/AGENTS.md → web/src/server/AGENTS.md → web/sql/001_v_cafe_directory.sql
**Chỉ được sửa:** `web/package.json` (+ lockfile), `web/sql/002_ai_rate_limits.sql`, `web/src/lib/env.ts`, `web/.env.example`, `web/src/ai/**`, `web/src/server/**`, `web/src/app/api/ai/**`
**Xong khi:** DoD ở trên đạt → `pnpm check && pnpm build` trong `web/` → commit trên branch `issue-ai-backend-groq-rag` với "Closes #<id>"
**Bắt đầu chat bằng:** `Làm issue #<id> của aprlx21/coffee-analysis. Đọc docs/CONTEXT_PACK.md và issue (gh issue view <id>) rồi bắt đầu.`
