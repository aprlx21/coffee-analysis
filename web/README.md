# 🥋 Kungfu Stack

> Khung xương (skeleton) Next.js cho builder: **làm phần nền một lần, giải nhiều bài toán.**
> Mỗi app mới chỉ cần viết phần nghiệp vụ trong `src/features/` — AI đọc `AGENTS.md`, `DESIGN.md`, `skills` để code đúng "luật nhà".

Dựa trên tinh thần buổi talk _From Zero to Builder_ (Agentic workspace: AGENTS.md · DESIGN.md · Skills · Context theo folder), chuyển sang stack **React + Next.js**.

---

## Stack

| Lớp | Lựa chọn | Vì sao |
|---|---|---|
| Meta framework | **Next.js 16** (App Router, Turbopack, Cache Components) | Full-stack trong một repo, có docs bundled cho AI |
| UI | **React 19** + **Tailwind CSS v4** + **shadcn/ui** | Design system sẵn, code nằm trong repo nên dễ sửa |
| Ngôn ngữ | **TypeScript** strict + **zod** | Bắt lỗi sớm, validate env/input |
| Chất lượng | ESLint · Prettier · `@google/design.md` lint | Một lệnh `pnpm check` |
| Hạ tầng | **Vercel** (free tier) | Deploy bằng `git push` |
| AI (tuỳ chọn) | Vercel AI SDK, tập trung ở `src/ai/` | Đổi provider không sửa feature |

## Bắt đầu

Yêu cầu: Node.js ≥ 22, pnpm (`corepack enable` hoặc xem [pnpm.io/installation](https://pnpm.io/installation)).

```bash
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Chạy local |
| `pnpm check` | Lint + typecheck + format check — chạy trước khi commit |
| `pnpm build` | Build production |
| `pnpm format` | Tự format code |
| `pnpm design:lint` | Kiểm tra DESIGN.md (token, tương phản màu) |
| `pnpm dlx shadcn@latest add <name>` | Thêm UI component |

## Cấu trúc thư mục

Ngữ cảnh nằm **ngay cạnh code**: mỗi folder quan trọng có `AGENTS.md` riêng. AI làm ở đâu thì đọc AGENTS.md gần nhất.

```
kungfu-stack/
├── AGENTS.md                  # 📌 luật chung: stack, lệnh, quy ước, ranh giới, skills
├── CLAUDE.md                  # @AGENTS.md (cho Claude Code)
├── DESIGN.md                  # 🎨 design system: token YAML + giải thích
├── .agents/skills/            # 🧰 kỹ năng đóng gói, AI nạp khi cần
│   ├── new-feature/SKILL.md
│   ├── ui-components/SKILL.md
│   ├── ai-integration/SKILL.md
│   └── context-docs/SKILL.md
├── docs/templates/            # mẫu AGENTS.md cho folder, mẫu SKILL.md
├── src/
│   ├── app/                   # routing (page, layout, route handler) — mỏng
│   │   ├── AGENTS.md
│   │   └── api/health/        # GET /api/health
│   ├── features/              # ⭐ nghiệp vụ — phần thay đổi theo từng dự án
│   │   ├── AGENTS.md
│   │   └── welcome/           # feature mẫu (AGENTS.md, index.ts, components/)
│   ├── components/            # UI dùng chung: ui/ (shadcn), layout/
│   ├── lib/                   # utils, env (zod), site-config
│   ├── server/                # chỗ dành sẵn: db, auth, payments, notifications
│   └── ai/                    # 🤖 lớp AI: config, prompts, (tools, schemas)
└── .github/workflows/ci.yml   # lint + typecheck + build mỗi PR
```

**Hướng phụ thuộc một chiều:** `app → features → components / lib / server / ai`. Feature không import ruột của nhau, chỉ qua `@/features/<tên>`.

## Bộ ba file context cho AI

| File | Là gì | Viết thế nào |
|---|---|---|
| [`AGENTS.md`](AGENTS.md) | "System prompt" của dự án ([agents.md](https://agents.md)) | Ngắn, mệnh lệnh, kiểm chứng được. Gốc = luật chung; folder = Mục đích · Phụ thuộc · Lưu ý ([mẫu](docs/templates/AGENTS.folder.md)) |
| [`DESIGN.md`](DESIGN.md) | Design system cho AI ([spec Google Labs](https://github.com/google-labs-code/design.md)) | Front matter YAML = token; thân = 8 mục theo thứ tự chuẩn. Kiểm tra bằng `pnpm design:lint` |
| [`.agents/skills/*/SKILL.md`](.agents/skills/README.md) | Quy trình đóng gói ([agentskills.io](https://agentskills.io/specification)) | `name` + `description` rõ khi nào dùng; thân < 500 dòng, có checklist ([mẫu](docs/templates/SKILL.template.md)) |

Khối `<!-- BEGIN:nextjs-agent-rules -->` đầu `AGENTS.md` do Next.js quản lý — nó trỏ AI tới docs đúng phiên bản trong `node_modules/next/dist/docs/`. Đừng xoá.

## AI để ở đâu?

```
UI "use client" (features/<x>/components)
  → Server Action (features/<x>/server/actions.ts)  hoặc  Route Handler (app/api/ai/<x>/route.ts) khi cần streaming
      → @/ai  (src/ai: config, prompts, tools, schemas)
          → Provider SDK (Anthropic / OpenAI / Google…)
```

- Key và SDK **chỉ** ở server, trong `src/ai/`. Feature không biết đang dùng provider nào.
- Bật AI: điền `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` vào `.env.local` rồi làm theo skill [`ai-integration`](.agents/skills/ai-integration/SKILL.md). `/api/health` sẽ báo `features.ai: true`.
- Không cần AI? Bỏ qua — skeleton chạy bình thường.

## Tạo dự án mới từ skeleton

1. Trên GitHub bấm **Use this template** (bật _Template repository_ trong Settings), hoặc `npx degit <user>/kungfu-stack my-app`.
2. Sửa `src/lib/site-config.ts` (tên, mô tả), `name` trong `package.json`.
3. Đổi "gu": sửa token `DESIGN.md` → `pnpm design:lint` → cập nhật `src/app/globals.css`.
4. Xoá/thay `src/features/welcome`, tạo feature thật bằng skill `new-feature`.
5. Cần DB/đăng nhập/thanh toán → tạo folder trong `src/server/` theo bảng gợi ý ở `src/server/AGENTS.md` (kèm AGENTS.md riêng).
6. Deploy: import repo vào [Vercel](https://vercel.com/new), khai báo env, xong.

## Làm việc nhóm

- Nhánh `main` luôn build được; làm việc trên nhánh `feat/<tên>`, mở PR, CI phải xanh.
- Đổi quy ước/thư viện → cập nhật `AGENTS.md` liên quan **trong cùng commit**.
- AI làm sai cùng một kiểu ≥ 2 lần → thêm một dòng luật vào AGENTS.md gần nhất.

## Tham khảo

- [agents.md](https://agents.md) · [Next.js — AI coding agents](https://nextjs.org/docs/app/guides/ai-agents) · [Next.js 16.3 AI improvements](https://nextjs.org/blog/next-16-3-ai-improvements)
- [google-labs-code/design.md](https://github.com/google-labs-code/design.md) · [agentskills.io](https://agentskills.io/specification) · [skills.sh](https://skills.sh)
- Cấu trúc feature-based: [bulletproof-react](https://github.com/alan2207/bulletproof-react) · Boilerplate đầy đủ hơn khi cần: [next-forge](https://github.com/vercel/next-forge), [ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)
- [shadcn/ui](https://ui.shadcn.com) · [Vercel AI SDK](https://ai-sdk.dev)
