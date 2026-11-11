---
name: ui-components
description: Dựng hoặc chỉnh giao diện bằng shadcn/ui + Tailwind v4 theo token trong DESIGN.md. Dùng khi tạo trang, form, bảng, dialog, card, đổi màu/theme/font, hoặc khi người dùng nói giao diện xấu/không đồng bộ.
metadata:
  version: "1.0"
---

# UI components

## Nguồn sự thật

- **DESIGN.md** (gốc) — màu, font, spacing, bo góc, quy tắc component. Đọc trước khi dựng UI.
- `src/app/globals.css` — hiện thực token thành CSS variables (`--primary`, `--muted-foreground`…).
- `src/components/ui/` — component shadcn (style `base-nova`, dựa trên `@base-ui/react`).

## Quy trình

1. Tìm component có sẵn trong `src/components/ui/`. Chưa có → `pnpm dlx shadcn@latest add <name>` (vd `card input label dialog sonner`). Không tự viết lại thứ shadcn đã có.
2. Ghép giao diện bằng class semantic: `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary text-primary-foreground`. Khoảng cách theo thang 4px trong DESIGN.md.
3. Biến thể: dùng prop `variant`/`size` có sẵn; cần biến thể mới thì thêm vào `cva` của component đó thay vì ghi đè class khắp nơi.
4. Link trông như nút: `<Link className={buttonVariants({ variant: "outline" })} />`.
5. Mỗi màn hình: một hành động primary; có loading / empty / error state; focus-visible rõ ràng; ảnh có `alt`.

## Đổi theme cho dự án mới

1. Sửa token trong front matter **DESIGN.md** (primary, font…) và phần giải thích bên dưới.
2. `pnpm design:lint` — phải 0 error, xử lý warning tương phản.
3. Cập nhật biến tương ứng trong `globals.css` (`:root` và `.dark`). Đổi font: sửa `next/font` trong `src/app/layout.tsx`.

## Không làm

- Không hard-code hex/px lẻ trong component, không inline `style={{}}` cho màu.
- Không cài UI library khác (MUI, Chakra, Ant…).
