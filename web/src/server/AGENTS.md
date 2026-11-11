# server/ — Hạ tầng phía server

Code chỉ chạy ở server, dùng chung cho nhiều feature. Mọi file ở đây bắt đầu bằng `import "server-only"`.

## Chỗ dành sẵn (tạo khi cần — đang trống)

| Folder | Dùng cho | Gợi ý công nghệ |
|---|---|---|
| `db/` | Kết nối DB, schema, migration | Drizzle ORM + Postgres (Neon/Supabase) |
| `auth/` | Phiên đăng nhập, phân quyền, `getCurrentUser()` | Auth.js hoặc Better Auth |
| `payments/` | Tạo thanh toán, xử lý webhook | Stripe / PayOS / VNPay |
| `notifications/` | Gửi email, push | Resend |
| `storage/` | Upload file | Vercel Blob / Cloudflare R2 |

## Quy ước

- Mỗi dịch vụ một folder, có `index.ts` export hàm cấp cao (`sendEmail()`, `createCheckout()`), không lộ SDK ra ngoài.
- Secret đọc qua `@/lib/env`. Thêm thư viện mới cần được đồng ý (xem AGENTS.md gốc).
- Khi tạo folder mới ở đây, tạo kèm `AGENTS.md` mô tả: mục đích, biến env cần, cách test local.
- Luôn kiểm tra quyền (authorization) ở server action/route trước khi gọi xuống đây.
