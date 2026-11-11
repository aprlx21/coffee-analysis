<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Kungfu Stack

Khung xương Next.js dùng lại cho nhiều dự án nhỏ. Phần nền làm một lần; mỗi app mới chỉ viết phần nghiệp vụ trong `src/features/`.

## Stack (đã chốt — không tự ý đổi)

- Next.js 16 (App Router, `src/`, Turbopack, `cacheComponents: true`), React 19, TypeScript strict
- Tailwind CSS v4 + shadcn/ui (style `base-nova`, primitive `@base-ui/react`, icon `lucide-react`)
- zod (validate env/input), `server-only`
- pnpm, ESLint (eslint-config-next), Prettier · Deploy: Vercel

## Lệnh

- `pnpm dev` — chạy local http://localhost:3000
- `pnpm check` — lint + typecheck + format check (**chạy trước khi báo xong**)
- `pnpm build` — build production
- `pnpm format` — tự format · `pnpm design:lint` — kiểm tra DESIGN.md
- Thêm UI component: `pnpm dlx shadcn@latest add <name>`

## Cấu trúc

```
src/
├── app/          # Routing: page, layout, route handler. Mỏng — chỉ lắp ráp.
├── features/     # Nghiệp vụ, mỗi feature một folder, có index.ts là public API
├── components/   # UI dùng chung: ui/ (shadcn) + layout/
├── lib/          # Tiện ích thuần, env, site-config
├── server/       # Code chỉ chạy ở server: db, auth, dịch vụ ngoài
└── ai/           # Lớp AI: config, prompts, tools (server-only)
```

Hướng phụ thuộc một chiều: `app → features → (components, lib, server, ai)`. Feature không import ruột của feature khác — chỉ qua `@/features/<tên>`.

## Quy ước code

- Mặc định **Server Component**. Chỉ thêm `"use client"` ở component lá cần state/effect/event.
- Mutation dùng **Server Action** (`features/<x>/server/actions.ts`); API ra ngoài mới dùng Route Handler (`app/api/**/route.ts`).
- Validate mọi input từ người dùng bằng zod ở server. Không tin dữ liệu từ client (giá tiền, quyền, userId…).
- Đọc env qua `@/lib/env` (server) — không dùng `process.env` rải rác. Biến mới phải thêm vào `.env.example`.
- Import tuyệt đối với alias `@/`. Tên file `kebab-case.tsx`, component `PascalCase`, hàm/biến `camelCase`.
- Không dùng `any`; không để `console.log` trong code commit.

## UI

- Mọi UI tuân thủ **DESIGN.md**. Chỉ dùng class semantic (`bg-primary`, `text-muted-foreground`), không hard-code màu hex.
- Ưu tiên component có sẵn trong `src/components/ui/`; thiếu thì `shadcn add`, không cài UI library khác.

## Ranh giới (KHÔNG làm nếu chưa được đồng ý)

- Không cài thêm thư viện / đổi phiên bản lớn.
- Không sửa `next.config.ts`, `components.json`, `tsconfig.json`, cấu hình CI.
- Không commit secret; không đọc/ghi `.env.local` của người khác.
- Không xoá hay viết lại hàng loạt file ngoài phạm vi task.

## Context theo folder

AI làm việc ở folder nào thì đọc **AGENTS.md gần nhất** trong folder đó (và các folder cha). File gần hơn được ưu tiên hơn file này.
Khi thêm feature/module mới: tạo `AGENTS.md` cho nó theo mẫu `docs/templates/AGENTS.folder.md`.

## Skills

Kỹ năng đóng gói sẵn trong `.agents/skills/<tên>/SKILL.md`. Đọc SKILL.md tương ứng **trước khi** làm việc khớp mô tả:

| Skill | Dùng khi |
|---|---|
| `new-feature` | Tạo feature/trang nghiệp vụ mới theo cấu trúc skeleton |
| `ui-components` | Dựng giao diện, thêm/sửa component shadcn theo DESIGN.md |
| `ai-integration` | Thêm tính năng AI: chat, tóm tắt, sinh nội dung, tool calling |
| `context-docs` | Viết/cập nhật AGENTS.md, DESIGN.md, SKILL.md |

## Định nghĩa "xong"

1. `pnpm check` và `pnpm build` không lỗi.
2. Đã tự mở trang liên quan kiểm tra bằng mắt (cả mobile width).
3. Đổi luồng nào, kiểm tra lại luồng đó. AGENTS.md của folder bị ảnh hưởng đã được cập nhật nếu quy ước thay đổi.
