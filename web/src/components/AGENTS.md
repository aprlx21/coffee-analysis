# components/ — UI dùng chung

## Cấu trúc

- `ui/` — component sinh bởi shadcn/ui (`pnpm dlx shadcn@latest add <name>`). Coi như thư viện: hạn chế sửa tay; nếu buộc phải sửa, ghi chú lý do ở đầu file.
- `layout/` — khung trang: header, footer, sidebar, container.
- Component dùng chung khác (≥ 2 feature cùng dùng) đặt thẳng ở `components/<tên>.tsx`.

## Quy ước

- Component chỉ thuộc một feature → đặt trong `features/<x>/components/`, **không** đặt ở đây.
- Không gọi database/API, không chứa nghiệp vụ. Nhận dữ liệu qua props.
- File `kebab-case.tsx`, named export `PascalCase` (không dùng default export).
- Style bằng Tailwind + token semantic theo DESIGN.md; gộp class bằng `cn()` từ `@/lib/utils`.
- Link trông như nút: `<Link className={buttonVariants({ variant: "outline" })}>`.
- Chỉ thêm `"use client"` khi component cần state/effect/event handler.
