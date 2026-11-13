/**
 * Kho lưu trữ vector LanceDB cho tầng RAG (CHỈ ĐỌC lúc runtime).
 *
 * Schema bảng LanceDB `knowledge` mong đợi (khớp với build index script):
 * - id: Utf8 (khóa chính logic: sha1(kind + placeId + nguồn))
 * - kind: Utf8 ("review" | "profile" | "menu" | "insight")
 * - placeId: Utf8 (nullable)
 * - text: Utf8
 * - contentHash: Utf8 (sha1 của text)
 * - rating: Float32 (nullable)
 * - workScore: Float32 (nullable)
 * - hasWifi: Boolean
 * - quiet: Boolean
 * - hasAc: Boolean
 * - hasOutlets: Boolean
 * - laptopFriendly: Boolean
 * - petFriendly: Boolean
 * - meta: Utf8 (JSON string của Record<string, string | number | null>)
 * - vector: FixedSizeList<Float32>[768] (chuẩn hóa L2, distance metric: cosine)
 */

import "server-only";

import * as fs from "node:fs";
import * as path from "node:path";
import * as lancedb from "@lancedb/lancedb";
import {
  KNOWLEDGE_KINDS,
  KNOWLEDGE_TABLE,
  LANCEDB_RELATIVE_DIR,
  type KnowledgeFilter,
  type KnowledgeHit,
  type KnowledgeKind,
} from "./types";

let cachedConnection: lancedb.Connection | null = null;
let cachedTable: lancedb.Table | null = null;

/**
 * Mở kết nối và bảng LanceDB knowledge theo phương thức lazy singleton.
 */
async function getTable(): Promise<lancedb.Table> {
  // Phải là literal tĩnh trỏ vào `data/lancedb` (khớp LANCEDB_RELATIVE_DIR): nếu truyền biến, Turbopack
  // sẽ trace TOÀN BỘ project vào function Vercel và có thể vượt giới hạn kích thước.
  const dbDir = path.join(process.cwd(), "data", "lancedb");
  if (!fs.existsSync(dbDir)) {
    throw new Error(
      `Thư mục chỉ mục LanceDB không tồn tại: ${LANCEDB_RELATIVE_DIR}. Vui lòng chạy script build index trước.`,
    );
  }

  try {
    if (!cachedConnection) {
      cachedConnection = await lancedb.connect(dbDir);
    }

    if (!cachedTable || !cachedTable.isOpen()) {
      cachedTable = await cachedConnection.openTable(KNOWLEDGE_TABLE);
    }

    return cachedTable;
  } catch (err) {
    cachedConnection = null;
    cachedTable = null;
    throw new Error(
      `Không thể mở bảng tri thức LanceDB (${KNOWLEDGE_TABLE}). Chi tiết: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Kiểm tra xem chỉ mục tri thức LanceDB đã tồn tại và mở được bảng knowledge chưa.
 * Không throw lỗi, trả về false nếu chưa có hoặc có lỗi IO/hỏng bảng.
 */
export async function hasKnowledgeIndex(): Promise<boolean> {
  try {
    const table = await getTable();
    return table.isOpen();
  } catch {
    return false;
  }
}

/**
 * Parse trường meta lưu trữ dưới dạng JSON an toàn, fallback về object rỗng nếu có lỗi.
 */
function parseMeta(rawMeta: unknown): Record<string, string | number | null> {
  if (!rawMeta) {
    return {};
  }
  if (typeof rawMeta === "object" && !Array.isArray(rawMeta)) {
    return rawMeta as Record<string, string | number | null>;
  }
  if (typeof rawMeta === "string") {
    try {
      const parsed = JSON.parse(rawMeta);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string | number | null>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Xây dựng biểu thức WHERE SQL an toàn từ KnowledgeFilter.
 * - kind: kiểm tra qua danh sách trắng KNOWLEDGE_KINDS
 * - placeId: escape ký tự nháy đơn và giới hạn độ dài
 * - các cờ boolean: lọc = true
 */
function buildWhereClause(filter: KnowledgeFilter): string | undefined {
  const clauses: string[] = [];

  if (filter.kind && (KNOWLEDGE_KINDS as readonly string[]).includes(filter.kind)) {
    clauses.push(`kind = '${filter.kind}'`);
  }

  if (typeof filter.placeId === "string" && filter.placeId.trim().length > 0) {
    const cleanPlaceId = filter.placeId
      .trim()
      .slice(0, 128)
      .replace(/[\r\n\t]/g, "")
      .replace(/'/g, "''");
    if (cleanPlaceId.length > 0) {
      clauses.push(`placeId = '${cleanPlaceId}'`);
    }
  }

  const booleanKeys: Array<keyof KnowledgeFilter> = [
    "hasWifi",
    "quiet",
    "hasAc",
    "hasOutlets",
    "laptopFriendly",
    "petFriendly",
  ];

  for (const key of booleanKeys) {
    if (filter[key] === true) {
      clauses.push(`${key} = true`);
    }
  }

  if (clauses.length === 0) {
    return undefined;
  }

  return clauses.join(" AND ");
}

/**
 * Truy vấn k vector gần nhất trong bảng tri thức LanceDB với bộ lọc metadata.
 * Runtime chỉ đọc dữ liệu, không ghi bất kỳ file nào.
 * Distance metric khớp với metric cosine lúc xây dựng chỉ mục vector.
 */
export async function queryKnowledge(vector: number[], filter: KnowledgeFilter, k: number): Promise<KnowledgeHit[]> {
  try {
    const table = await getTable();
    const limit = Math.max(1, Math.floor(k));

    let query = (table.search(vector) as lancedb.VectorQuery).distanceType("cosine");
    const whereClause = buildWhereClause(filter);

    if (whereClause) {
      query = query.where(whereClause);
    }

    const rows = (await query.limit(limit).toArray()) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: String(row.id ?? ""),
      kind: row.kind as KnowledgeKind,
      placeId: (row.placeId as string | null) ?? null,
      text: String(row.text ?? ""),
      rating: typeof row.rating === "number" ? row.rating : null,
      workScore: typeof row.workScore === "number" ? row.workScore : null,
      meta: parseMeta(row.meta),
      distance: typeof row._distance === "number" ? row._distance : null,
    }));
  } catch (err) {
    throw new Error(`Không thể truy vấn cơ sở tri thức LanceDB: ${err instanceof Error ? err.message : String(err)}`);
  }
}
