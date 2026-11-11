import type { AmenityKey, SortKey } from "./schema";

export interface AmenityMeta {
  key: AmenityKey;
  label: string;
  icon: string;
  isInferredFromReview?: boolean;
  group: "work" | "space" | "payment" | "other";
}

export const WORK_AMENITIES: AmenityMeta[] = [
  { key: "has_wifi", label: "Wi-Fi", icon: "📶", group: "work" },
  { key: "laptop_friendly", label: "Hợp làm việc laptop", icon: "💻", group: "work" },
  { key: "has_ac", label: "Máy lạnh", icon: "❄️", isInferredFromReview: true, group: "work" },
  { key: "has_outlets", label: "Ổ cắm điện", icon: "🔌", isInferredFromReview: true, group: "work" },
  { key: "quiet", label: "Yên tĩnh", icon: "🤫", group: "work" },
];

export const SPACE_AMENITIES: AmenityMeta[] = [
  { key: "outdoor_seating", label: "Ngồi ngoài trời", icon: "🌿", group: "space" },
  { key: "rooftop", label: "Rooftop", icon: "🏙️", group: "space" },
  { key: "cozy", label: "Ấm cúng", icon: "🛋️", group: "space" },
  { key: "pet_friendly", label: "Cho phép thú cưng", icon: "🐾", group: "space" },
  { key: "has_parking", label: "Có chỗ đỗ xe", icon: "🅿️", group: "space" },
];

export const PAYMENT_AMENITIES: AmenityMeta[] = [
  { key: "accepts_card", label: "Thẻ ngân hàng", icon: "💳", group: "payment" },
  { key: "accepts_nfc", label: "NFC / Apple Pay", icon: "📱", group: "payment" },
];

export const ALL_DISPLAY_AMENITIES: AmenityMeta[] = [...WORK_AMENITIES, ...SPACE_AMENITIES, ...PAYMENT_AMENITIES];

export const AMENITY_MAP: Record<AmenityKey, AmenityMeta> = {
  has_wifi: { key: "has_wifi", label: "Wi-Fi", icon: "📶", group: "work" },
  laptop_friendly: { key: "laptop_friendly", label: "Hợp làm việc laptop", icon: "💻", group: "work" },
  has_ac: { key: "has_ac", label: "Máy lạnh", icon: "❄️", isInferredFromReview: true, group: "work" },
  has_outlets: { key: "has_outlets", label: "Ổ cắm điện", icon: "🔌", isInferredFromReview: true, group: "work" },
  quiet: { key: "quiet", label: "Yên tĩnh", icon: "🤫", group: "work" },
  outdoor_seating: { key: "outdoor_seating", label: "Ngồi ngoài trời", icon: "🌿", group: "space" },
  rooftop: { key: "rooftop", label: "Rooftop", icon: "🏙️", group: "space" },
  cozy: { key: "cozy", label: "Ấm cúng", icon: "🛋️", group: "space" },
  pet_friendly: { key: "pet_friendly", label: "Cho phép thú cưng", icon: "🐾", group: "space" },
  has_parking: { key: "has_parking", label: "Có chỗ đỗ xe", icon: "🅿️", group: "space" },
  accepts_card: { key: "accepts_card", label: "Thẻ ngân hàng", icon: "💳", group: "payment" },
  accepts_nfc: { key: "accepts_nfc", label: "NFC / Apple Pay", icon: "📱", group: "payment" },
  cash_only: { key: "cash_only", label: "Chỉ tiền mặt", icon: "💵", group: "other" },
  accepts_reservations: { key: "accepts_reservations", label: "Nhận đặt bàn", icon: "📅", group: "other" },
  vegan_options: { key: "vegan_options", label: "Món thuần chay", icon: "🥗", group: "other" },
  vegetarian_options: { key: "vegetarian_options", label: "Món chay", icon: "🥬", group: "other" },
  live_music: { key: "live_music", label: "Nhạc sống", icon: "🎵", group: "other" },
  good_for_kids: { key: "good_for_kids", label: "Phù hợp trẻ em", icon: "👶", group: "other" },
};

export const SORT_LABELS: Record<SortKey, string> = {
  rating: "Đánh giá cao nhất",
  reviews: "Nhiều đánh giá nhất",
  work_score: "Hợp làm việc nhất",
  price_asc: "Giá thấp đến cao",
  price_desc: "Giá cao đến thấp",
};

export const PRICE_RANGE_LABELS: Record<string, string> = {
  "D1-100,000": "Dưới 100k",
  "D100-200K": "100k - 200k",
  "D200-300K": "200k - 300k",
  "D1-200,000": "1k - 200k",
};
