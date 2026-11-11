"use client";

import { Polygon, Tooltip } from "react-leaflet";

/**
 * Tọa độ ranh giới vùng lõi Phố Du lịch An Thượng (Đà Nẵng):
 * Giới hạn bởi 4 trục huyết mạch:
 * - Phía Đông: Đường Võ Nguyên Giáp (ven biển)
 * - Phía Bắc: Đường Nguyễn Văn Thoại
 * - Phía Tây: Đường Lê Quang Đạo / Ngũ Hành Sơn
 * - Phía Nam: Tuyến đường Phan Tôn - Hoàng Kế Viêm
 */
export const AN_THUONG_CORE_BOUNDS: [number, number][] = [
  [16.0562, 108.2435], // Góc Bắc - Đông (Nguyễn Văn Thoại & Võ Nguyên Giáp ven biển)
  [16.0465, 108.2465], // Góc Nam - Đông (Hoàng Kế Viêm & Võ Nguyên Giáp)
  [16.0450, 108.2425], // Góc Nam - Tây (Hoàng Kế Viêm & Lê Quang Đạo)
  [16.0545, 108.2395], // Góc Bắc - Tây (Nguyễn Văn Thoại & Lê Quang Đạo)
];

export function AnThuongCorePolygon() {
  return (
    <Polygon
      positions={AN_THUONG_CORE_BOUNDS}
      pathOptions={{
        color: "#000000",
        weight: 3,
        dashArray: "6, 8",
        fillColor: "#FFE600",
        fillOpacity: 0.12,
      }}
    >
      <Tooltip sticky direction="top" className="neubrutalism-area-tooltip">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <span className="size-2 rounded-full bg-primary ring-2 ring-border" />
          <span>VÙNG LÕI PHỐ DU LỊCH AN THƯỢNG ☕</span>
        </div>
      </Tooltip>
    </Polygon>
  );
}
