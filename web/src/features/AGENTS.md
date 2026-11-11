# features/ — Nghiệp vụ

Mỗi dự án mới khác nhau chủ yếu ở đây. Mỗi feature là một folder độc lập, xoá folder là xoá sạch feature.

## Cấu trúc một feature (chỉ tạo phần cần dùng)

```
features/<tên>/
├── AGENTS.md          # mục đích, phụ thuộc, lưu ý riêng (bắt buộc khi feature có nghiệp vụ)
├── index.ts           # public API — nơi khác chỉ import từ đây
├── components/        # UI riêng của feature
├── server/
│   ├── actions.ts     # Server Actions ("use server") — mutation
│   └── queries.ts     # đọc dữ liệu (import "server-only")
├── schemas.ts         # zod schema cho input/form (dùng chung client + server)
├── types.ts
└── hooks/             # hook client riêng của feature
```

## Quy ước

- Tên folder: danh từ, `kebab-case`, theo nghiệp vụ (`orders`, `loyalty-points`), không theo kỹ thuật (`forms`, `utils`).
- `index.ts` **không** re-export code server (actions/queries) chung với component client — import server code trực tiếp từ `@/features/<x>/server/...` ở page/route.
- Không import ruột của feature khác. Cần dùng chung → nâng lên `components/`, `lib/` hoặc `server/`.
- Logic quan trọng (giá, quyền, trạng thái) luôn tính ở server.

## Ví dụ

- `welcome/` — feature mẫu tối giản (trang chủ). Xoá hoặc thay khi bắt đầu dự án thật.
- Tạo feature mới: làm theo skill `.agents/skills/new-feature`.
