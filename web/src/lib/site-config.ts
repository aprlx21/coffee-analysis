/**
 * Thông tin chung của app. Mỗi dự án mới chỉ cần sửa file này
 * (tên, mô tả, link) thay vì đi tìm khắp code.
 * An toàn để import ở cả Server lẫn Client Component.
 */
export const siteConfig = {
  name: "Kungfu Stack",
  description: "Khung xương Next.js cho builder: làm phần nền một lần, giải nhiều bài toán.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "vi",
  nav: [{ label: "Trang chủ", href: "/" }],
} as const;

export type SiteConfig = typeof siteConfig;
