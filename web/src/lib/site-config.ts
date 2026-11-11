/**
 * Thông tin chung của app Cafe An Thượng.
 * An toàn để import ở cả Server lẫn Client Component.
 */
export const siteConfig = {
  name: "Cafe An Thượng",
  description:
    "Bản đồ và cơ sở dữ liệu chi tiết các quán cafe tại khu phố Tây An Thượng, Đà Nẵng. Tìm quán làm việc, wifi mạnh, máy lạnh, và bảng giá thực đơn minh bạch.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "vi",
  nav: [
    { label: "Khám phá", href: "/", icon: "Compass" },
    { label: "Bản đồ", href: "/ban-do", icon: "Map" },
    { label: "Hỏi AI", href: "/hoi-ai", icon: "Sparkles" },
    { label: "Phân tích", href: "/phan-tich", icon: "BarChart3" },
    { label: "Insights", href: "/insights", icon: "Lightbulb" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
