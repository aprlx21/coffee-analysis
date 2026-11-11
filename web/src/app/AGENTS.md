# app/ — Routing

## Mục đích

- Chỉ chứa file theo convention của Next.js: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, `opengraph-image.tsx`…
- Page/layout **mỏng**: lấy dữ liệu và component từ `@/features/*`, không viết logic nghiệp vụ ở đây.

## Quy ước

- Nhóm route không ảnh hưởng URL bằng route group: `(marketing)/`, `(app)/` (trang cần đăng nhập), `(admin)/`.
- Folder bắt đầu bằng `_` là private, không thành route (vd `_components/` nếu thật sự chỉ dùng cho một route).
- SEO: mỗi page export `metadata` hoặc `generateMetadata`. Title tự ghép theo template ở `layout.tsx`.
- Props của page/layout dùng type sinh tự động `PageProps<"/route">`, `LayoutProps<"/route">` (chạy `pnpm typecheck` để sinh).
- `cacheComponents` đang bật: dữ liệu động (cookies, headers, fetch không cache…) phải nằm trong `<Suspense>` hoặc dùng `"use cache"`. Đọc `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` trước khi đụng tới cache.

## API (`app/api/`)

- Route Handler chỉ dành cho client bên ngoài (webhook, mobile app, health check, streaming AI). Form/mutation nội bộ dùng Server Action.
- Một route = một file `route.ts`, gọi xuống `features/*/server` hoặc `@/ai`, không chứa logic dài.
- `api/health` — kiểm tra sau deploy, không xoá.

## Lưu ý

- Không đặt component dùng chung ở đây — đưa vào `src/components/` hoặc feature.
