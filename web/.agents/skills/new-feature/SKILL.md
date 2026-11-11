---
name: new-feature
description: Tạo một feature nghiệp vụ mới (trang + component + server action + schema) theo cấu trúc src/features của skeleton. Dùng khi người dùng muốn thêm màn hình, chức năng, module, CRUD hoặc luồng nghiệp vụ mới.
metadata:
  version: "1.0"
---

# New feature

## Trước khi code

1. Hỏi/làm rõ: feature giải quyết việc gì, cho ai, dữ liệu vào/ra là gì. Viết 3–5 dòng mục đích.
2. Đặt tên folder theo nghiệp vụ, `kebab-case` (vd `debt-book`, `loyalty-points`).
3. Đọc `src/features/AGENTS.md` và `src/app/AGENTS.md`.

## Các bước

1. **Tạo khung** — chỉ tạo file thực sự cần:
   ```
   src/features/<tên>/
   ├── AGENTS.md           # copy từ docs/templates/AGENTS.folder.md
   ├── index.ts            # export component public
   ├── components/<tên>-*.tsx
   ├── schemas.ts          # zod schema input
   └── server/
       ├── queries.ts      # import "server-only"; đọc dữ liệu
       └── actions.ts      # "use server"; mutation
   ```
2. **Schema trước:** định nghĩa zod schema cho input ở `schemas.ts`; dùng chung cho form (client) và action (server).
3. **Server action:** parse input bằng schema → kiểm tra quyền → gọi `server/*` → `revalidatePath`/`updateTag` nếu cần → trả `{ ok, error }`.
4. **UI:** Server Component lấy dữ liệu từ `queries.ts`; chỉ phần form/tương tác mới là `"use client"`. Dùng component trong `src/components/ui/`, tuân thủ DESIGN.md. Có trạng thái loading / rỗng / lỗi.
5. **Route:** tạo `src/app/<route>/page.tsx` mỏng, chỉ import từ `@/features/<tên>`; export `metadata`.
6. **Điều hướng:** thêm link vào `siteConfig.nav` nếu là trang chính.
7. **Ghi context:** điền `AGENTS.md` của feature (mục đích, phụ thuộc, lưu ý).

## Kiểm tra

- `pnpm check` và `pnpm build` không lỗi
- Mở trang ở width 375px và desktop; thử input sai để thấy thông báo lỗi
- Không import ruột của feature khác
