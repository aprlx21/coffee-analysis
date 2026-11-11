---
version: alpha
name: Kungfu Stack
description: Design system mặc định của skeleton — sạch, trung tính, một màu nhấn xanh. Mỗi dự án mới đổi tên, màu primary và font là có "gu" riêng.
colors:
  primary: "#2563EB"
  on-primary: "#FFFFFF"
  background: "#FFFFFF"
  foreground: "#0A0A0A"
  surface: "#FFFFFF"
  muted: "#F4F4F5"
  muted-foreground: "#52525B"
  border: "#E4E4E7"
  destructive: "#DC2626"
typography:
  display:
    fontFamily: Be Vietnam Pro
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  heading:
    fontFamily: Be Vietnam Pro
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Be Vietnam Pro
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.4
  code:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: 6px
  md: 8px
  lg: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 80px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 36px
    padding: 10px
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 36px
    padding: 10px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 20px
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: 36px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 36px
    padding: 10px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  badge-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
---

# Kungfu Stack — Design System

> File này là **nguồn sự thật** về giao diện cho cả người và AI.
> Front matter (YAML) = token máy đọc được. Phần dưới = lý do và cách dùng.
> Spec: [google-labs-code/design.md](https://github.com/google-labs-code/design.md) · Kiểm tra: `pnpm design:lint`.
> Token được hiện thực trong `src/app/globals.css` (CSS variables của shadcn/ui). Sửa ở đây trước, rồi cập nhật CSS cho khớp.

## Overview

Giao diện **sạch, trung tính, dễ đọc**, ưu tiên nội dung tiếng Việt. Một màu nhấn duy nhất (xanh `primary`) dành cho hành động chính; mọi thứ còn lại là thang xám. Cảm giác: công cụ làm việc đáng tin cậy, không phô trương.

- Đối tượng: người dùng phổ thông, thao tác trên cả mobile và desktop.
- Nguyên tắc: ít màu, nhiều khoảng trắng, phân cấp bằng cỡ chữ và độ đậm thay vì bằng màu.

## Colors

- **Primary (#2563EB):** Chỉ cho hành động chính (nút submit, link quan trọng, focus ring). Mỗi màn hình tối đa **một** nút primary.
- **On-primary (#FFFFFF):** Chữ/icon đặt trên nền primary (tương phản 5.2:1, đạt WCAG AA).
- **Foreground (#0A0A0A) / Background (#FFFFFF):** Chữ và nền mặc định.
- **Muted (#F4F4F5) / Muted-foreground (#52525B):** Nền phụ, chữ phụ (mô tả, caption, placeholder).
- **Border (#E4E4E7):** Viền card, input, divider.
- **Destructive (#DC2626):** Chỉ cho hành động xoá/huỷ không hoàn tác và thông báo lỗi.

**Dark mode** (class `.dark`, xem `globals.css`): background `#0A0A0A`, surface `#18181B`, foreground `#FAFAFA`, primary sáng hơn `#60A5FA` với chữ tối `#0A0A0A`, muted `#27272A`, muted-foreground `#A1A1AA`.

Trong code luôn dùng class semantic của Tailwind: `bg-primary`, `text-muted-foreground`, `border-border`… **Không** viết mã hex trong component.

## Typography

- **Be Vietnam Pro** cho toàn bộ giao diện — font thiết kế cho tiếng Việt, dấu hiển thị chuẩn.
- **Geist Mono** cho code, số liệu cần căn cột.
- Thang chữ: `display` (tiêu đề trang) → `heading` (tiêu đề section/card) → `body` → `label` (nút, nhãn form).
- Tối đa 3 cỡ chữ trên một màn hình. Không dùng chữ in hoa toàn bộ cho câu dài.

## Layout

- Lưới spacing bội số 4px: dùng `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 40` · `2xl 80` (tương ứng Tailwind `1, 2, 4, 6, 10, 20`).
- Nội dung chính giới hạn `max-w-5xl`, căn giữa, padding ngang `px-4`.
- Mobile-first: thiết kế cho 375px trước, mở rộng bằng `sm:` / `md:` / `lg:`.

## Elevation & Depth

Phẳng là mặc định. Phân lớp bằng **viền 1px + nền surface**, không dùng đổ bóng đậm. Chỉ popover, dropdown, dialog mới có shadow nhẹ (`shadow-md`).

## Shapes

- Bo góc mặc định `lg` (10px) cho button, input, card.
- `full` cho badge, avatar.
- Không trộn góc vuông và góc bo trong cùng một nhóm component.

## Components

- Dùng **shadcn/ui** (`src/components/ui/`) làm nền. Cần component mới: `pnpm dlx shadcn@latest add <tên>` trước khi tự viết.
- **Button:** `default` = primary, `outline` = hành động phụ, `ghost` = hành động trong toolbar, `destructive` = xoá. Link trông như nút: `className={buttonVariants()}`.
- **Card:** viền `border`, nền `card`, padding 20px, tiêu đề dùng `heading`.
- **Input:** cao 36px, luôn có `<label>`; lỗi hiển thị dưới input bằng `text-destructive`.
- Trạng thái bắt buộc cho mọi component tương tác: hover, focus-visible (ring primary), disabled, loading.

## Do's and Don'ts

- ✅ Dùng token semantic; đổi theme chỉ cần sửa DESIGN.md + `globals.css`.
- ✅ Mỗi màn hình có một hành động chính rõ ràng.
- ✅ Có trạng thái rỗng (empty state), loading và lỗi cho mọi danh sách/dữ liệu.
- ❌ Không hard-code màu hex, px lẻ (13px, 17px…) trong component.
- ❌ Không cài thêm UI library khác song song với shadcn/ui.
- ❌ Không dùng màu để truyền đạt thông tin duy nhất (luôn kèm icon/chữ).
