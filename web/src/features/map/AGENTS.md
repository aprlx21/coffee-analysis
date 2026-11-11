# features/map

## Mục đích

- Hiển thị bản đồ tương tác các quán cafe tại An Thượng theo phong cách Soft Glassmorphism.
- Hỗ trợ 2 chế độ hiển thị (rời rạc, gom cụm) và 4 chế độ tô màu dữ liệu (cụm không gian, phân khúc giá, ngành hàng, đánh giá sao).

## Phụ thuộc

- Dùng: `@/server/db` (`CafeCard`), `react-leaflet`, `leaflet`, `leaflet.markercluster`.
- Được dùng bởi: `src/app/ban-do/page.tsx`.

## Lưu ý

- Leaflet chỉ chạy phía client qua dynamic import (`map-container.tsx`).
- Bộ lọc và tô màu xử lý tức thì (client-side) trên `MapPageView`, không đổi URL qua router.
- Ranh giới địa lý siêu lõi và dải mặt biển dựa trên quy tắc hình học tất định trong `classify.ts`.
- Ngoại lệ màu: mã màu hex chỉ định nghĩa tại `lib/constants.ts` cho các lớp trực quan hóa Leaflet (data-viz), thành phần UI khác dùng class semantic theo DESIGN.md.
