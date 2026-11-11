/**
 * Dữ liệu tĩnh của feature. Khi có database, thay file này bằng
 * `server/queries.ts` (đọc DB) mà không phải sửa component.
 */
export const skeletonPillars = [
  { title: "AGENTS.md", body: "Luật chung ở gốc, context riêng trong từng folder." },
  { title: "DESIGN.md", body: "Màu, font, spacing, component — AI và người cùng đọc." },
  { title: "Skills", body: "Quy trình đóng gói sẵn, AI chỉ nạp khi cần." },
] as const;
