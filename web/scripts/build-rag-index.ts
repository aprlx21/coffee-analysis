import { existsSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import * as lancedb from "@lancedb/lancedb";
import postgres from "postgres";

// prettier-ignore
// @ts-expect-error TS5097: Node strip-types cần đuôi .ts (tsconfig không bật allowImportingTsExtensions)
import { type DirectoryRow, type MenuSourceRow, buildInsightChunks, buildMenuChunks, buildProfileChunks, buildReviewChunks, sha1 } from "../src/ai/rag/chunk.ts";
// prettier-ignore
// @ts-expect-error TS5097: Node strip-types cần đuôi .ts (tsconfig không bật allowImportingTsExtensions)
import { createEmbedder, normalizeVector } from "../src/ai/rag/embed-core.ts";
// prettier-ignore
// @ts-expect-error TS5097: Node strip-types cần đuôi .ts (tsconfig không bật allowImportingTsExtensions)
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, KNOWLEDGE_KINDS, KNOWLEDGE_TABLE, LANCEDB_RELATIVE_DIR, type KnowledgeChunk, type KnowledgeKind, type KnowledgeRow } from "../src/ai/rag/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Hằng số cấu hình phân bổ tốc độ (pacing) cho Gemini Free Tier */
const DEFAULT_BATCH_SIZE = 25;
const MAX_REQUESTS_PER_MINUTE = 80;
const MAX_TOKENS_PER_MINUTE = 25000;
const CHARS_PER_TOKEN = 3;

/** 15 món chuẩn hoá nhóm Cà phê theo issue #16 */
const COFFEE_CANONICAL_IDS = new Set<string>([
  "ca_phe_den",
  "ca_phe_sua",
  "ca_phe_sua_tuoi",
  "bac_xiu",
  "ca_phe_muoi",
  "ca_phe_dua",
  "ca_phe_trung",
  "americano",
  "espresso",
  "latte",
  "cappuccino",
  "flat_white",
  "mocha",
  "caramel_macchiato",
  "cold_brew",
]);

interface CliOptions {
  dryRun: boolean;
  outDir: string;
  onlyKind?: KnowledgeKind;
  fresh: boolean;
  fakeEmbed: boolean;
  help: boolean;
}

function parseArgs(args: string[]): CliOptions {
  const defaultOutDir = resolve(__dirname, "..", LANCEDB_RELATIVE_DIR);
  let dryRun = false;
  let outDir = defaultOutDir;
  let onlyKind: KnowledgeKind | undefined;
  let fresh = false;
  let fakeEmbed = false;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      continue;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--fresh") {
      fresh = true;
    } else if (arg === "--fake-embed") {
      fakeEmbed = true;
    } else if (arg === "-h" || arg === "--help") {
      help = true;
    } else if (arg === "--out") {
      const next = args[i + 1];
      if (!next || next.startsWith("-")) {
        console.error("❌ Lỗi: Cờ --out yêu cầu một đường dẫn thư mục hợp lệ.");
        process.exit(1);
      }
      outDir = resolve(process.cwd(), next);
      i++;
    } else if (arg === "--only") {
      const next = args[i + 1];
      if (!next || !KNOWLEDGE_KINDS.includes(next as KnowledgeKind)) {
        console.error(
          `❌ Lỗi: Cờ --only chỉ chấp nhận một trong các loại sau: ${KNOWLEDGE_KINDS.join(", ")} (nhận: "${next ?? ""}")`,
        );
        process.exit(1);
      }
      onlyKind = next as KnowledgeKind;
      i++;
    } else {
      console.error(`❌ Cảnh báo: Tham số không xác định "${arg}". Dùng --help để xem hướng dẫn.`);
    }
  }

  return { dryRun, outDir, onlyKind, fresh, fakeEmbed, help };
}

function printHelp(): void {
  console.log(`
Hướng dẫn sử dụng script build-rag-index:
  node --conditions=react-server --env-file=.env.local --experimental-strip-types scripts/build-rag-index.ts [options]
  (hoặc chạy qua: pnpm rag:build [options])

Các cờ tùy chọn (CLI flags):
  --dry-run        Chỉ lấy dữ liệu từ DB + tạo chunks + in thống kê; không cần GEMINI_API_KEY, không ghi LanceDB.
  --out <dir>      Đường dẫn thư mục lưu trữ LanceDB (mặc định: <web>/data/lancedb).
  --only <kind>    Chỉ lập chỉ mục lại một loại cụ thể: review | profile | menu | insight.
  --fresh          Bỏ qua bộ nhớ đệm vector hiện có, tạo mới và embed lại toàn bộ.
  --fake-embed     (Cờ ẩn kiểm thử) Dùng embedder giả lập xác định từ sha1 (không ngẫu nhiên), KHÔNG gọi API.
                   CHỈ cho phép khi --out trỏ tới thư mục tạm bên ngoài web/data/lancedb.
  -h, --help       Hiển thị trợ giúp này.
`);
}

function getDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED
  );
}

/**
 * Sinh vector giả lập có tính xác định từ contentHash (chỉ dùng cho --fake-embed khi test).
 */
function createFakeVector(contentHash: string, dimensions: number): number[] {
  const vec = new Array<number>(dimensions);
  for (let i = 0; i < dimensions; i++) {
    const sub = contentHash.charCodeAt(i % contentHash.length);
    vec[i] = ((sub * (i + 1)) % 1000) / 1000 - 0.5;
  }
  return normalizeVector(vec);
}

/**
 * Schema tường minh cho bảng LanceDB `knowledge` (đúng KnowledgeRow).
 */
const KNOWLEDGE_SCHEMA = {
  fields: [
    { name: "id", type: "utf8", nullable: false },
    { name: "kind", type: "utf8", nullable: false },
    { name: "placeId", type: "utf8", nullable: true },
    { name: "text", type: "utf8", nullable: false },
    { name: "contentHash", type: "utf8", nullable: false },
    { name: "rating", type: "float32", nullable: true },
    { name: "workScore", type: "float32", nullable: true },
    { name: "hasWifi", type: "bool", nullable: false },
    { name: "quiet", type: "bool", nullable: false },
    { name: "hasAc", type: "bool", nullable: false },
    { name: "hasOutlets", type: "bool", nullable: false },
    { name: "laptopFriendly", type: "bool", nullable: false },
    { name: "petFriendly", type: "bool", nullable: false },
    { name: "meta", type: "utf8", nullable: false },
    {
      name: "vector",
      type: {
        typeId: 16,
        listSize: EMBEDDING_DIMENSIONS,
        children: [{ name: "item", type: "float32", nullable: true }],
      },
      nullable: false,
    },
  ],
  metadata: new Map<string, string>(),
  get names(): string[] {
    return this.fields.map((f) => f.name);
  },
};

function validateVector(vector: number[], chunkId: string): void {
  if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Vector của chunk ${chunkId} sai kích thước: mong đợi ${EMBEDDING_DIMENSIONS}, nhận được ${vector?.length ?? 0}`,
    );
  }
  for (let i = 0; i < vector.length; i++) {
    const val = vector[i];
    if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
      throw new Error(`Vector của chunk ${chunkId} chứa giá trị không hợp lệ (NaN/Infinite) tại vị trí ${i}: ${val}`);
    }
  }
}

/**
 * Chuẩn hoá đường dẫn để so sánh an toàn trên mọi hệ điều hành (kể cả khác biệt hoa/thường trên Windows).
 */
function normalizePathForComparison(p: string): string {
  const resolved = resolve(p);
  let finalPath = resolved;
  if (existsSync(resolved)) {
    try {
      finalPath = realpathSync(resolved);
    } catch {
      // fallback to resolved
    }
  }
  if (process.platform === "win32") {
    finalPath = finalPath.toLowerCase();
  }
  return finalPath;
}

/**
 * Kiểm tra xem target có trùng hoặc nằm TRONG thư mục parent hay không.
 */
function isInsideOrSameDirectory(parent: string, target: string): boolean {
  const normParent = normalizePathForComparison(parent);
  const normTarget = normalizePathForComparison(target);

  if (normParent === normTarget) {
    return true;
  }
  const parentWithSep = normParent.endsWith(sep) ? normParent : normParent + sep;
  return normTarget.startsWith(parentWithSep);
}

interface ExistingRowData {
  id: string;
  kind: string;
  placeId: string | null;
  text: string;
  contentHash: string;
  rating: number | null;
  workScore: number | null;
  hasWifi: boolean;
  quiet: boolean;
  hasAc: boolean;
  hasOutlets: boolean;
  laptopFriendly: boolean;
  petFriendly: boolean;
  meta: string;
  vector: number[];
}

function isNumberClose(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  return Math.abs(a - b) < 1e-4;
}

function isMetadataEqual(chunk: KnowledgeChunk, metaStr: string, cached: ExistingRowData): boolean {
  if (chunk.kind !== cached.kind) return false;
  if ((chunk.placeId ?? null) !== (cached.placeId ?? null)) return false;
  if (chunk.text !== cached.text) return false;
  if (!isNumberClose(chunk.rating, cached.rating)) return false;
  if (!isNumberClose(chunk.workScore, cached.workScore)) return false;
  if (Boolean(chunk.hasWifi) !== cached.hasWifi) return false;
  if (Boolean(chunk.quiet) !== cached.quiet) return false;
  if (Boolean(chunk.hasAc) !== cached.hasAc) return false;
  if (Boolean(chunk.hasOutlets) !== cached.hasOutlets) return false;
  if (Boolean(chunk.laptopFriendly) !== cached.laptopFriendly) return false;
  if (Boolean(chunk.petFriendly) !== cached.petFriendly) return false;
  if (metaStr !== cached.meta) return false;
  return true;
}

async function main(): Promise<void> {
  const startTime = Date.now();
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const defaultOutDir = resolve(__dirname, "..", LANCEDB_RELATIVE_DIR);
  if (options.fakeEmbed && isInsideOrSameDirectory(defaultOutDir, options.outDir)) {
    console.error(
      "❌ Lỗi an toàn: Cờ --fake-embed chỉ được phép sử dụng khi --out trỏ tới một thư mục tạm bên ngoài thư mục chỉ mục thật (web/data/lancedb).",
    );
    process.exit(1);
  }

  console.log("================================================================================");
  console.log("            BẮT ĐẦU XÂY DỰNG CHỈ MỤC TRI THỨC RAG (LANCEDB INDEX)               ");
  console.log("================================================================================");
  console.log(`- Chế độ: ${options.dryRun ? "DRY-RUN (chỉ kiểm tra chunks, không ghi index)" : "BUILD INDEX"}`);
  console.log(`- Thư mục đích: ${options.outDir}`);
  if (options.onlyKind) console.log(`- Bộ lọc loại: ${options.onlyKind}`);
  if (options.fresh) console.log("- Chế độ fresh: Bỏ qua cache vector, embed lại toàn bộ");
  if (options.fakeEmbed) console.log("- Chế độ test: Sử dụng fake embedder xác định");

  // 1. Kiểm tra API Key nếu không phải dry-run và không dùng fake-embed
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!options.dryRun && !options.fakeEmbed && (!apiKey || apiKey.length === 0)) {
    console.error(
      "❌ Lỗi cấu hình: Thiếu biến môi trường GEMINI_API_KEY. Vui lòng thiết lập GEMINI_API_KEY trong file .env.local hoặc chạy ở chế độ --dry-run.",
    );
    process.exit(1);
  }

  // 2. Kết nối CSDL PostgreSQL read-only
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    console.error(
      "❌ Lỗi cấu hình: Không tìm thấy URL kết nối CSDL (DATABASE_URL / SUPABASE_DB_URL / POSTGRES_URL) trong môi trường hoặc file .env.local.",
    );
    process.exit(1);
  }

  const sql = postgres(dbUrl, {
    prepare: false,
    ssl: "require",
    max: 2,
    idle_timeout: 10,
    connect_timeout: 10,
    onnotice: () => {},
  });

  let cafes: DirectoryRow[] = [];
  let menuSourceRows: MenuSourceRow[] = [];
  let menuPermissionIssue: string | null = null;
  let canReadMenu = true;

  try {
    console.log("\n[1/5] Kiểm tra cấu trúc CSDL qua information_schema...");
    const existingTables = await sql<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('v_cafe_directory', 'menu_item', 'canonical_item', 'item_price')
    `;
    const tableNames = new Set(existingTables.map((t) => t.table_name));

    if (!tableNames.has("v_cafe_directory")) {
      throw new Error("Không tìm thấy view công khai 'v_cafe_directory' trong CSDL.");
    }

    console.log("[2/5] Đang truy vấn danh bạ quán từ v_cafe_directory...");
    cafes = (await sql<DirectoryRow[]>`
      SELECT 
        place_id,
        name,
        description,
        categories,
        review_keywords,
        featured_reviews,
        rating,
        work_score,
        has_wifi,
        laptop_friendly,
        outdoor_seating,
        quiet,
        cozy,
        pet_friendly,
        has_parking,
        accepts_card,
        has_ac,
        has_outlets,
        accepts_nfc,
        cash_only,
        accepts_reservations,
        vegan_options,
        vegetarian_options,
        rooftop,
        live_music,
        good_for_kids,
        address,
        short_address,
        main_category,
        price_range
      FROM v_cafe_directory
      ORDER BY name ASC
    `) as DirectoryRow[];
    console.log(`  ✓ Đã lấy thông tin của ${cafes.length} quán cà phê.`);

    // Kiểm tra quyền đọc menu_item và canonical_item
    console.log("[3/5] Đang kiểm tra quyền đọc dữ liệu thực đơn (menu_item / canonical_item)...");
    try {
      await sql`SELECT name_raw FROM menu_item LIMIT 1`;
      await sql`SELECT canonical_id FROM canonical_item LIMIT 1`;
    } catch (permErr) {
      canReadMenu = false;
      menuPermissionIssue = permErr instanceof Error ? permErr.message : String(permErr);
      console.warn(`  ⚠️ Vai trò hiện tại không đủ quyền đọc menu_item hoặc canonical_item: ${menuPermissionIssue}`);
      console.warn("  ⚠️ Dừng xử lý dữ liệu thực đơn theo quy định an toàn (không tự nâng quyền).");
    }

    if (canReadMenu) {
      console.log("  ✓ Đủ quyền SELECT thực đơn. Đang lấy dữ liệu món ăn và khoảng giá...");
      const rawMenuItems = await sql<
        {
          place_id: string;
          name_raw: string;
          canonical_id: string | null;
          canonical_label: string | null;
          price_min: number | null;
          price_max: number | null;
          needs_review: number | null;
          review_reasons: string | null;
          reviewed_by_human: number | null;
        }[]
      >`
        SELECT 
          m.place_id,
          m.name_raw,
          COALESCE(m.reviewed_canonical_id, m.canonical_id) AS canonical_id,
          c.display_name AS canonical_label,
          MIN(p.amount)::float8 AS price_min,
          MAX(p.amount)::float8 AS price_max,
          m.needs_review,
          m.review_reasons,
          m.reviewed_by_human
        FROM menu_item m
        LEFT JOIN canonical_item c ON c.canonical_id = COALESCE(m.reviewed_canonical_id, m.canonical_id)
        LEFT JOIN item_price p ON p.item_id = m.item_id AND p.currency = 'VND'
        GROUP BY 
          m.item_id, m.place_id, m.name_raw, 
          COALESCE(m.reviewed_canonical_id, m.canonical_id), c.display_name,
          m.needs_review, m.review_reasons, m.reviewed_by_human
        ORDER BY m.place_id, m.name_raw
      `;

      menuSourceRows = rawMenuItems.map((row) => {
        const canonicalId = row.canonical_id ?? null;
        const isCoffee = canonicalId ? COFFEE_CANONICAL_IDS.has(canonicalId) : false;
        const priceMin = typeof row.price_min === "number" ? row.price_min : null;
        const priceMax = typeof row.price_max === "number" ? row.price_max : null;
        const reasons = typeof row.review_reasons === "string" ? row.review_reasons : "";
        const isHumanReviewed = row.reviewed_by_human === 1;

        // Logic xác định giá bất thường (is_suspicious) theo issue #16:
        // - Lỗi OCR, giá ngoại lai hoặc đơn vị USD
        // - Món cà phê mà giá < 18.000đ (dưới sàn khu An Thượng)
        // - Món đồ uống chung mà giá < 12.000đ hoặc <= 0
        const isSuspicious =
          (!isHumanReviewed &&
            (reasons.includes("price_outlier") || reasons.includes("ocr_low") || reasons.includes("usd"))) ||
          (isCoffee && priceMin !== null && priceMin < 18000) ||
          (priceMin !== null && priceMin < 12000) ||
          (priceMin !== null && priceMin <= 0);

        return {
          place_id: row.place_id,
          name_raw: row.name_raw,
          canonical_id: canonicalId,
          canonical_label: row.canonical_label ?? null,
          price_min: priceMin,
          price_max: priceMax,
          is_suspicious: isSuspicious,
        };
      });
      console.log(`  ✓ Đã lấy được ${menuSourceRows.length} mục thực đơn từ CSDL.`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  // 3. Đọc file market-insights.md
  console.log("\n[4/5] Đang phân rã dữ liệu thành KnowledgeChunks...");
  const insightsPath = resolve(__dirname, "../src/features/analytics/data/market-insights.md");
  let insightsMarkdown = "";
  if (existsSync(insightsPath)) {
    insightsMarkdown = readFileSync(insightsPath, "utf-8");
  } else {
    console.warn(`  ⚠️ Cảnh báo: Không tìm thấy file market-insights.md tại: ${insightsPath}`);
  }

  // Gọi 4 hàm build chunks
  const reviewChunks = buildReviewChunks(cafes);
  const profileChunks = buildProfileChunks(cafes);
  const menuChunks = buildMenuChunks(cafes, menuSourceRows);
  const insightChunks = buildInsightChunks(insightsMarkdown);

  let allCandidateChunks: KnowledgeChunk[] = [];
  if (!options.onlyKind) {
    allCandidateChunks = [...reviewChunks, ...profileChunks, ...menuChunks, ...insightChunks];
  } else if (options.onlyKind === "review") {
    allCandidateChunks = reviewChunks;
  } else if (options.onlyKind === "profile") {
    allCandidateChunks = profileChunks;
  } else if (options.onlyKind === "menu") {
    allCandidateChunks = menuChunks;
  } else if (options.onlyKind === "insight") {
    allCandidateChunks = insightChunks;
  }

  // Kiểm tra tính duy nhất của ID (nếu trùng: cảnh báo + bỏ qua bản sau)
  const uniqueChunks: KnowledgeChunk[] = [];
  const seenIds = new Set<string>();
  let duplicateWarningCount = 0;

  for (const chunk of allCandidateChunks) {
    if (seenIds.has(chunk.id)) {
      duplicateWarningCount++;
      console.warn(
        `  ⚠️ Cảnh báo: Trùng id chunk "${chunk.id}" (loại=${chunk.kind}, placeId=${chunk.placeId ?? "null"}). Bỏ qua bản ghi trùng.`,
      );
      continue;
    }
    seenIds.add(chunk.id);
    uniqueChunks.push(chunk);
  }

  // Thống kê số chunk theo loại
  const countsByKind: Record<KnowledgeKind, number> = {
    review: 0,
    profile: 0,
    menu: 0,
    insight: 0,
  };
  for (const c of uniqueChunks) {
    countsByKind[c.kind]++;
  }

  console.log(`  ✓ Phân rã hoàn tất: Tổng số ${uniqueChunks.length} chunk duy nhất.`);
  console.log(`    - review:  ${countsByKind.review} chunks`);
  console.log(`    - profile: ${countsByKind.profile} chunks`);
  console.log(`    - menu:    ${countsByKind.menu} chunks`);
  console.log(`    - insight: ${countsByKind.insight} chunks`);
  if (duplicateWarningCount > 0) {
    console.log(`    - Đã phát hiện và lọc bỏ: ${duplicateWarningCount} bản ghi trùng id.`);
  }

  // Xác định các loại dữ liệu có nguồn hợp lệ để tránh xóa nhầm khi nguồn lỗi
  const validKinds = new Set<KnowledgeKind>();
  if (cafes.length > 0) {
    validKinds.add("review");
    validKinds.add("profile");
  }
  if (canReadMenu && menuSourceRows.length > 0) {
    validKinds.add("menu");
  }
  if (insightsMarkdown.trim().length > 0 && insightChunks.length > 0) {
    validKinds.add("insight");
  }

  const hasCriticalSourceError =
    (cafes.length === 0 &&
      (!options.onlyKind ||
        options.onlyKind === "review" ||
        options.onlyKind === "profile" ||
        options.onlyKind === "menu")) ||
    ((!canReadMenu || menuSourceRows.length === 0) && (!options.onlyKind || options.onlyKind === "menu"));

  // Kiểm tra cảnh báo lệch ước tính chuẩn
  const warnings: string[] = [];
  if (!options.onlyKind || options.onlyKind === "review") {
    if (countsByKind.review > 575) {
      warnings.push(`Số lượng chunk review (${countsByKind.review}) vượt ngưỡng ước tính ~575.`);
    }
  }
  if (!options.onlyKind || options.onlyKind === "profile") {
    if (countsByKind.profile !== 115) {
      warnings.push(`Số lượng chunk profile (${countsByKind.profile}) lệch khỏi ước tính 115 quán.`);
    }
  }
  if (!options.onlyKind || options.onlyKind === "menu") {
    if (countsByKind.menu > 115) {
      warnings.push(`Số lượng chunk menu (${countsByKind.menu}) vượt ngưỡng ước tính 115 quán.`);
    }
  }
  if (!options.onlyKind || options.onlyKind === "insight") {
    if (countsByKind.insight < 10 || countsByKind.insight > 40) {
      warnings.push(`Số lượng chunk insight (${countsByKind.insight}) nằm ngoài khoảng ước tính [10, 40].`);
    }
  }

  // Nếu là chế độ --dry-run: In báo cáo và kết thúc ngay
  if (options.dryRun) {
    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n================================================================================");
    console.log("                        BÁO CÁO KẾT THÚC (DRY-RUN)                              ");
    console.log("================================================================================");
    console.log(`- Trạng thái: HOÀN TẤT KIỂM THỬ DRY-RUN (Không gọi API Gemini, không ghi LanceDB)`);
    console.log(`- Tổng số chunks: ${uniqueChunks.length}`);
    console.log(`  • review:  ${countsByKind.review}`);
    console.log(`  • profile: ${countsByKind.profile}`);
    console.log(`  • menu:    ${countsByKind.menu}`);
    console.log(`  • insight: ${countsByKind.insight}`);
    console.log(`- Quyền CSDL: ${menuPermissionIssue ? `Hạn chế (${menuPermissionIssue})` : "Đầy đủ"}`);
    if (warnings.length > 0) {
      console.log("- Cảnh báo lệch ước lượng:");
      for (const w of warnings) console.log(`  ⚠️  ${w}`);
    } else {
      console.log("- Các chỉ số chunks hoàn toàn khớp với khoảng ước lượng chuẩn.");
    }
    console.log(`- Thời gian thực thi: ${elapsedSec}s`);
    if (hasCriticalSourceError) {
      console.error("\n❌ Lỗi: Không thể đọc nguồn dữ liệu bắt buộc (menu hoặc cafes) trong chế độ dry-run.");
      process.exit(1);
    }
    return;
  }

  // 4. Mở / Tạo bảng LanceDB & Thiết lập cơ chế Idempotent + Resume
  console.log(`\n[5/5] Đang kết nối kho vector LanceDB tại "${options.outDir}"...`);
  if (!existsSync(options.outDir)) {
    mkdirSync(options.outDir, { recursive: true });
  }
  const db = await lancedb.connect(options.outDir);
  let table: lancedb.Table | undefined;
  let tableExists = false;
  try {
    const existingTableNames = await db.tableNames();
    if (existingTableNames.includes(KNOWLEDGE_TABLE)) {
      if (options.fresh) {
        console.log(`  • Cờ --fresh được bật: Xóa bảng "${KNOWLEDGE_TABLE}" hiện tại để tạo mới hoàn toàn...`);
        await db.dropTable(KNOWLEDGE_TABLE);
      } else {
        table = await db.openTable(KNOWLEDGE_TABLE);
        tableExists = true;
        console.log(`  • Đang mở bảng LanceDB "${KNOWLEDGE_TABLE}" hiện có...`);
      }
    }
  } catch {
    tableExists = false;
  }

  if (!tableExists || !table) {
    console.log(`  • Đang tạo mới bảng LanceDB "${KNOWLEDGE_TABLE}" với schema tường minh...`);
    table = await db.createEmptyTable(KNOWLEDGE_TABLE, KNOWLEDGE_SCHEMA);
  }

  // Đọc các dòng hiện có để lập bản đồ cache và kiểm tra thay đổi non-vector fields
  const existingMap = new Map<string, ExistingRowData>();
  if (tableExists && !options.fresh) {
    console.log("  • Đang nạp bản đồ vector và metadata hiện có để kiểm tra resume/idempotence...");
    const existingRows = (await table
      .query()
      .select([
        "id",
        "kind",
        "placeId",
        "text",
        "contentHash",
        "rating",
        "workScore",
        "hasWifi",
        "quiet",
        "hasAc",
        "hasOutlets",
        "laptopFriendly",
        "petFriendly",
        "meta",
        "vector",
      ])
      .toArray()) as Array<{
      id: string;
      kind: string;
      placeId: string | null;
      text: string;
      contentHash: string;
      rating: number | null;
      workScore: number | null;
      hasWifi: boolean;
      quiet: boolean;
      hasAc: boolean;
      hasOutlets: boolean;
      laptopFriendly: boolean;
      petFriendly: boolean;
      meta: string;
      vector: Iterable<number>;
    }>;

    for (const r of existingRows) {
      if (r.id && r.contentHash && r.vector) {
        const vec = Array.from(r.vector);
        if (vec.length === EMBEDDING_DIMENSIONS) {
          existingMap.set(r.id, {
            id: r.id,
            kind: r.kind,
            placeId: r.placeId ?? null,
            text: r.text,
            contentHash: r.contentHash,
            rating: typeof r.rating === "number" ? r.rating : null,
            workScore: typeof r.workScore === "number" ? r.workScore : null,
            hasWifi: Boolean(r.hasWifi),
            quiet: Boolean(r.quiet),
            hasAc: Boolean(r.hasAc),
            hasOutlets: Boolean(r.hasOutlets),
            laptopFriendly: Boolean(r.laptopFriendly),
            petFriendly: Boolean(r.petFriendly),
            meta: typeof r.meta === "string" ? r.meta : "",
            vector: vec,
          });
        }
      }
    }
    console.log(`  ✓ Đã nạp ${existingMap.size} bản ghi từ cơ sở dữ liệu LanceDB.`);
  }

  // Phân loại: chunk nào tái dùng hoàn toàn, chunk nào chỉ đổi metadata, chunk nào cần embed mới
  const chunksToEmbed: KnowledgeChunk[] = [];
  const pureReusedChunks: KnowledgeChunk[] = [];
  const rowsToUpdateMetadata: KnowledgeRow[] = [];

  for (const chunk of uniqueChunks) {
    const cached = existingMap.get(chunk.id);
    if (cached && cached.contentHash === chunk.contentHash && cached.vector.length === EMBEDDING_DIMENSIONS) {
      const metaStr = JSON.stringify(chunk.meta);
      if (isMetadataEqual(chunk, metaStr, cached)) {
        pureReusedChunks.push(chunk);
      } else {
        rowsToUpdateMetadata.push({
          ...chunk,
          meta: metaStr,
          vector: cached.vector,
        });
      }
    } else {
      chunksToEmbed.push(chunk);
    }
  }

  console.log(`\n- Tiến độ xử lý vector & metadata:`);
  console.log(`  • Số lượng vector TÁI DÙNG hoàn toàn (giữ nguyên): ${pureReusedChunks.length}`);
  console.log(`  • Số lượng dòng METADATA CẬP NHẬT (dùng vector cũ, không gọi API): ${rowsToUpdateMetadata.length}`);
  console.log(`  • Số lượng vector CẦN EMBED MỚI / THAY ĐỔI: ${chunksToEmbed.length}`);

  // Cập nhật metadata cho các chunk tái dùng vector nhưng khác thông tin non-vector
  let metadataUpdatedCount = 0;
  if (rowsToUpdateMetadata.length > 0) {
    console.log(
      `\nĐang tiến hành cập nhật metadata cho ${rowsToUpdateMetadata.length} chunks (tái dùng vector cũ, không gọi API)...`,
    );
    const UPDATE_BATCH_SIZE = 50;
    for (let i = 0; i < rowsToUpdateMetadata.length; i += UPDATE_BATCH_SIZE) {
      const batch = rowsToUpdateMetadata.slice(i, i + UPDATE_BATCH_SIZE);
      await table
        .mergeInsert("id")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute(batch as unknown as Record<string, unknown>[]);
    }
    metadataUpdatedCount = rowsToUpdateMetadata.length;
    console.log(`  ✓ Đã cập nhật thành công metadata cho ${metadataUpdatedCount} chunks.`);
  }

  // Khởi tạo embedder
  const embedder = options.fakeEmbed
    ? {
        async embedDocuments(texts: string[]): Promise<number[][]> {
          return texts.map((t) => createFakeVector(sha1(t), EMBEDDING_DIMENSIONS));
        },
      }
    : createEmbedder({
        apiKey: apiKey as string,
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      });

  // Embed theo từng batch nhỏ và GHI NGAY LẬP TỨC vào LanceDB (mergeInsert)
  let newlyEmbeddedCount = 0;
  if (chunksToEmbed.length > 0) {
    console.log(
      `\nĐang tiến hành embed ${chunksToEmbed.length} chunks theo batch (${DEFAULT_BATCH_SIZE} texts/batch)...`,
    );
    let windowStartTime = Date.now();
    let requestsInWindow = 0;
    let tokensInWindow = 0;

    for (let i = 0; i < chunksToEmbed.length; i += DEFAULT_BATCH_SIZE) {
      const batchChunks = chunksToEmbed.slice(i, i + DEFAULT_BATCH_SIZE);
      const batchTexts = batchChunks.map((c) => c.text);

      // Ước tính số token trong batch
      const estimatedTokens = batchTexts.reduce((acc, t) => acc + Math.ceil(t.length / CHARS_PER_TOKEN), 0);

      // Kiểm soát tốc độ (Pacing cho free tier ~100 RPM, ~30k TPM khi gọi API thật)
      if (!options.fakeEmbed) {
        const now = Date.now();
        const elapsedWindow = now - windowStartTime;
        if (elapsedWindow < 60000) {
          if (
            requestsInWindow + 1 > MAX_REQUESTS_PER_MINUTE ||
            tokensInWindow + estimatedTokens > MAX_TOKENS_PER_MINUTE
          ) {
            const sleepMs = 60000 - elapsedWindow + 500;
            console.log(`  ⏳ Đạt ngưỡng tốc độ Gemini Free Tier. Tạm dừng ${Math.round(sleepMs / 1000)}s...`);
            await new Promise((res) => setTimeout(res, sleepMs));
            windowStartTime = Date.now();
            requestsInWindow = 0;
            tokensInWindow = 0;
          }
        } else {
          windowStartTime = Date.now();
          requestsInWindow = 0;
          tokensInWindow = 0;
        }
      }

      // Gọi embed API
      let vectors: number[][];
      try {
        vectors = await embedder.embedDocuments(batchTexts);
      } catch (embedErr) {
        const errMsg = embedErr instanceof Error ? embedErr.message : String(embedErr);
        console.error(`\n❌ Gặp lỗi trong quá trình tạo embedding: ${errMsg}`);
        if (/billing|quota.*0/i.test(errMsg)) {
          console.error(
            "👉 Gợi ý: Tài khoản của bạn có hạn mức quota = 0. Hãy kiểm tra billing tại Google AI Studio hoặc đổi sang API key có hạn mức.",
          );
        }
        console.error(
          `⚠️ Tiến độ đã hoàn thành (${pureReusedChunks.length + metadataUpdatedCount + newlyEmbeddedCount} chunks) ĐÃ ĐƯỢC LƯU an toàn trong LanceDB. Lần chạy tiếp theo sẽ tiếp tục resume từ đây.`,
        );
        process.exit(1);
      }

      if (vectors.length !== batchChunks.length) {
        throw new Error(
          `Số lượng vector trả về (${vectors.length}) không khớp với số lượng chunk trong batch (${batchChunks.length})`,
        );
      }

      // Kiểm tra và dựng các hàng để ghi
      const rowsToWrite: KnowledgeRow[] = [];
      for (let j = 0; j < batchChunks.length; j++) {
        const chunk = batchChunks[j];
        const vec = vectors[j];
        validateVector(vec, chunk.id);

        rowsToWrite.push({
          ...chunk,
          meta: JSON.stringify(chunk.meta),
          vector: vec,
        });
      }

      // Ghi NGAY LẬP TỨC vào LanceDB bằng mergeInsert
      await table
        .mergeInsert("id")
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute(rowsToWrite as unknown as Record<string, unknown>[]);

      newlyEmbeddedCount += rowsToWrite.length;
      requestsInWindow++;
      tokensInWindow += estimatedTokens;

      const progressPercent = Math.round(((i + batchChunks.length) / chunksToEmbed.length) * 100);
      console.log(
        `  [${progressPercent}%] Đã embed và lưu thành công ${newlyEmbeddedCount}/${chunksToEmbed.length} chunks mới vào LanceDB.`,
      );
    }
  }

  // 5. Xoá các id cũ không còn tồn tại trong nguồn dữ liệu
  console.log("\nĐang kiểm tra và dọn dẹp các chunk không còn tồn tại...");
  const currentChunkIdSet = new Set(uniqueChunks.map((c) => c.id));
  const currentTableRows = (await table.query().select(["id", "kind"]).toArray()) as Array<{
    id: string;
    kind: KnowledgeKind;
  }>;

  // Cảnh báo nếu kind nào nguồn bị lỗi hoặc rỗng bất thường
  for (const kind of KNOWLEDGE_KINDS) {
    if (!options.onlyKind || options.onlyKind === kind) {
      if (!validKinds.has(kind)) {
        console.warn(
          `  ⚠️ Cảnh báo: Nguồn dữ liệu cho loại "${kind}" bị lỗi hoặc rỗng bất thường. Bỏ qua bước dọn dẹp để bảo toàn toàn bộ chunks cũ của loại này.`,
        );
      }
    }
  }

  const idsToDelete: string[] = [];
  for (const row of currentTableRows) {
    if (!currentChunkIdSet.has(row.id)) {
      if (!options.onlyKind || row.kind === options.onlyKind) {
        if (validKinds.has(row.kind)) {
          idsToDelete.push(row.id);
        }
      }
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`  • Phát hiện ${idsToDelete.length} chunks cũ cần xóa...`);
    const DELETE_BATCH_SIZE = 50;
    for (let i = 0; i < idsToDelete.length; i += DELETE_BATCH_SIZE) {
      const slice = idsToDelete.slice(i, i + DELETE_BATCH_SIZE);
      const sqlIn = slice.map((id) => `'${id.replace(/'/g, "''")}'`).join(", ");
      await table.delete(`id IN (${sqlIn})`);
    }
    console.log(`  ✓ Đã xóa xong ${idsToDelete.length} chunks thừa khỏi bảng LanceDB.`);
  } else {
    console.log("  ✓ Không có chunk thừa nào cần xóa.");
  }

  const finalTotalRows = await table.countRows();
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);

  // Nếu nguồn menu hoặc cafes lỗi: báo lỗi rõ và thoát mã 1 (sau khi giữ nguyên dữ liệu cũ), không báo HOÀN TẤT THÀNH CÔNG
  if (hasCriticalSourceError) {
    console.error("\n================================================================================");
    console.error("                      BÁO CÁO THẤT BẠI BUILD RAG INDEX                          ");
    console.error("================================================================================");
    console.error(
      "❌ Lỗi: Không thể đọc đầy đủ nguồn dữ liệu bắt buộc (menu hoặc cafes). Bỏ qua dọn dẹp và giữ nguyên dữ liệu chỉ mục cũ.",
    );
    if (!canReadMenu) {
      console.error(
        `  • Chi tiết lỗi menu: ${menuPermissionIssue ?? "Không có quyền SELECT menu_item/canonical_item"}`,
      );
    } else if (menuSourceRows.length === 0) {
      console.error("  • Chi tiết lỗi menu: Nguồn thực đơn trả về 0 dòng.");
    }
    if (cafes.length === 0) {
      console.error("  • Chi tiết lỗi cafes: Bảng danh bạ v_cafe_directory trả về 0 dòng.");
    }
    console.error(`- Tổng thời gian thực hiện: ${elapsedSec}s`);
    console.error("================================================================================");
    process.exit(1);
  }

  // 6. In báo cáo tổng kết
  console.log("\n================================================================================");
  console.log("                      BÁO CÁO KẾT THÚC BUILD RAG INDEX                          ");
  console.log("================================================================================");
  console.log(`- Trạng thái: HOÀN TẤT THÀNH CÔNG`);
  console.log(`- Thư mục chỉ mục (Output): ${options.outDir}`);
  console.log(`- Tổng số bản ghi cuối cùng trong bảng "${KNOWLEDGE_TABLE}": ${finalTotalRows}`);
  console.log(`- Số chunk theo từng loại (kind):`);
  console.log(`  • review:  ${countsByKind.review}`);
  console.log(`  • profile: ${countsByKind.profile}`);
  console.log(`  • menu:    ${countsByKind.menu}`);
  console.log(`  • insight: ${countsByKind.insight}`);
  console.log(`- Thống kê thay đổi vector & metadata:`);
  console.log(`  • Tái dùng hoàn toàn (Reused - không tốn quota): ${pureReusedChunks.length}`);
  console.log(`  • Metadata cập nhật (Updated metadata):          ${metadataUpdatedCount}`);
  console.log(`  • Embed mới (New embeds):                        ${newlyEmbeddedCount}`);
  console.log(`  • Đã xóa (Deleted obsolete):                     ${idsToDelete.length}`);
  console.log(`- Quyền CSDL: ${menuPermissionIssue ? `Hạn chế (${menuPermissionIssue})` : "Đầy đủ"}`);
  if (warnings.length > 0) {
    console.log(`- Cảnh báo lệch ước lượng:`);
    for (const w of warnings) console.log(`  ⚠️  ${w}`);
  } else {
    console.log(`- Số lượng chunk hoàn toàn nằm trong các khoảng ước lượng kỳ vọng.`);
  }
  console.log(`- Tổng thời gian thực hiện: ${elapsedSec}s`);
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("❌ Lỗi nghiêm trọng:", err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
