---
name: context-docs
description: Viết hoặc cập nhật file context cho AI — AGENTS.md (gốc và theo folder), DESIGN.md, SKILL.md. Dùng khi tạo module/feature mới, khi quy ước thay đổi, hoặc khi AI lặp lại cùng một lỗi do thiếu context.
metadata:
  version: "1.0"
---

# Context docs

Nguyên tắc: **ngắn, cụ thể, kiểm chứng được**. Mỗi dòng phải giúp AI quyết định đúng hơn; dòng nào AI tự suy ra được từ code thì bỏ.

## AGENTS.md theo folder

- Tạo khi folder có quy ước/ràng buộc **khác** phần còn lại (feature nghiệp vụ, dịch vụ server, lớp AI). Không tạo cho folder tầm thường.
- Mẫu: `docs/templates/AGENTS.folder.md` — 3 mục: **Mục đích · Phụ thuộc · Lưu ý**. Dưới ~40 dòng.
- Viết luật dạng mệnh lệnh có thể kiểm tra: "Giá luôn tính ở server" thay vì "Cẩn thận với giá".
- Không lặp lại luật đã có ở AGENTS.md cha; file gần nhất được ưu tiên.

## AGENTS.md gốc

- Giữ các mục: Stack · Lệnh · Cấu trúc · Quy ước · Ranh giới · Skills · Định nghĩa "xong".
- **Không** sửa/xoá khối `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END -->` (do `next dev` quản lý).
- Thêm skill mới → thêm một dòng vào bảng Skills.

## DESIGN.md

- Token ở YAML front matter, giải thích ở các mục `##` theo đúng thứ tự: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
- Tham chiếu token: `"{colors.primary}"`. Sau khi sửa: `pnpm design:lint` (0 error).

## SKILL.md

- Folder `.agents/skills/<tên>/SKILL.md`, `name` trùng tên folder (chữ thường, gạch nối, ≤ 64 ký tự).
- `description` (≤ 1024 ký tự) nói rõ **làm gì + khi nào dùng + từ khoá** — AI chỉ đọc dòng này để quyết định nạp skill.
- Thân < 500 dòng; chi tiết dài tách sang `references/`, script sang `scripts/`.
- Mẫu: `docs/templates/SKILL.template.md`.

## Khi nào cập nhật

- AI làm sai cùng một kiểu ≥ 2 lần → thêm một luật vào AGENTS.md gần nhất.
- Đổi thư viện/quy ước/luồng → cập nhật AGENTS.md trong cùng commit với code.
