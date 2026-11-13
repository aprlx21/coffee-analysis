/**
 * Hợp đồng dùng chung cho tầng RAG (LanceDB + gemini-embedding-001).
 * File này do điều phối viên định nghĩa — các module chunk/embed/store/tool phải bám theo.
 * Không import "server-only" ở đây để script build (tsx) cũng dùng được.
 */

export const KNOWLEDGE_KINDS = ["review", "profile", "menu", "insight"] as const;
export type KnowledgeKind = (typeof KNOWLEDGE_KINDS)[number];

/** Số chiều vector — index và query PHẢI cùng giá trị. */
export const EMBEDDING_DIMENSIONS = 768;
export const EMBEDDING_MODEL = "gemini-embedding-001";

/** Thư mục index LanceDB (tương đối project root `web/`) và tên bảng. */
export const LANCEDB_RELATIVE_DIR = "data/lancedb";
export const KNOWLEDGE_TABLE = "knowledge";

/** Một chunk chưa có vector (đầu ra của chunk.ts). */
export interface KnowledgeChunk {
  /** Ổn định: sha1(kind + placeId + nguồn) — build lại không sinh trùng. */
  id: string;
  kind: KnowledgeKind;
  /** null cho kind = insight. */
  placeId: string | null;
  text: string;
  /** sha1 của `text` — dùng để resume (bỏ qua chunk đã embed, không đổi nội dung). */
  contentHash: string;
  rating: number | null;
  workScore: number | null;
  hasWifi: boolean;
  quiet: boolean;
  hasAc: boolean;
  hasOutlets: boolean;
  laptopFriendly: boolean;
  petFriendly: boolean;
  /** Tên quán, tác giả review, ngày, heading insight... (được JSON.stringify khi ghi LanceDB). */
  meta: Record<string, string | number | null>;
}

/** Bản ghi lưu trong bảng LanceDB `knowledge`. */
export interface KnowledgeRow extends Omit<KnowledgeChunk, "meta"> {
  vector: number[];
  /** JSON string của KnowledgeChunk.meta */
  meta: string;
}

/** Điều kiện lọc metadata trước vector search. */
export interface KnowledgeFilter {
  kind?: KnowledgeKind;
  placeId?: string;
  hasWifi?: boolean;
  quiet?: boolean;
  hasAc?: boolean;
  hasOutlets?: boolean;
  laptopFriendly?: boolean;
  petFriendly?: boolean;
}

/** Kết quả truy xuất (không có vector). */
export interface KnowledgeHit {
  id: string;
  kind: KnowledgeKind;
  placeId: string | null;
  text: string;
  rating: number | null;
  workScore: number | null;
  meta: Record<string, string | number | null>;
  /** Khoảng cách vector (nhỏ hơn = gần hơn). */
  distance: number | null;
}
