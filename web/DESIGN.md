---
version: alpha
name: Coffee Analysis — Neubrutalism
description: Design system Neubrutalism cho ứng dụng Cà phê An Thượng — độ tương phản cao, viền đen dày dặn (2px), đổ bóng cứng không blur (hard offset shadow), màu sắc nổi bật, mang lại cảm giác năng động, xúc giác và dứt khoát.
colors:
  primary: "#FFE600"
  on-primary: "#000000"
  background: "#FFFDF5"
  foreground: "#000000"
  surface: "#FFFFFF"
  muted: "#F5F0E6"
  muted-foreground: "#404040"
  border: "#000000"
  destructive: "#FF3333"
typography:
  display:
    fontFamily: Be Vietnam Pro
    fontSize: 2.25rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.03em
  heading:
    fontFamily: Be Vietnam Pro
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: Be Vietnam Pro
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1.4
  code:
    fontFamily: Geist Mono
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.6
rounded:
  sm: 4px
  md: 6px
  lg: 8px
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
    padding: 12px
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 40px
    padding: 12px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 20px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    height: 40px
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    height: 40px
    padding: 12px
  divider:
    backgroundColor: "{colors.border}"
    height: 2px
  badge-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
---

# Coffee Analysis — Neubrutalism Design System

> File này là **nguồn sự thật** về giao diện cho cả người và AI.
> Front matter (YAML) = token máy đọc được. Phần dưới = lý do và cách dùng.
> Spec: [google-labs-code/design.md](https://github.com/google-labs-code/design.md) · Kiểm tra: `pnpm design:lint`.
> Token được hiện thực trong `src/app/globals.css` (CSS variables của shadcn/ui). Sửa ở đây trước, rồi cập nhật CSS cho khớp.

## Overview

Giao diện theo trường phái **Neubrutalism (Neo-brutalism)** — phong cách thiết kế hiện đại, dứt khoát, mang tinh thần pop-art và zine văn hoá đường phố đặc trưng của khu phố Tây An Thượng (Đà Nẵng). 

Các đặc điểm nhận diện cốt lõi:
- **Viền đen đậm đà (High-contrast borders):** Mọi khối hộp, nút bấm, input và thẻ thông tin đều có viền đen dày (`2px solid #000000`).
- **Đổ bóng cứng (Hard offset shadows):** Tuyệt đối không dùng bóng mờ Gaussian blur. Chỉ sử dụng bóng đổ khối đặc lệch góc (`3px 3px 0px #000000` hoặc `4px 4px 0px #000000`).
- **Màu sắc giàu năng lượng (Vibrant & Punchy):** Màu vàng điện chanh rực rỡ (`primary #FFE600`) làm điểm nhấn hành động, kết hợp nền giấy kem ấm (`background #FFFDF5`) và chữ đen tuyền (`#000000`).
- **Cảm giác xúc giác cơ học (Tactile feedback):** Nút bấm và card có hiệu ứng nhấn lún vật lý khi tương tác (`active:translate-x-[2px] active:translate-y-[2px]`).

- Đối tượng: Người đi cafe, làm việc từ xa (digital nomads), sinh viên và du khách cần tra cứu quán cafe An Thượng nhanh, rõ ràng và bắt mắt.
- Nguyên tắc: Độ tương phản tối đa, phân cấp rành mạch bằng khối viền và trọng số chữ, tương tác chân thật như ấn nút vật lý.

## Colors

- **Primary (#FFE600):** Sắc vàng điện tử rực rỡ (Electric Yellow) dành riêng cho các hành động quan trọng nhất (nút lọc, CTA chính, bookmark, thẻ highlight).
- **On-primary (#000000):** Chữ đen tuyền trên nền vàng primary (tỷ lệ tương phản cực đại ~14:1, vượt chuẩn WCAG AAA).
- **Foreground (#000000):** Màu chữ chính, icon và đường viền — đen tuyền tuyệt đối tạo độ sắc sảo cho phong cách brutalism.
- **Background (#FFFDF5):** Nền giấy kem nhạt cổ điển (warm cream canvas), giúp các khối hộp viền đen và bóng đổ nổi bật mà không gây chói mắt.
- **Surface (#FFFFFF):** Nền thẻ card, modal, dropdown và input — màu trắng tinh khiết đặt nổi trên nền kem canvas.
- **Muted (#F5F0E6):** Màu nền phụ (badge, tag tiện ích, ô thông số phụ) mang sắc be kem nhẹ nhàng.
- **Muted-foreground (#404040):** Chữ phụ (mô tả, địa chỉ quán, ghi chú thời gian), giữ độ đậm vừa đủ (~500) để không bị chìm.
- **Border (#000000):** Toàn bộ đường viền trong hệ thống là màu đen nguyên bản `2px`.
- **Destructive (#FF3333):** Đỏ cờ rực rỡ cho các hành động nguy hiểm, trạng thái cảnh báo hoặc quán đóng cửa.

**Dark mode (Cyber Neubrutalism)** (class `.dark`, xem `globals.css`):
Nền đen carbon `#121212`, surface `#1E1E1E`, chữ sáng `#F5F5F5`, đường viền chuyển sang trắng đục hoặc trắng sáng `#FFFFFF` (`2px`), bóng đổ cứng trắng sáng hoặc vàng chanh `#FFE600` (`4px 4px 0px #000000` hoặc `#FFFFFF`), giữ nguyên tinh thần viền dày dứt khoát.

Trong code luôn dùng class semantic của Tailwind: `bg-primary`, `text-primary-foreground`, `border-border`, `bg-card`… **Không** viết mã hex trực tiếp trong component.

## Typography

- **Be Vietnam Pro** cho toàn bộ giao diện tiếng Việt:
  - `display`: Cỡ chữ lớn `2.25rem`, độ đậm `800` (ExtraBold), `letter-spacing: -0.03em` tạo tiêu đề trang cực kỳ ấn tượng, đậm chất poster.
  - `heading`: Cỡ `1.25rem`, độ đậm `700` (Bold) cho tiêu đề quán, tên mục, card header.
  - `body`: Cỡ `1rem`, độ đậm `500` (Medium) để đảm bảo nét chữ dứt khoát, không bị mỏng mảnh trước viền đen dày.
  - `label`: Cỡ `0.875rem`, độ đậm `700` (Bold) cho nút bấm, badge, tiêu đề cột.
- **Geist Mono** cho dữ liệu giá tiền (`35.000đ`, `45.000đ`), tọa độ, mã quán và giờ mở cửa để hiển thị ngay ngắn, dễ so sánh.
- Luôn viết hoa tiêu đề ngắn hoặc nút hành động khi cần tăng cảm giác dứt khoát (ví dụ: "TÌM QUÁN", "XEM MENU").

## Layout

- Lưới spacing bội số 4px: `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 40` · `2xl 80` (tương ứng Tailwind `1, 2, 4, 6, 10, 20`).
- Giữ khoảng cách giữa các phần tử thoáng hơn thông thường (gap lớn hơn 1 nấc) để nhường chỗ cho bóng đổ cứng không đè chồng lên nhau.
- Nội dung chính giới hạn `max-w-5xl`, căn giữa trang, padding ngang `px-4`.
- Mobile-first: Đảm bảo bóng đổ và viền trên màn hình nhỏ (375px) không gây tràn chiều ngang (`overflow-x-hidden`).

## Elevation & Depth

Trái tim của Neubrutalism là **đổ bóng cứng không làm mờ (Hard Offset Shadow, 0px blur)**:
- **Card & Container:** `box-shadow: 4px 4px 0px #000000` (Tailwind: `shadow-[4px_4px_0px_0px_#000000]`).
- **Button & Input:** `box-shadow: 3px 3px 0px #000000` (Tailwind: `shadow-[3px_3px_0px_0px_#000000]`).
- **Modal & Popover:** `box-shadow: 6px 6px 0px #000000` (Tailwind: `shadow-[6px_6px_0px_0px_#000000]`).
- **Hiệu ứng tương tác xúc giác (Micro-interactions):**
  - Trạng thái hover: Dịch chuyển nhẹ `-translate-x-0.5 -translate-y-0.5` và tăng bóng.
  - Trạng thái active (click): Nút bị "ấn chìm" xuống `translate-x-[2px] translate-y-[2px]` và bóng giảm về `1px 1px 0px` hoặc `0px 0px 0px`.
- **Tuyệt đối cấm:** Các hiệu ứng làm mờ Gaussian (`shadow-sm`, `shadow-md`, `shadow-xl` mặc định của Tailwind/CSS thông thường).

## Shapes

- Bo góc dứt khoát, chắc nịch:
  - `sm` (4px): Dành cho tag nhỏ, badge con.
  - `md` (6px): Dành cho input, dropdown menu con.
  - `lg` (8px): Bo góc chuẩn cho thẻ Card quán cafe, Nút bấm chính, Hộp thoại. Vừa đủ mềm mại kiểu "chunky retro", vừa giữ được phom viền sắc nét.
  - `full` (9999px): Dành cho avatar quán, pill badge tiện ích (Wifi, Máy lạnh, Ổ cắm).
- Độ dày viền: Mặc định `2px` cho toàn bộ thành phần (`border-2 border-border`).

## Components

- Dùng **shadcn/ui** (`src/components/ui/`) làm nền và style lại theo phong cách Neubrutalism:
- **Button:**
  - `default` (Primary): Nền vàng `bg-primary`, chữ đen `text-primary-foreground`, viền đen `border-2 border-border`, bóng cứng `shadow-[3px_3px_0px_0px_#000000]`, hiệu ứng active ấn lún.
  - `outline`: Nền trắng `bg-surface`, viền đen `border-2 border-border`, bóng cứng `shadow-[3px_3px_0px_0px_#000000]`.
  - `destructive`: Nền đỏ `bg-destructive`, chữ trắng, viền đen `border-2 border-border`, bóng cứng.
  - `ghost`: Nền trong suốt, khi hover có viền đen nhẹ hoặc nền `bg-muted`.
- **Card quán cafe:**
  - Nền `bg-card`, viền đen `border-2 border-border`, bóng cứng `shadow-[4px_4px_0px_0px_#000000]`, bo góc `rounded-lg`, padding 20px.
- **Input & Search bar:**
  - Nền `bg-surface`, viền đen `border-2 border-border`, bóng khi focus `focus-visible:shadow-[3px_3px_0px_0px_#000000]`, bo góc `rounded-lg`.
- **Badge tiện ích (Wifi, AC, Sạc):**
  - Bo tròn `rounded-full`, viền đen `border-2 border-border`, nền `bg-muted` hoặc màu pastel nổi bật (xanh mint, cam nhạt, tím nhạt).
- **Divider:**
  - Chiều cao `2px`, màu `bg-border` đen tuyền.

## Do's and Don'ts

- ✅ Luôn luôn dùng viền đen `border-2 border-border` và bóng cứng không mờ (`shadow-[..._0px_#000000]`).
- ✅ Giữ hiệu ứng tương tác ấn lún vật lý (`active:translate-x-... active:translate-y-...`) cho mọi nút bấm.
- ✅ Sử dụng trọng số chữ đậm (`font-bold`, `font-extrabold`) để tạo nhịp điệu tương phản khỏe khoắn.
- ✅ Giữ khoảng cách thoáng giữa các card để tránh bóng đổ lấn vào nhau.
- ❌ KHÔNG dùng bóng mờ Gaussian blur (`shadow-md`, `blur`, `backdrop-blur`).
- ❌ KHÔNG dùng viền mảnh 1px xám mờ hoặc viền trong suốt vô hình.
- ❌ KHÔNG hard-code mã màu hex trong component — luôn dùng semantic class (`bg-primary`, `border-border`).
- ❌ KHÔNG dùng màu chữ quá nhạt (opacity thấp) làm giảm độ tương phản của thiết kế.
