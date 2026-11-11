# Skills

Mỗi skill là một folder có `SKILL.md` ([spec agentskills.io](https://agentskills.io/specification)). AI chỉ đọc `name` + `description` lúc khởi động, khớp việc mới nạp toàn bộ nội dung — nên skill nhiều cũng không tốn context.

| Skill | Dùng khi |
|---|---|
| [new-feature](new-feature/SKILL.md) | Tạo feature/trang nghiệp vụ mới |
| [ui-components](ui-components/SKILL.md) | Dựng UI với shadcn/ui theo DESIGN.md |
| [ai-integration](ai-integration/SKILL.md) | Tích hợp AI vào lớp `src/ai/` |
| [context-docs](context-docs/SKILL.md) | Viết AGENTS.md / DESIGN.md / SKILL.md |

## Thêm skill

- **Tự viết:** copy `docs/templates/SKILL.template.md` → `.agents/skills/<tên>/SKILL.md`, rồi thêm một dòng vào bảng ở đây và trong `AGENTS.md` gốc.
- **Cài skill cộng đồng** ([skills.sh](https://skills.sh)): `npx skills add <owner/repo>` — đọc kỹ nội dung trước khi commit, skill là "code" mà AI sẽ làm theo.

## Dùng với từng công cụ

- Codex, Cursor, Gemini CLI, Copilot…: đọc `AGENTS.md` gốc, trong đó có bảng Skills trỏ tới các file này.
- Claude Code: `CLAUDE.md` import `AGENTS.md`. Muốn Claude tự phát hiện skill như skill native, copy (hoặc symlink) folder sang `.claude/skills/`.

## Nguyên tắc

- Skill = **quy trình** (làm việc X theo các bước nào). Kiến thức framework (API Next.js…) để ở AGENTS.md / docs bundled — Vercel đo được cách này cho kết quả tốt hơn skill.
- Mô tả cụ thể, có từ khoá; thân ngắn, có checklist kiểm tra cuối.
