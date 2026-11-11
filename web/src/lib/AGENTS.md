# lib/ — Tiện ích dùng chung

## Nội dung

- `utils.ts` — `cn()` gộp class Tailwind (shadcn sinh ra).
- `env.ts` — biến môi trường server, validate bằng zod. **Server-only.**
- `site-config.ts` — tên app, mô tả, URL, menu. An toàn cho client.

## Quy ước

- Chỉ chứa hàm **thuần**, không phụ thuộc React, không gọi DB/API (những thứ đó thuộc `server/`).
- Hàm chỉ chạy ở server thì thêm `import "server-only"` ở đầu file.
- Thêm biến môi trường: khai báo trong `env.ts` → thêm vào `.env.example` → ghi chú ở README nếu bắt buộc.
- Không tạo file "tạp" kiểu `helpers.ts` khổng lồ; đặt tên theo chức năng (`format-currency.ts`, `slugify.ts`).
