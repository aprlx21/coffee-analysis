# server/ — Hạ tầng phía server

Code chỉ chạy ở server, dùng chung cho nhiều feature. Mọi file ở đây bắt đầu bằng `import "server-only"`.

## db/ — Data Access Layer (read-only, postgres.js)

DB là Supabase Postgres, dùng **postgres.js** (`postgres`), KHÔNG phải Drizzle. Chỉ SELECT.

- `client.ts`: `getSql()` singleton, `prepare: false` (pooler 6543), `ssl: 'require'`, `max: 5`. Env `DATABASE_URL` (pooler URI) đọc qua `@/lib/env`; đặt trong `web/.env.local`.
- `queries/*.ts`: mỗi hàm là `"use cache"` + `cacheLife("hours")`; tham số hoá bằng tagged template (không nối chuỗi). Tên cột động chỉ lấy từ whitelist `AMENITY_KEYS`.
- `index.ts` là public API — import từ `@/server/db`:

| Hàm | Trả về |
|---|---|
| `listCafes(filters, sort?, page?)` | `{items: CafeCard[], total, page, pageSize(24), pageCount}` |
| `getCafe(placeId)` | `Cafe \| null` (đủ cột + `flags` boolean + `acSource`/`outletsSource`) |
| `getCafeMenu(placeId)` | `MenuGroup[]` (nhóm cà phê / trà / khác, giá min–max từ `v_typical_price_v2`) |
| `getFacets()` | `{total, amenities{key:count}, categories[], priceRanges[]}` (toàn bộ quán) |
| `listCanonicalItems()` | `{canonicalId, displayName}[]` (33 món) |
| `getMapPoints(filters)` | `MapPoint[]` (id, name, lat, lng, rating, featuredImage, priceRange) |

- Bộ lọc: `CafeFilters` + `parseCafeFilters(searchParams)` + `cafeFiltersToSearchParams` ở `@/features/cafes`. Amenities lọc AND; `item` + `maxItemPrice` lọc theo `v_typical_price_v2`.
- Nguồn: view `v_cafe_directory` (SQL ở `web/sql/`, issue #1) và `v_typical_price_v2`. Số nguyên/số thực đã ép về `number` trong SQL (`::float8`/`::int`).
- Giá trị `has_ac`/`has_outlets` là suy luận từ review: UI phải gắn nhãn "suy luận từ review".
- Test nhanh: tạo route handler tạm gọi các hàm trên rồi xoá (không commit); kỳ vọng 115 quán, `has_wifi` = 84.

## Chỗ dành sẵn (tạo khi cần — đang trống)

| Folder | Dùng cho | Gợi ý công nghệ |
|---|---|---|
| `auth/` | Phiên đăng nhập, phân quyền, `getCurrentUser()` | Auth.js hoặc Better Auth |
| `payments/` | Tạo thanh toán, xử lý webhook | Stripe / PayOS / VNPay |
| `notifications/` | Gửi email, push | Resend |
| `storage/` | Upload file | Vercel Blob / Cloudflare R2 |

## Quy ước

- Mỗi dịch vụ một folder, có `index.ts` export hàm cấp cao, không lộ SDK ra ngoài.
- Secret đọc qua `@/lib/env`. Thêm thư viện mới cần được đồng ý (xem AGENTS.md gốc).
- Khi tạo folder mới ở đây, tạo kèm `AGENTS.md` mô tả: mục đích, biến env cần, cách test local.
- Luôn kiểm tra quyền (authorization) ở server action/route trước khi gọi xuống đây.
