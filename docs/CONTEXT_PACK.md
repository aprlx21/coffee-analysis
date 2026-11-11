# CONTEXT PACK — đọc file này thay vì toàn bộ repo

> Dành cho mọi agent (Claude Haiku/Sonnet, Antigravity). Mỗi phiên chat = 1 issue GitHub.
> Repo: `aprlx21/coffee-analysis` · Epic + issues: `gh issue list --milestone "MVP v0.1"`

## 1. Phạm vi hiện tại (2026-11-11)
- **Pipeline tự động đã HỦY.** Không viết scraper/OCR/runner. Bỏ qua `pipeline/` trừ khi issue yêu cầu.
- Web Next.js trong `web/` **chỉ ĐỌC** database Supabase có sẵn.
- **Hỏi AI, RAG, Insights = coming soon** (chưa gọi LLM ở MVP).

## 1b. Ai làm gì
| Thực hiện | Issue |
|---|---|
| **Antigravity** | App shell · Khám phá (lọc + lưới) · Chi tiết quán · Hỏi AI (soon) · Phân tích + Insights (soon) |
| **Claude Opus** | SQL view `v_cafe_directory` · Data Access Layer · Bản đồ Leaflet · **review mọi PR** trước khi merge |

Antigravity mở PR xong → nhắn Claude: `Review PR #<n>` (kiểm tra đúng dữ liệu, DESIGN.md, pnpm check/build, mobile 375px).

## 2. Quy tắc bắt buộc
- Làm đúng 1 issue, chỉ sửa file trong phạm vi "Chỉ được sửa" của issue. Branch `issue-<n>-<slug>`, commit có `Closes #<n>`.
- Trước khi báo xong: trong `web/` chạy `pnpm check && pnpm build` (0 lỗi), mở trang kiểm tra ở 1280px và 375px.
- Đọc `web/AGENTS.md` (stack đã chốt, ranh giới), `web/DESIGN.md` (UI). Next.js 16 khác dữ liệu train → tra `web/node_modules/next/dist/docs/` khi dùng API cache/routing.
- Không thêm thư viện ngoài danh sách đã duyệt: `postgres`, `leaflet`, `react-leaflet`, `@types/leaflet`. Không sửa `next.config.ts`/`tsconfig.json`/CI nếu issue không nói.
- Không commit `.env*`. DB URL đọc qua `@/lib/env` (`DATABASE_URL`).

## 3. Design — Neubrutalism (tóm tắt DESIGN.md)
Viền đen `border-2 border-border` · bóng cứng 0 blur (`shadow-hard` 3px, card 4px, modal 6px) · primary vàng `bg-primary` (#FFE600) · nền kem `bg-background` · font Be Vietnam Pro, giá/tọa độ Geist Mono (`35.000đ`) · bo `rounded-lg` 8px, pill `rounded-full` · hover nhấc `-translate-0.5`, active ấn lún `translate-[2px]` · CẤM `shadow-sm/md/xl`, blur, hex trong component.

Bố cục (từ mẫu Dribbble slothUI Map Location Listing): icon rail trái 72px · nội dung: tiêu đề lớn "{n} quán cafe tại An Thượng" + dòng phụ · hàng điều khiển (Grid/List · Sắp xếp · Bộ lọc) · card: ảnh cover + badge + nút tim, nhãn loại quán, tên đậm, sao + số review, địa chỉ (pin) trái · giá phải.
Routes: `/` Khám phá · `/ban-do` Bản đồ · `/hoi-ai` (soon) · `/phan-tich` · `/insights` (soon) · `/quan/[placeId]`.

## 4. Dữ liệu thật (Supabase Postgres 17, pooler 6543 → `prepare: false`)
| Bảng/View | Dòng | Ghi chú |
|---|---|---|
| `shop` | 115 | place_id, name, main_category, address, lat, lng, rating, reviews, price_range, phone, website, maps_link, raw_json (TEXT) |
| `v_typical_price_v2` | 764 | place_id, shop_name, canonical_id, display_name, price_min, price_max, match_uncertain — **dùng view này cho giá**, phủ 76/115 quán |
| `canonical_item` | 33 | canonical_id, display_name (ca_phe_sua, bac_xiu, latte…) |
| `menu_item`/`item_price` | 5807/6107 | chi tiết OCR, thường không cần |
| `v_cafe_directory` | — | **tạo ở issue #1**: view phẳng cho web (tiện ích, ảnh, giờ, work_score, giá) |

- `raw_json` các trường lồng bị **double-encode**: `(raw_json::jsonb->>'about')::jsonb`.
- Tiện ích có trong `about`: Wi-Fi 84, Good for working on laptop 41, Outdoor seating 74, Quiet 19, Dogs allowed 36, Credit cards 96, NFC 57.
- Máy lạnh/ổ cắm KHÔNG có trong `about` → suy từ `review_keywords` + `featured_reviews[].review_text` (gắn nhãn "suy luận từ review").
- price_range: `D1-100,000` 65 · `D100-200K` 26 · null 21 · `D200-300K` 2.
- Tọa độ: lat 16.040–16.059, lng 108.238–108.249; tâm An Thượng (16.0497, 108.2440).

## 5. Kiến trúc code web
`app/` (mỏng) → `features/<x>/` (index.ts public API) → `components/ui` (shadcn), `server/db` (DAL, server-only), `lib/env.ts`.
Bộ lọc dùng chung: zod `CafeFilters` ở `src/features/cafes/schema.ts`, state trên URL searchParams.
