import type { KnowledgeChunk, KnowledgeKind } from "./types.ts";
import { createHash } from "node:crypto";

export interface DirectoryRow {
  place_id: string;
  name: string;
  description?: string | null;
  categories?: string[] | null;
  review_keywords?: unknown;
  featured_reviews?: unknown;
  rating?: number | null;
  work_score?: number | null;
  has_wifi?: boolean | null;
  laptop_friendly?: boolean | null;
  outdoor_seating?: boolean | null;
  quiet?: boolean | null;
  cozy?: boolean | null;
  pet_friendly?: boolean | null;
  has_parking?: boolean | null;
  accepts_card?: boolean | null;
  has_ac?: boolean | null;
  has_outlets?: boolean | null;
  accepts_nfc?: boolean | null;
  cash_only?: boolean | null;
  accepts_reservations?: boolean | null;
  vegan_options?: boolean | null;
  vegetarian_options?: boolean | null;
  rooftop?: boolean | null;
  live_music?: boolean | null;
  good_for_kids?: boolean | null;
  address?: string | null;
  short_address?: string | null;
  main_category?: string | null;
  price_range?: string | null;
  [key: string]: unknown;
}

export interface MenuSourceRow {
  place_id: string;
  name_raw: string;
  canonical_id: string | null;
  canonical_label: string | null;
  price_min: number | null;
  price_max: number | null;
  is_suspicious: boolean;
}

interface ReviewItem {
  name?: string | null;
  rating?: number | null;
  review_text?: string | null;
  published_at?: string | null;
}

interface KeywordItem {
  keyword: string;
  count: number;
}

export function sha1(text: string): string {
  return createHash("sha1").update(text, "utf8").digest("hex");
}

export function chunkId(kind: KnowledgeKind, placeId: string | null, source: string): string {
  return sha1(`${kind}|${placeId ?? ""}|${source}`);
}

function extractFlags(cafe?: DirectoryRow | null) {
  return {
    rating: typeof cafe?.rating === "number" ? cafe.rating : null,
    workScore: typeof cafe?.work_score === "number" ? cafe.work_score : null,
    hasWifi: Boolean(cafe?.has_wifi),
    quiet: Boolean(cafe?.quiet),
    hasAc: Boolean(cafe?.has_ac),
    hasOutlets: Boolean(cafe?.has_outlets),
    laptopFriendly: Boolean(cafe?.laptop_friendly),
    petFriendly: Boolean(cafe?.pet_friendly),
  };
}

function parseJsonArraySafe(val: unknown): unknown[] | null {
  let res = val;
  if (typeof res === "string") {
    try {
      res = JSON.parse(res);
    } catch {
      return null;
    }
  }
  if (typeof res === "string") {
    try {
      res = JSON.parse(res);
    } catch {
      return null;
    }
  }
  return Array.isArray(res) ? res : null;
}

function parseCategories(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => (typeof item === "string" ? item.trim() : "")).filter((item) => item.length > 0);
  }
  if (typeof val === "string") {
    const parsed = parseJsonArraySafe(val);
    if (parsed) {
      return parseCategories(parsed);
    }
    return val
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

const AMENITY_LABELS: Array<[keyof DirectoryRow, string]> = [
  ["has_wifi", "có wifi"],
  ["laptop_friendly", "phù hợp làm việc bằng laptop"],
  ["has_ac", "có máy lạnh/điều hòa"],
  ["has_outlets", "có ổ cắm điện"],
  ["quiet", "không gian yên tĩnh"],
  ["cozy", "không gian ấm cúng"],
  ["outdoor_seating", "có chỗ ngồi ngoài trời"],
  ["pet_friendly", "cho phép mang thú cưng"],
  ["has_parking", "có chỗ đỗ xe"],
  ["accepts_card", "chấp nhận thanh toán thẻ"],
  ["accepts_nfc", "chấp nhận thanh toán NFC"],
  ["rooftop", "có tầng thượng"],
  ["live_music", "có nhạc sống"],
  ["vegan_options", "có món thuần chay"],
  ["vegetarian_options", "có món chay"],
  ["good_for_kids", "phù hợp cho trẻ em"],
  ["accepts_reservations", "nhận đặt chỗ trước"],
];

function formatVnd(val: number): string {
  const rounded = Math.round(val);
  return `${String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}đ`;
}

function formatPriceRange(item: MenuSourceRow): string | null {
  if (item.is_suspicious) {
    return "giá chưa xác minh";
  }
  const min = item.price_min;
  const max = item.price_max;
  if (typeof min === "number" && typeof max === "number") {
    if (min === max) {
      return formatVnd(min);
    }
    return `${formatVnd(min)} - ${formatVnd(max)}`;
  }
  if (typeof min === "number") {
    return `từ ${formatVnd(min)}`;
  }
  if (typeof max === "number") {
    return `đến ${formatVnd(max)}`;
  }
  return null;
}

export function buildReviewChunks(cafes: DirectoryRow[]): KnowledgeChunk[] {
  if (!Array.isArray(cafes)) return [];
  const chunks: KnowledgeChunk[] = [];

  for (const cafe of cafes) {
    if (!cafe || !cafe.place_id) continue;
    const rawReviews = parseJsonArraySafe(cafe.featured_reviews);
    if (!rawReviews) continue;

    for (let idx = 0; idx < rawReviews.length; idx++) {
      const rev = rawReviews[idx] as ReviewItem | null;
      if (!rev || typeof rev !== "object") continue;

      const rawText = typeof rev.review_text === "string" ? rev.review_text.trim() : "";
      if (rawText.length < 15) continue;

      const truncatedText = rawText.length > 800 ? rawText.slice(0, 800) : rawText;
      const text = `Đánh giá quán ${cafe.name}: ${truncatedText}`;
      const source = `${idx}_${sha1(rawText).slice(0, 8)}`;
      const id = chunkId("review", cafe.place_id, source);

      const author = typeof rev.name === "string" && rev.name.trim() ? rev.name.trim() : null;
      const rating = typeof rev.rating === "number" ? rev.rating : null;
      const publishedAt =
        typeof rev.published_at === "string" && rev.published_at.trim() ? rev.published_at.trim() : null;

      chunks.push({
        id,
        kind: "review",
        placeId: cafe.place_id,
        text,
        contentHash: sha1(text),
        ...extractFlags(cafe),
        meta: {
          placeName: cafe.name,
          author,
          rating,
          publishedAt,
          published_at: publishedAt,
        },
      });
    }
  }

  return chunks;
}

export function buildProfileChunks(cafes: DirectoryRow[]): KnowledgeChunk[] {
  if (!Array.isArray(cafes)) return [];
  const chunks: KnowledgeChunk[] = [];

  for (const cafe of cafes) {
    if (!cafe || !cafe.place_id) continue;

    const lines: string[] = [`Quán cà phê ${cafe.name}.`];

    const description = typeof cafe.description === "string" ? cafe.description.trim() : "";
    if (description) {
      lines.push(`Mô tả: ${description}`);
    }

    const categories = parseCategories(cafe.categories);
    if (categories.length > 0) {
      lines.push(`Thể loại: ${categories.join(", ")}.`);
    }

    const naturalAmenities: string[] = [];
    for (const [key, label] of AMENITY_LABELS) {
      if (Boolean(cafe[key]) === true) {
        naturalAmenities.push(label);
      }
    }
    if (naturalAmenities.length > 0) {
      lines.push(`Tiện ích và đặc điểm: ${naturalAmenities.join(", ")}.`);
    }

    const rawKeywords = parseJsonArraySafe(cafe.review_keywords);
    if (rawKeywords) {
      const validKeywords: KeywordItem[] = [];
      for (const item of rawKeywords) {
        if (
          item &&
          typeof item === "object" &&
          "keyword" in item &&
          typeof (item as KeywordItem).keyword === "string"
        ) {
          const kw = (item as KeywordItem).keyword.trim();
          if (kw) {
            const count = typeof (item as KeywordItem).count === "number" ? (item as KeywordItem).count : 0;
            validKeywords.push({ keyword: kw, count });
          }
        }
      }

      validKeywords.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.keyword.localeCompare(b.keyword);
      });

      const topKeywords = validKeywords.slice(0, 10).map((k) => k.keyword);
      if (topKeywords.length > 0) {
        lines.push(`Từ khóa nổi bật từ đánh giá: ${topKeywords.join(", ")}.`);
      }
    }

    const text = lines.join("\n");
    const id = chunkId("profile", cafe.place_id, "main");

    chunks.push({
      id,
      kind: "profile",
      placeId: cafe.place_id,
      text,
      contentHash: sha1(text),
      ...extractFlags(cafe),
      meta: {
        placeName: cafe.name,
      },
    });
  }

  return chunks;
}

export function buildMenuChunks(cafes: DirectoryRow[], items: MenuSourceRow[]): KnowledgeChunk[] {
  if (!Array.isArray(cafes) || !Array.isArray(items)) return [];

  const itemsByPlace = new Map<string, MenuSourceRow[]>();
  for (const item of items) {
    if (!item || !item.place_id) continue;
    let list = itemsByPlace.get(item.place_id);
    if (!list) {
      list = [];
      itemsByPlace.set(item.place_id, list);
    }
    list.push(item);
  }

  const chunks: KnowledgeChunk[] = [];

  for (const cafe of cafes) {
    if (!cafe || !cafe.place_id) continue;
    const placeItems = itemsByPlace.get(cafe.place_id);
    if (!placeItems || placeItems.length === 0) continue;

    // Khử trùng lặp theo name_raw chuẩn hoá (lowercase, trim, gộp khoảng trắng)
    const dedupedMap = new Map<string, MenuSourceRow>();
    for (const rawItem of placeItems) {
      if (!rawItem || !rawItem.name_raw) continue;
      const normKey = rawItem.name_raw.toLowerCase().trim().replace(/\s+/g, " ");
      if (!normKey) continue;

      const existing = dedupedMap.get(normKey);
      if (!existing) {
        dedupedMap.set(normKey, rawItem);
      } else {
        // Giữ mục có thông tin tốt hơn: không suspicious hoặc có canonical_id
        const existingScore = (existing.canonical_id ? 2 : 0) + (!existing.is_suspicious ? 1 : 0);
        const newScore = (rawItem.canonical_id ? 2 : 0) + (!rawItem.is_suspicious ? 1 : 0);
        if (newScore > existingScore) {
          dedupedMap.set(normKey, rawItem);
        }
      }
    }

    if (dedupedMap.size === 0) continue;

    // Nhóm theo canonical (món không có canonical -> nhóm "Món khác")
    const groupsMap = new Map<string, { label: string; isOther: boolean; items: MenuSourceRow[] }>();

    for (const item of dedupedMap.values()) {
      const isOther = !item.canonical_id;
      const groupKey = isOther ? "__other__" : (item.canonical_id as string);
      const groupLabel = isOther ? "Món khác" : item.canonical_label?.trim() || item.canonical_id || "Món khác";

      let group = groupsMap.get(groupKey);
      if (!group) {
        group = { label: groupLabel, isOther, items: [] };
        groupsMap.set(groupKey, group);
      }
      group.items.push(item);
    }

    // Sắp xếp các nhóm: nhóm canonical có tên trước (A-Z), "Món khác" sau cùng
    const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
      if (a.isOther !== b.isOther) return a.isOther ? 1 : -1;
      return a.label.localeCompare(b.label, "vi");
    });

    for (const group of sortedGroups) {
      group.items.sort((a, b) => a.name_raw.trim().localeCompare(b.name_raw.trim(), "vi"));
    }

    const header = `Thực đơn quán ${cafe.name}:`;

    // Bản đầy đủ kèm giá
    const fullGroupLines: string[] = [];
    for (const group of sortedGroups) {
      const itemStrs = group.items.map((item) => {
        const name = item.name_raw.trim();
        const priceStr = formatPriceRange(item);
        return priceStr ? `${name} (${priceStr})` : name;
      });
      fullGroupLines.push(`- ${group.label}: ${itemStrs.join(", ")}`);
    }

    let text = `${header}\n${fullGroupLines.join("\n")}`;

    // Giới hạn độ dài chunk ~2500 ký tự; ưu tiên giữ đủ tên món
    if (text.length > 2500) {
      const compactGroupLines: string[] = [];
      for (const group of sortedGroups) {
        const itemStrs = group.items.map((item) => item.name_raw.trim());
        compactGroupLines.push(`- ${group.label}: ${itemStrs.join(", ")}`);
      }
      const compactText = `${header}\n${compactGroupLines.join("\n")}`;
      if (compactText.length <= 2500) {
        text = compactText;
      } else {
        // Cắt gọn ở ranh giới món an toàn (dấu phẩy hoặc xuống dòng)
        let cut = compactText.slice(0, 2490);
        const lastDelim = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf("\n"));
        if (lastDelim > header.length) {
          cut = cut.slice(0, lastDelim);
        }
        text = `${cut}...`;
      }
    }

    const id = chunkId("menu", cafe.place_id, "main");

    chunks.push({
      id,
      kind: "menu",
      placeId: cafe.place_id,
      text,
      contentHash: sha1(text),
      ...extractFlags(cafe),
      meta: {
        placeName: cafe.name,
      },
    });
  }

  return chunks;
}

interface RawSection {
  h1: string | null;
  h2: string | null;
  h3: string | null;
  lines: string[];
}

export function buildInsightChunks(markdown: string): KnowledgeChunk[] {
  if (typeof markdown !== "string" || !markdown.trim()) return [];

  const rawLines = markdown.split(/\r?\n/);
  const sections: RawSection[] = [];

  let currentH1: string | null = null;
  let currentH2: string | null = null;
  let currentH3: string | null = null;
  let currentLines: string[] = [];

  function flushCurrent() {
    const body = currentLines.join("\n").trim();
    if (body.length > 0) {
      sections.push({
        h1: currentH1,
        h2: currentH2,
        h3: currentH3,
        lines: [...currentLines],
      });
    }
    currentLines = [];
  }

  for (const line of rawLines) {
    // Bỏ dòng '---'
    if (/^\s*---\s*$/.test(line)) {
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      flushCurrent();
      currentH3 = h3Match[1].trim();
      continue;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      flushCurrent();
      currentH2 = h2Match[1].trim();
      currentH3 = null;
      continue;
    }

    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      flushCurrent();
      currentH1 = h1Match[1].trim();
      currentH2 = null;
      currentH3 = null;
      continue;
    }

    currentLines.push(line);
  }

  flushCurrent();

  const chunks: KnowledgeChunk[] = [];
  const MAX_CHUNK_LEN = 1500;
  const OVERLAP_LEN = 150;

  for (let secIdx = 0; secIdx < sections.length; secIdx++) {
    const sec = sections[secIdx];
    const body = sec.lines.join("\n").trim();
    if (!body) continue;

    let headerPrefix = "";
    let metaHeading = "";

    if (sec.h3) {
      headerPrefix = sec.h2 ? `## ${sec.h2}\n### ${sec.h3}` : `### ${sec.h3}`;
      metaHeading = sec.h2 ? `${sec.h2} > ${sec.h3}` : sec.h3;
    } else if (sec.h2) {
      headerPrefix = `## ${sec.h2}`;
      metaHeading = sec.h2;
    } else if (sec.h1) {
      headerPrefix = `# ${sec.h1}`;
      metaHeading = sec.h1;
    } else {
      metaHeading = "Tổng quan";
    }

    const fullText = headerPrefix ? `${headerPrefix}\n\n${body}` : body;

    // Nếu vừa vặn trong ngưỡng MAX_CHUNK_LEN
    if (fullText.length <= MAX_CHUNK_LEN) {
      const source = `sec_${secIdx}_part_0_${sha1(fullText).slice(0, 8)}`;
      const id = chunkId("insight", null, source);

      chunks.push({
        id,
        kind: "insight",
        placeId: null,
        text: fullText,
        contentHash: sha1(fullText),
        ...extractFlags(null),
        meta: {
          heading: metaHeading,
        },
      });
      continue;
    }

    // Nếu vượt quá MAX_CHUNK_LEN, chia theo đoạn văn kèm overlap ~150 ký tự
    const availableBodyLen = Math.max(300, MAX_CHUNK_LEN - (headerPrefix ? headerPrefix.length + 2 : 0));
    const paragraphs = body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const bodyParts: string[] = [];
    let currentPart = "";

    for (const para of paragraphs) {
      if (!currentPart) {
        if (para.length > availableBodyLen) {
          // Đoạn văn đơn lẻ quá dài, cắt theo cửa sổ kèm overlap
          let start = 0;
          while (start < para.length) {
            const end = Math.min(start + availableBodyLen, para.length);
            bodyParts.push(para.slice(start, end).trim());
            if (end >= para.length) break;
            start = end - OVERLAP_LEN;
          }
        } else {
          currentPart = para;
        }
      } else {
        const candidate = `${currentPart}\n\n${para}`;
        if (candidate.length <= availableBodyLen) {
          currentPart = candidate;
        } else {
          bodyParts.push(currentPart);
          // Overlap ~150 ký tự từ phần trước
          const overlap = currentPart.length > OVERLAP_LEN ? currentPart.slice(-OVERLAP_LEN).trim() : currentPart;
          if (para.length > availableBodyLen) {
            // Đoạn văn mới quá dài: cắt theo cùng cơ chế cửa sổ kèm overlap
            let start = 0;
            let isFirst = true;
            while (start < para.length) {
              const end = Math.min(start + availableBodyLen, para.length);
              const slice = para.slice(start, end).trim();
              if (isFirst && overlap) {
                bodyParts.push(`${overlap}\n\n${slice}`.trim());
                isFirst = false;
              } else {
                bodyParts.push(slice);
              }
              if (end >= para.length) break;
              start = end - OVERLAP_LEN;
            }
            currentPart = "";
          } else {
            currentPart = `${overlap}\n\n${para}`;
          }
        }
      }
    }

    if (currentPart && (!bodyParts.length || bodyParts[bodyParts.length - 1] !== currentPart)) {
      bodyParts.push(currentPart);
    }

    for (let partIdx = 0; partIdx < bodyParts.length; partIdx++) {
      const part = bodyParts[partIdx];
      const chunkText = headerPrefix ? `${headerPrefix}\n\n${part}` : part;
      const source = `sec_${secIdx}_part_${partIdx}_${sha1(chunkText).slice(0, 8)}`;
      const id = chunkId("insight", null, source);

      chunks.push({
        id,
        kind: "insight",
        placeId: null,
        text: chunkText,
        contentHash: sha1(chunkText),
        ...extractFlags(null),
        meta: {
          heading: metaHeading,
        },
      });
    }
  }

  return chunks;
}
