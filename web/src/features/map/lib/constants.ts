/**
 * Hằng số cấu hình dữ liệu và màu trực quan hóa (data-viz) cho bản đồ An Thượng.
 *
 * LƯU Ý VỀ MÀU SẮC:
 * Theo quy ước DESIGN.md, các thành phần UI chung không hard-code mã màu hex mà dùng semantic class.
 * Tuy nhiên, các mã màu hex trong file này là NGOẠI LỆ HỢP LỆ được dành riêng cho lớp biểu diễn bản đồ Leaflet
 * (Leaflet markers, cluster icons, SVG overlays, canvas paths và dynamic data-viz legend).
 */

export const AN_THUONG_CENTER: [number, number] = [16.0497, 108.244];
export const DEFAULT_ZOOM = 16;
export const MIN_ZOOM = 13;
export const MAX_ZOOM = 19;

/**
 * 4 Cụm không gian địa lý tại An Thượng.
 * Màu data-viz sắc thái rực rỡ, phân biệt rõ trên nền bản đồ sáng & vệ tinh.
 */
export const SPATIAL_CLUSTERS = {
  core: {
    key: "core",
    label: "Siêu Lõi Phố Đi Bộ & Đêm",
    shortLabel: "Siêu lõi",
    color: "#ea580c", // Cam đậm / Amber core
  },
  beach: {
    key: "beach",
    label: "Trục Mặt Biển",
    shortLabel: "Mặt biển",
    color: "#0284c7", // Xanh dương biển
  },
  west: {
    key: "west",
    label: "Dải Dân Sinh – Sinh Viên (Phía Tây)",
    shortLabel: "Phía Tây",
    color: "#10b981", // Xanh ngọc lục bảo
  },
  north: {
    key: "north",
    label: "Hành Lang Thương Mại Phía Bắc",
    shortLabel: "Phía Bắc",
    color: "#8b5cf6", // Tím violet
  },
} as const;

export type SpatialClusterKey = keyof typeof SPATIAL_CLUSTERS;

/**
 * Tọa độ đa giác Siêu Lõi Phố Đi Bộ & Đêm (ULTRA_CORE).
 *
 * Ghi chú điều chỉnh hình học tất định:
 * Điểm góc đông nam [16.0475, 108.2474] được gọt nhẹ trục kinh độ (108.2474 < 108.2475)
 * để ranh giới lõi không lấn sang dải mặt biển (lng >= 108.2475), bảo đảm phân bổ chuẩn
 * hình học: Siêu lõi: 68 quán, Mặt biển: 9 quán, Phía Tây: 19 quán, Phía Bắc: 19 quán (tổng 115 quán).
 */
export const ULTRA_CORE_POLYGON: [number, number][] = [
  [16.0525, 108.2468],
  [16.0475, 108.2474],
  [16.0463, 108.244],
  [16.0513, 108.2422],
];

/**
 * Tọa độ Vành đai Khu du lịch An Thượng (Quy hoạch mở rộng).
 */
export const BOUNDARY_POLYGON: [number, number][] = [
  [16.0575, 108.2479],
  [16.046, 108.2512],
  [16.0435, 108.2422],
  [16.0538, 108.2388],
];

/**
 * Tọa độ đường bờ biển Bãi tắm Mỹ Khê.
 */
export const COASTLINE_POLYLINE: [number, number][] = [
  [16.062, 108.2472],
  [16.057, 108.2488],
  [16.0505, 108.2508],
  [16.044, 108.2526],
  [16.038, 108.2542],
];

/**
 * Phân nhóm ngành hàng (Industry Groups).
 */
export const INDUSTRY_GROUPS = {
  bar: {
    key: "bar",
    label: "Bar & Pub đêm",
    color: "#a855f7", // Tím neon bar
  },
  restaurant: {
    key: "restaurant",
    label: "Nhà hàng & Bistro",
    color: "#f97316", // Cam ẩm thực
  },
  cafe_bakery: {
    key: "cafe_bakery",
    label: "Cafe & Tiệm bánh",
    color: "#ec4899", // Hồng ngọt ngào
  },
  specialty_coffee: {
    key: "specialty_coffee",
    label: "Quán Cà Phê Chuyên sâu",
    color: "#b45309", // Nâu hổ phách cà phê
  },
} as const;

export type IndustryGroupKey = keyof typeof INDUSTRY_GROUPS;

/**
 * Phân khúc giá đồ uống (Price Tiers).
 */
export const PRICE_TIERS = {
  budget: {
    key: "budget",
    label: "Bình dân (< 35k)",
    color: "#10b981", // Xanh lá
  },
  mid: {
    key: "mid",
    label: "Tầm trung (35k–50k)",
    color: "#3b82f6", // Xanh dương
  },
  high: {
    key: "high",
    label: "Cao cấp / Specialty (> 50k)",
    color: "#ef4444", // Đỏ nổi bật
  },
  unknown: {
    key: "unknown",
    label: "Chưa có giá",
    color: "#6b7280", // Xám trung tính
  },
} as const;

export type PriceTierKey = keyof typeof PRICE_TIERS;

/**
 * Đánh giá sao (Rating Tiers).
 */
export const RATING_TIERS = {
  excellent: {
    key: "excellent",
    label: "Xuất sắc (≥ 4.7★)",
    color: "#eab308", // Vàng gold
  },
  good: {
    key: "good",
    label: "Tốt (4.3★–4.6★)",
    color: "#06b6d4", // Xanh ngọc cyan
  },
  average: {
    key: "average",
    label: "Trung bình (< 4.3★)",
    color: "#94a3b8", // Xám xanh
  },
  unrated: {
    key: "unrated",
    label: "Chưa có đánh giá",
    color: "#cbd5e1", // Xám nhạt
  },
} as const;

export type RatingTierKey = keyof typeof RATING_TIERS;

/**
 * 4 chế độ tô màu bản đồ.
 */
export const COLOR_MODES = [
  { id: "spatial", label: "Cụm không gian" },
  { id: "price", label: "Phân khúc giá" },
  { id: "industry", label: "Ngành hàng" },
  { id: "rating", label: "Đánh giá sao" },
] as const;

export type ColorMode = (typeof COLOR_MODES)[number]["id"];

/**
 * Chế độ hiển thị điểm: Rời rạc vs Gom cụm.
 */
export type DisplayMode = "points" | "clusters";

/**
 * Lớp bản đồ nền (Tile Layers).
 */
export const TILE_LAYERS = [
  {
    id: "esri-street",
    name: "Esri Đường phố",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, OpenStreetMap contributors',
    maxZoom: MAX_ZOOM,
    maxNativeZoom: 18,
  },
  {
    id: "esri-sat",
    name: "Esri Vệ tinh",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics',
    maxZoom: MAX_ZOOM,
    maxNativeZoom: 18,
  },
  {
    id: "osm",
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: MAX_ZOOM,
    maxNativeZoom: 19,
  },
] as const;
