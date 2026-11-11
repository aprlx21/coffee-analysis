# ☕ Coffee Analysis - An Thượng (Đà Nẵng)

Hệ thống cào dữ liệu Google Maps, OCR thực đơn (Menu OCR) và phân tích tiện ích/cơ sở vật chất các quán cafe tại khu phố Tây An Thượng (Ngũ Hành Sơn, Đà Nẵng) lưu trữ phân tầng Medallion trên Supabase PostgreSQL, kèm giao diện Web tra cứu xây dựng trên Next.js 16 (Kungfu Stack).

---

## 1. Cấu trúc Dự án

```
coffee_analysis/
├── AGENTS.md                  # Context & quy tắc cốt lõi cho toàn bộ AI Agents
├── CONTRIBUTING.md            # 📌 QUY ƯỚC LÀM VIỆC & PHÁT TRIỂN (BẮT BUỘC ĐỌC)
├── README.md                  # Giới thiệu tổng quan & hướng dẫn thiết lập
├── .github/                   # Cấu hình GitHub Actions, PR template
│   └── pull_request_template.md
│
├── pipeline/                  # Module Data Engineering (Python)
│   ├── AGENTS.md              # Ranh giới & quy ước dữ liệu
│   ├── scraper/               # Cào dữ liệu Google Maps An Thượng
│   ├── ocr/                   # Bóc tách thực đơn bằng PaddleOCR
│   ├── facilities/            # Phân tích tiện ích (About + NLP Reviews)
│   └── db/                    # Supabase client, migrations & upsert logic
│
└── web/                       # Ứng dụng Web (Next.js 16 - Kungfu Stack)
    ├── AGENTS.md              # Ranh giới & quy ước kỹ thuật Web
    ├── DESIGN.md              # Design system (Soft Glassmorphism)
    └── src/                   # Source code App Router, Components & Server Actions
```

---

## 2. 🛡️ Quy Ước Làm Việc & Chặn Push/Merge Trực Tiếp

Dự án áp dụng quy trình kiểm soát mã nguồn nghiêm ngặt nhằm đảm bảo độ tin cậy và tính bất biến của dữ liệu.

### 2.1. Nguyên tắc Chặn Merge Trực Tiếp vào `main`
- **TUYỆT ĐỐI KHÔNG commit / push trực tiếp lên nhánh `main`**.
- Mọi tính năng, sửa lỗi hoặc cập nhật tài liệu đều phải được thực hiện qua **Pull Request (PR)** từ nhánh tính năng (`feature/`, `fix/`, `refactor/`).
- **Branch Protection Rules trên GitHub**:
  - `Require a pull request before merging`: Bắt buộc tạo PR.
  - `Require status checks to pass before merging`: Phải vượt qua CI (Lint, Typecheck, Build).
  - `Do not allow bypassing the above settings`: Không cho phép bypass kể cả Admin/Owner.

### 2.2. Quy trình Làm việc (Workflow chuẩn)
1. **Tạo nhánh mới từ `main` mới nhất**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/ten-tinh-nang
   ```
2. **Kiểm tra chất lượng cục bộ trước khi push**:
   ```bash
   # Tại thư mục web:
   cd web
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
3. **Commit theo chuẩn Conventional Commits**:
   - `feat(...)`: Tính năng mới
   - `fix(...)`: Sửa lỗi
   - `perf(...)`: Cải thiện hiệu năng
   - `refactor(...)`: Tái cấu trúc không đổi logic
   - `docs(...)`: Tài liệu
4. **Mở Pull Request vào `main`**:
   - Điền đầy đủ mô tả theo mẫu PR Template.
   - Nhánh chỉ được merge (Squash and merge) khi toàn bộ kiểm tra chất lượng đều passed.

👉 **Đọc tài liệu chi tiết tại**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 3. Khởi Chạy Dự Án Cục Bộ

### 3.1. Web Application (`web/`)
```bash
cd web
pnpm install
cp .env.example .env.local  # Điền SUPABASE_DB_URL / NEXT_PUBLIC_SUPABASE_*
pnpm dev
```
Truy cập: `http://localhost:3000`

### 3.2. Data Pipeline (`pipeline/`)
```bash
cd pipeline
python -m venv .venv
source .venv/bin/activate  # Hoặc .venv\Scripts\activate trên Windows
pip install -r requirements.txt
python run_pipeline.py
```

---

## 4. Tài liệu Tham khảo
- [AGENTS.md](./AGENTS.md): Bản đồ ngữ cảnh master, schema phân tầng Medallion Light.
- [web/AGENTS.md](./web/AGENTS.md): Quy ước kiến trúc Next.js 16, DAL pattern và Server Actions.
- [web/DESIGN.md](./web/DESIGN.md): Hệ thống thiết kế Soft Glassmorphism.
