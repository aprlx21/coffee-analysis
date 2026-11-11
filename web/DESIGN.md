---
version: alpha
name: Coffee Analysis — Soft Glassmorphism
description: Design system Soft Glassmorphism cho ứng dụng Cà phê An Thượng — nền gradient pastel ấm (kem → đào → tím lavender), bề mặt kính mờ trong suốt (backdrop blur), viền 1px trắng mờ, bóng khuếch tán mềm, accent cà phê/hổ phách ấm áp, tương tác nâng nhẹ mượt mà.
colors:
  primary: "#C8792B"
  on-primary: "#2A1708"
  background: "#FFF6E9"
  foreground: "#2A1B12"
  surface: "#FFFFFF"
  muted: "#F4E7D8"
  muted-foreground: "#5B4F47"
  border: "#E7D8C8"
  destructive: "#C62828"
  on-destructive: "#FFFFFF"
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
    fontWeight: 600
    lineHeight: 1.4
  code:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.6
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
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
    height: 40px
    padding: 16px
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 40px
    padding: 16px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: 20px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: 40px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-destructive}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 40px
    padding: 16px
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  badge-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
---

# Coffee Analysis — Soft Glassmorphism Design System

> File này là **nguồn sự thật** về giao diện cho cả người và AI.
> Front matter (YAML) = token máy đọc được (dùng màu đặc đại diện). Phần dưới = lý do và cách dùng.
> Spec: [google-labs-code/design.md](https://github.com/google-labs-code/design.md) · Kiểm tra: `pnpm design:lint`.
> Token được hiện thực trong `src/app/globals.css` (CSS variables của shadcn/ui). Sửa ở đây trước, rồi cập nhật CSS cho khớp.

## Overview

Giao diện theo trường phái **Soft Glassmorphism** — các tấm kính mờ trong suốt nổi trên nền gradient pastel ấm, gợi cảm giác buổi sáng nắng nhẹ ở một quán cafe khu phố Tây An Thượng (Đà Nẵng): nhẹ nhàng, thoáng, hiện đại.

Đặc điểm nhận diện cốt lõi:
- **Nền gradient canvas:** Gradient kem → đào → lavender pastel, kèm 2–3 "blob" màu mờ lớn nằm sau nội dung để kính có thứ để khúc xạ.
- **Bề mặt kính (Glass):** Trắng trong suốt `rgba(255,255,255,0.55–0.7)` + `backdrop-blur-xl` + viền 1px trắng mờ + bóng khuếch tán mềm.
- **Accent cà phê/hổ phách:** `primary #C8792B` ấm áp, dùng tiết chế cho hành động chính.
- **Tương tác mượt:** Hover nâng nhẹ (`-translate-y-0.5`) và bóng nở rộng dần; không có hiệu ứng ấn lún cứng.

- Đối tượng: Người đi cafe, làm việc từ xa (digital nomads), sinh viên và du khách cần tra cứu quán cafe An Thượng nhanh, rõ ràng và dễ nhìn.
- Nguyên tắc: Nhẹ nhàng nhưng không mất độ đọc — chữ luôn đạt WCAG AA trên bề mặt kính; phân cấp bằng khoảng trắng, độ sâu và trọng số chữ vừa phải.

## Colors

- **Primary (#C8792B):** Hổ phách cà phê ấm (amber/caramel) cho hành động quan trọng (nút lọc, CTA, tab đang chọn, điểm nhấn).
- **On-primary (#2A1708):** Chữ espresso đậm trên nền primary, tỷ lệ tương phản ~5:1 (đạt WCAG AA cho chữ thường).
- **Background (#FFF6E9):** Màu cơ sở của canvas. Canvas thực tế là gradient `#FFF6E9` (kem) → `#FFE3D0` (đào) → `#E9E1FA` (lavender), 135°, kèm blob hổ phách / hồng đào / lavender blur lớn.
- **Foreground (#2A1B12):** Chữ chính espresso/slate đậm, tương phản rất cao trên kính sáng.
- **Surface (#FFFFFF):** Gốc của bề mặt kính; trong CSS là `rgba(255,255,255,0.62)` (`--card`), popover/dropdown `rgba(255,255,255,0.88)` để dễ đọc hơn.
- **Muted (#F4E7D8):** Nền phụ (badge, tag tiện ích, ô thông số) sắc be ấm.
- **Muted-foreground (#5B4F47):** Chữ phụ, đạt AA (≥ 6:1) trên kính sáng — **không** hạ opacity thêm.
- **Border (#E7D8C8):** Đại diện cho viền. Trong CSS `--border` là nâu ấm trong suốt `rgba(94,60,30,0.14)` (viền chung, input, divider); viền kính `--glass-border` là `rgba(255,255,255,0.6)`.
- **Destructive (#C62828) / on-destructive (#FFFFFF):** Đỏ cho hành động nguy hiểm, cảnh báo (chữ trắng ~5.6:1).

**Dark mode (Espresso Night)** (class `.dark`, xem `globals.css`):
Canvas gradient `#1A120D` (espresso) → `#1B1530` (tím than) → `#0F1A2E` (navy), blob ấm mờ hơn. Kính `rgba(255,255,255,0.07)` với viền `rgba(255,255,255,0.12)`. Chữ `#F6EFE8`, chữ phụ `#BBAEA3`. Primary sáng hơn `#E39A4B`, on-primary vẫn `#2A1708`.

Trong code luôn dùng class semantic của Tailwind: `bg-primary`, `text-primary-foreground`, `border-border`, `bg-card`, `glass`… **Không** viết mã hex / rgba trực tiếp trong component.

## Typography

- **Be Vietnam Pro** cho toàn bộ giao diện tiếng Việt:
  - `display`: `2.25rem`, `700`, `letter-spacing: -0.02em` cho tiêu đề trang.
  - `heading`: `1.25rem`, `600` cho tiêu đề quán, tên mục, card header.
  - `body`: `1rem`, `400` (nhẹ nhàng, thoáng trên nền kính).
  - `label`: `0.875rem`, `600` cho nút bấm, badge, tiêu đề cột.
- **Geist Mono** cho giá tiền (`35.000đ`), tọa độ, mã quán, giờ mở cửa để căn thẳng, dễ so sánh.
- Không bắt buộc viết hoa; dùng sentence case thân thiện. Chỉ dùng `font-bold` cho số liệu/điểm nhấn thực sự cần.

## Layout

- Lưới spacing bội số 4px: `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 40` · `2xl 80` (tương ứng Tailwind `1, 2, 4, 6, 10, 20`).
- Khoảng cách thoáng để kính "thở" và bóng khuếch tán không dính vào nhau.
- Nội dung chính giới hạn `max-w-5xl`, căn giữa, padding ngang `px-4`.
- Mobile-first: blob nền là lớp `position: fixed` bị cắt (`overflow: hidden`), không gây cuộn ngang ở 375px.
- Kính chồng kính: tối đa 2 lớp lồng nhau; lớp trong dùng `bg-muted`/`bg-card` phẳng, không blur thêm.

## Elevation & Depth

Độ sâu tạo bởi **blur nền + bóng khuếch tán mềm** (không bóng cứng):
- `glass`: `background var(--glass)` + `backdrop-filter: blur(24px) saturate(1.5)` + `border 1px solid var(--glass-border)`.
- `glass-strong`: như trên nhưng đặc hơn (`--glass-strong`, ~0.82) cho popover, sheet, dropdown, thanh điều hướng.
- **Bóng** (màu `rgba(31,38,135,.08)` ở light, đen mờ ở dark):
  - `shadow-glass-sm`: `0 2px 8px` — badge, chip, nút nhỏ.
  - `shadow-glass`: `0 8px 32px` — nút, input khi focus, panel phụ.
  - `shadow-glass-card`: `0 8px 32px` + viền sáng bên trong — card chính.
  - `shadow-glass-lg`: `0 16px 48px` — modal, popover, sheet, trạng thái hover của card.
- **Tương tác:** hover `-translate-y-0.5` + bóng chuyển lên cấp cao hơn, `transition-all duration-200`; active quay về `translate-y-0`, không dịch ngang.
- **Giảm trong suốt:** khi `prefers-reduced-transparency: reduce`, `glass` và `glass-strong` chuyển sang nền đặc, bỏ blur.

## Shapes

- Bo góc lớn, mềm:
  - `sm` (8px): tag nhỏ, tooltip.
  - `md` (12px): input con, item dropdown.
  - `lg` (16px): nút bấm, input, select.
  - `xl` (24px): card quán cafe, panel, sheet, hộp thoại.
  - `full` (9999px): pill badge tiện ích, avatar, chip lọc.
- Viền mặc định `1px` (`border border-border`); viền kính trắng mờ nằm trong utility `glass`.

## Components

- Dùng **shadcn/ui** (`src/components/ui/`) và style theo Soft Glassmorphism:
- **Button:**
  - `default`: `bg-primary text-primary-foreground shadow-glass`, hover nâng + `shadow-glass-lg`.
  - `outline`: `glass` + `text-foreground`, hover `bg-card`.
  - `secondary`: `bg-secondary`, bóng nhẹ.
  - `destructive`: `bg-destructive text-destructive-foreground`.
  - `ghost`: trong suốt, hover `bg-muted`.
- **Card quán cafe:** `glass shadow-glass-card rounded-xl`, hover `-translate-y-0.5 shadow-glass-lg`, padding 20px.
- **Input & Search bar:** `bg-card border border-border rounded-lg`, focus: `ring-2 ring-ring` + `shadow-glass`.
- **Badge tiện ích (Wifi, AC, Sạc):** `rounded-full`, nền `bg-muted` hoặc `bg-primary/15` + chữ `text-foreground`, viền `border border-border`.
- **Popover / Select / Sheet / Tooltip:** `glass-strong shadow-glass-lg`.
- **Divider:** cao `1px`, `bg-border`.

## Do's and Don'ts

- ✅ Dùng `glass` / `glass-strong` cho bề mặt nổi và `shadow-glass*` cho độ sâu.
- ✅ Giữ nền gradient + blob phía sau; kính chỉ đẹp khi có thứ để làm mờ.
- ✅ Hover nâng nhẹ, chuyển động 150–250ms.
- ✅ Kiểm tra tương phản chữ trên kính (AA); dùng `text-foreground` / `text-muted-foreground`.
- ✅ Tôn trọng `prefers-reduced-transparency` và `prefers-reduced-motion`.
- ❌ KHÔNG dùng bóng cứng lệch góc (`shadow-hard*`, `4px 4px 0 #000`) hay viền đen 2px.
- ❌ KHÔNG đặt chữ nhạt (opacity thấp) lên kính; KHÔNG lồng quá 2 lớp blur.
- ❌ KHÔNG hard-code hex/rgba trong component — luôn dùng semantic class/utility (`bg-primary`, `border-border`, `glass`).
- ❌ KHÔNG dùng `backdrop-blur` rời rạc khi đã có `glass` (giữ một nguồn sự thật).
