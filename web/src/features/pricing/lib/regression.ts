/**
 * Mô-đun thuần (pure) cho mô hình hồi quy giá đồ uống.
 *
 * Không import gì, không phụ thuộc `server-only` → dùng được ở cả server lẫn client.
 * Mô hình: OLS với hệ số chặn + 3 biến (khoảng cách ra biển, thanh toán thẻ, quán làm việc).
 */

/** Tọa độ tim đường Võ Nguyên Giáp theo OSM (Nam -> Bắc) làm trục biển thực tế. */
export const BEACH_AXIS: readonly (readonly [number, number])[] = [
  [16.0346, 108.25195],
  [16.0376, 108.2505],
  [16.04, 108.2493],
  [16.0427, 108.2483],
  [16.0451, 108.2487],
  [16.0473, 108.24935],
  [16.0499, 108.2489],
  [16.0528, 108.24805],
  [16.0553, 108.2474],
  [16.0571, 108.2469],
  [16.0599, 108.2465],
  [16.0628, 108.24605],
  [16.0639, 108.2458],
] as const;

/** Vĩ độ tham chiếu của khu An Thượng, dùng để quy đổi độ sang mét. */
export const REF_LAT_DEG = 16.05;

/** Số mét xấp xỉ cho 1 độ vĩ độ (equirectangular). */
export const METERS_PER_DEG = 111000;

/** Số dòng tối thiểu để fit mô hình (tránh overfit với mẫu quá nhỏ). */
export const MIN_TRAINING_ROWS = 15;

/** Sàn giá 15 nghìn VND — gợi ý không bao giờ thấp hơn mức này. */
export const PRICE_FLOOR_K = 15;

/** Hệ số co giãn kinh độ → mét tại vĩ độ tham chiếu. */
const LNG_SCALE = METERS_PER_DEG * Math.cos((REF_LAT_DEG * Math.PI) / 180);

/** Số biến của mô hình (chặn + 3 biến). */
const FEATURE_COUNT = 4;

/** Ngưỡng coi pivot là suy biến. */
const SINGULAR_EPS = 1e-9;

export interface NearestBeachPoint {
  lat: number;
  lng: number;
  distM: number;
  signedDistM: number;
}

/**
 * Tìm điểm gần nhất trên polyline trục biển Võ Nguyên Giáp.
 * Chiếu điểm lên từng đoạn thẳng (clamped [0, 1]) trong hệ mét phẳng cục bộ:
 * x = lng · 111000 · cos(16.05°), y = lat · 111000.
 * `signedDistM` mang dấu dương khi điểm ở phía đất liền (Tây trục biển)
 * và mang dấu âm khi điểm ở phía biển (Đông trục biển).
 */
export function nearestBeachPoint(lat: number, lng: number): NearestBeachPoint {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { lat: BEACH_AXIS[0][0], lng: BEACH_AXIS[0][1], distM: 0, signedDistM: 0 };
  }

  const px = lng * LNG_SCALE;
  const py = lat * METERS_PER_DEG;

  let bestDistSq = Infinity;
  let bestLat = BEACH_AXIS[0][0];
  let bestLng = BEACH_AXIS[0][1];
  let bestSignedDistM = 0;

  for (let i = 0; i < BEACH_AXIS.length - 1; i++) {
    const [aLat, aLng] = BEACH_AXIS[i];
    const [bLat, bLng] = BEACH_AXIS[i + 1];

    const ax = aLng * LNG_SCALE;
    const ay = aLat * METERS_PER_DEG;
    const bx = bLng * LNG_SCALE;
    const by = bLat * METERS_PER_DEG;

    const abx = bx - ax;
    const aby = by - ay;
    const segLenSq = abx * abx + aby * aby;

    let t = 0;
    if (segLenSq > 0) {
      t = ((px - ax) * abx + (py - ay) * aby) / segLenSq;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
    }

    const qx = ax + t * abx;
    const qy = ay + t * aby;
    const qLat = aLat + t * (bLat - aLat);
    const qLng = aLng + t * (bLng - aLng);

    const dx = px - qx;
    const dy = py - qy;
    const distSq = dx * dx + dy * dy;

    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestLat = qLat;
      bestLng = qLng;

      const dist = Math.sqrt(distSq);
      // Tích có hướng 2D: (B - A) × (P - A).
      // Polyline đi từ Nam -> Bắc nên aby = (by - ay) > 0.
      // Điểm phía Tây (đất liền) nằm bên trái chiều đi: cross >= 0.
      // Điểm phía Đông (biển) nằm bên phải chiều đi: cross < 0.
      const cross = abx * (py - ay) - aby * (px - ax);
      bestSignedDistM = cross >= 0 ? dist : -dist;
    }
  }

  const distM = Math.sqrt(bestDistSq);
  if (Math.abs(bestSignedDistM) < 1e-9) {
    bestSignedDistM = 0;
  }

  return {
    lat: bestLat,
    lng: bestLng,
    distM,
    signedDistM: bestSignedDistM,
  };
}

/**
 * Khoảng cách có dấu ra trục biển Võ Nguyên Giáp (mét).
 * Nhận (lat, lng), trả về signedDistM (dương: phía đất liền, âm: phía biển).
 */
export function distToBeachFrontM(lat: number, lng: number): number {
  return nearestBeachPoint(lat, lng).signedDistM;
}

/** Khoảng cách phẳng (equirectangular) giữa 2 điểm, mét: dLat*111000 và dLng*111000*cos(16.05°). */
export function distanceM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = (bLat - aLat) * METERS_PER_DEG;
  const dLng = (bLng - aLng) * LNG_SCALE;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export type ReliabilityLevel = "high" | "medium" | "low";

export interface ReliabilityInfo {
  level: ReliabilityLevel;
  label: string;
  shortLabel: "Tin cậy khá" | "Tham khảo" | "Độ tin cậy thấp";
  tooltip: string;
}

/**
 * Đánh giá độ tin cậy của mô hình OLS theo LOO R²:
 * - >= 0.25: "Tin cậy khá"
 * - 0.1 - 0.25: "Tham khảo"
 * - < 0.1: "Độ tin cậy thấp"
 */
export function getReliability(looR2: number | null | undefined): ReliabilityInfo {
  const r2 = typeof looR2 === "number" && Number.isFinite(looR2) ? looR2 : -Infinity;
  if (r2 >= 0.25) {
    return {
      level: "high",
      shortLabel: "Tin cậy khá",
      label: "Tin cậy khá",
      tooltip: `R² LOO = ${(r2 * 100).toFixed(1)}%. Biến giải thích tốt sự biến thiên giá.`,
    };
  }
  if (r2 >= 0.1) {
    return {
      level: "medium",
      shortLabel: "Tham khảo",
      label: "Tham khảo",
      tooltip: `R² LOO = ${(r2 * 100).toFixed(1)}%. Mức độ giải thích vừa phải.`,
    };
  }
  return {
    level: "low",
    shortLabel: "Độ tin cậy thấp",
    label: "Độ tin cậy thấp — gần như chỉ phản ánh mặt bằng giá chung",
    tooltip: `R² LOO = ${(Math.max(0, r2) * 100).toFixed(1)}%. Mẫu có phương sai nhỏ hoặc giá độc lập với vị trí/tiện ích.`,
  };
}

/** Một dòng huấn luyện: giá tính theo nghìn VND. */
export interface TrainingRow {
  distToBeachM: number;
  hasCardPayment: boolean;
  hasWork: boolean;
  priceK: number;
}

/** Hệ số hồi quy: `priceK = intercept + distToBeachM*dist + hasCardPayment*card + hasWork*work`. */
export interface ModelCoef {
  intercept: number;
  distToBeachM: number;
  hasCardPayment: number;
  hasWork: number;
}

/** Kết quả fit kèm các chỉ số đánh giá in-sample và leave-one-out. */
export interface FittedModel {
  n: number;
  coef: ModelCoef;
  /** R² in-sample. */
  r2: number;
  /** R² leave-one-out = 1 - SSE_loo / Σ(y_i - trung bình các y còn lại)². */
  looR2: number;
  /** RMSE leave-one-out (nghìn VND). */
  looRmseK: number;
  /** MAE leave-one-out (nghìn VND). */
  looMaeK: number;
  meanPriceK: number;
}

/** Đầu vào cần gợi ý giá cho một mặt bằng mới. */
export interface PricingInput {
  distToBeachM: number;
  hasCardPayment: boolean;
  hasWork: boolean;
}

/** Phân rã đóng góp của từng biến vào giá dự đoán (nghìn VND). */
export interface PriceContribution {
  key: "intercept" | "distToBeachM" | "hasCardPayment" | "hasWork";
  valueK: number;
}

/** Kết quả gợi ý giá: giá khuyến nghị và khoảng giá ± LOO RMSE. */
export interface PriceSuggestion {
  /** Dự đoán chưa làm tròn (nghìn VND). */
  rawK: number;
  /** VND, làm tròn 1.000đ. */
  recommended: number;
  /** VND: cận dưới, không thấp hơn sàn giá. */
  lower: number;
  /** VND: cận trên. */
  upper: number;
  /** 4 phần tử theo thứ tự key ở trên, tổng = rawK. */
  contributions: PriceContribution[];
}

/** Vector đặc trưng [1, dist, card, work] của một dòng. */
function toFeatures(row: TrainingRow): number[] {
  return [1, row.distToBeachM, row.hasCardPayment ? 1 : 0, row.hasWork ? 1 : 0];
}

/**
 * Giải hệ phương trình tuyến tính bằng khử Gauss + chọn pivot lớn nhất.
 * Trả `null` nếu ma trận suy biến (|pivot| < 1e-9).
 */
function solveLinearSystem(matrix: number[][], rhs: number[]): number[] | null {
  const size = rhs.length;
  // Ma trận bổ sung [A | b]
  const a: number[][] = matrix.map((row, i) => [...row, rhs[i]]);

  for (let col = 0; col < size; col++) {
    // Chọn dòng có pivot lớn nhất để giảm sai số
    let pivotRow = col;
    for (let r = col + 1; r < size; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivotRow][col])) {
        pivotRow = r;
      }
    }
    if (Math.abs(a[pivotRow][col]) < SINGULAR_EPS) {
      return null;
    }
    if (pivotRow !== col) {
      const tmp = a[pivotRow];
      a[pivotRow] = a[col];
      a[col] = tmp;
    }

    const pivot = a[col][col];
    for (let r = col + 1; r < size; r++) {
      const factor = a[r][col] / pivot;
      if (factor === 0) {
        continue;
      }
      for (let c = col; c <= size; c++) {
        a[r][c] -= factor * a[col][c];
      }
    }
  }

  // Thế ngược
  const x = new Array<number>(size).fill(0);
  for (let r = size - 1; r >= 0; r--) {
    let sum = a[r][size];
    for (let c = r + 1; c < size; c++) {
      sum -= a[r][c] * x[c];
    }
    x[r] = sum / a[r][r];
  }

  return x;
}

/**
 * Fit OLS trên một tập dòng (không kiểm tra số dòng tối thiểu).
 * Trả `null` nếu ma trận XᵀX suy biến.
 */
function fitCoefficients(rows: TrainingRow[]): ModelCoef | null {
  const xtx: number[][] = Array.from({ length: FEATURE_COUNT }, () => new Array<number>(FEATURE_COUNT).fill(0));
  const xty: number[] = new Array<number>(FEATURE_COUNT).fill(0);

  for (const row of rows) {
    const x = toFeatures(row);
    for (let i = 0; i < FEATURE_COUNT; i++) {
      xty[i] += x[i] * row.priceK;
      for (let j = 0; j < FEATURE_COUNT; j++) {
        xtx[i][j] += x[i] * x[j];
      }
    }
  }

  const beta = solveLinearSystem(xtx, xty);
  if (!beta) {
    return null;
  }

  return {
    intercept: beta[0],
    distToBeachM: beta[1],
    hasCardPayment: beta[2],
    hasWork: beta[3],
  };
}

/** Dự đoán giá (nghìn VND) từ hệ số và đặc trưng. */
function predictK(coef: ModelCoef, x: number[]): number {
  return coef.intercept + coef.distToBeachM * x[1] + coef.hasCardPayment * x[2] + coef.hasWork * x[3];
}

/** Kiểm tra dòng huấn luyện có số liệu hợp lệ (tránh NaN lan truyền). */
function isUsableRow(row: TrainingRow): boolean {
  return (
    Number.isFinite(row.distToBeachM) &&
    Number.isFinite(row.priceK) &&
    typeof row.hasCardPayment === "boolean" &&
    typeof row.hasWork === "boolean"
  );
}

/**
 * Fit OLS với hệ số chặn + 3 biến (distToBeachM, hasCardPayment 0/1, hasWork 0/1).
 * Trả `null` nếu n < MIN_TRAINING_ROWS hoặc ma trận suy biến.
 * Không bao giờ throw.
 */
export function fitOls(rows: TrainingRow[]): FittedModel | null {
  try {
    if (!Array.isArray(rows) || rows.length < MIN_TRAINING_ROWS) {
      return null;
    }
    if (!rows.every(isUsableRow)) {
      return null;
    }

    const coef = fitCoefficients(rows);
    if (!coef) {
      return null;
    }

    const n = rows.length;
    const meanPriceK = rows.reduce((sum, row) => sum + row.priceK, 0) / n;

    // R² in-sample
    let sse = 0;
    let sst = 0;
    for (const row of rows) {
      const residual = row.priceK - predictK(coef, toFeatures(row));
      sse += residual * residual;
      const deviation = row.priceK - meanPriceK;
      sst += deviation * deviation;
    }
    const r2 = sst > 0 ? 1 - sse / sst : sse > 0 ? 0 : 1;

    // Leave-one-out: refit n lần (n nhỏ nên chi phí chấp nhận được)
    let sseLoo = 0;
    let absLoo = 0;
    let looSst = 0;
    for (let i = 0; i < n; i++) {
      const others = rows.filter((_, index) => index !== i);
      const looCoef = fitCoefficients(others);
      if (!looCoef) {
        // Không thể đánh giá LOO → coi như mô hình không dùng được
        return null;
      }
      const heldOut = rows[i];
      const residual = heldOut.priceK - predictK(looCoef, toFeatures(heldOut));
      sseLoo += residual * residual;
      absLoo += Math.abs(residual);
      const meanOthers = others.reduce((sum, row) => sum + row.priceK, 0) / others.length;
      const deviation = heldOut.priceK - meanOthers;
      looSst += deviation * deviation;
    }

    return {
      n,
      coef,
      r2,
      // Mẫu quá đồng nhất (phương sai bằng 0) → quy ước 0 thay vì NaN
      looR2: looSst > 0 ? 1 - sseLoo / looSst : 0,
      looRmseK: Math.sqrt(sseLoo / n),
      looMaeK: absLoo / n,
      meanPriceK,
    };
  } catch {
    return null;
  }
}

/**
 * Gợi ý giá cho một mặt bằng mới từ mô hình đã fit.
 * Khoảng giá = dự đoán ± LOO RMSE, cận dưới không thấp hơn sàn giá.
 * Không bao giờ throw.
 */
export function suggestPrice(model: FittedModel, input: PricingInput): PriceSuggestion {
  const dist = Number.isFinite(input.distToBeachM) ? input.distToBeachM : 0;
  const card = input.hasCardPayment ? 1 : 0;
  const work = input.hasWork ? 1 : 0;

  const contributions: PriceContribution[] = [
    { key: "intercept", valueK: model.coef.intercept },
    { key: "distToBeachM", valueK: model.coef.distToBeachM * dist },
    { key: "hasCardPayment", valueK: model.coef.hasCardPayment * card },
    { key: "hasWork", valueK: model.coef.hasWork * work },
  ];

  // Cộng theo đúng thứ tự phần rã để tổng contributions khớp rawK
  const rawK = contributions.reduce((sum, item) => sum + item.valueK, 0);
  const margin = Number.isFinite(model.looRmseK) ? Math.max(0, model.looRmseK) : 0;

  const lowerK = Math.max(PRICE_FLOOR_K, rawK - margin);
  const recommendedK = Math.max(PRICE_FLOOR_K, rawK);

  return {
    rawK,
    recommended: Math.round(recommendedK) * 1000,
    lower: Math.round(lowerK) * 1000,
    upper: Math.round(recommendedK + margin) * 1000,
    contributions,
  };
}
