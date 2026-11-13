import assert from "node:assert/strict";
// prettier-ignore
// @ts-expect-error TS5097: Node strip-types cần đuôi .ts (tsconfig không bật allowImportingTsExtensions)
import { BEACH_AXIS, nearestBeachPoint, distToBeachFrontM, distanceM, fitOls, suggestPrice, type TrainingRow } from "../src/features/pricing/lib/regression.ts";

/**
 * Self-check cho mô-đun hồi quy giá.
 * Chạy: node --experimental-strip-types scripts/check-pricing-regression.ts
 */

const EPS = 1e-6;

function approx(actual: number, expected: number, tolerance: number, label: string): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: mong đợi ${expected} ± ${tolerance}, nhận ${actual}`);
}

// (a) Hình học: polyline trục biển Võ Nguyên Giáp và khoảng cách ra biển
// Điểm đúng đỉnh trục biển -> khoảng cách ~ 0 m
const vertex = BEACH_AXIS[2]; // [16.0400, 108.2493]
approx(nearestBeachPoint(vertex[0], vertex[1]).distM, 0, EPS, "đỉnh trục biển có distM ~ 0");
approx(distToBeachFrontM(vertex[0], vertex[1]), 0, EPS, "đỉnh trục biển có distToBeachFrontM ~ 0");

// Điểm ~500 m về phía Tây trục biển gần vĩ độ 16.05 -> dương khoảng 480–500 m
const west500 = distToBeachFrontM(16.05, 108.2441);
assert.ok(west500 >= 480 && west500 <= 500, `phía Tây trục biển gần 16.05 phải khoảng 480–500m, nhận ${west500}`);

// Điểm phía Đông trục biển (phía biển) -> âm
const eastPoint = distToBeachFrontM(16.05, 108.255);
assert.ok(eastPoint < 0, `phía Đông trục biển (phía biển) phải cho khoảng cách âm, nhận ${eastPoint}`);

assert.equal(distanceM(16.05, 108.2485, 16.05, 108.2485), 0, "cùng một điểm phải cho khoảng cách 0");
approx(distanceM(16.04, 108.2485, 16.05, 108.2485), 1110, 1, "1/100 độ vĩ độ");

// (b) Dữ liệu tổng hợp không nhiễu: y = 40 − 0.015·dist + 8·card − 4·work
const TRUE = { intercept: 40, distToBeachM: -0.015, hasCardPayment: 8, hasWork: -4 };

const syntheticRows: TrainingRow[] = [];
for (let i = 0; i < 24; i++) {
  const distToBeachM = 150 + i * 55;
  const hasCardPayment = i % 2 === 0;
  const hasWork = Math.floor(i / 2) % 2 === 0;
  syntheticRows.push({
    distToBeachM,
    hasCardPayment,
    hasWork,
    priceK:
      TRUE.intercept +
      TRUE.distToBeachM * distToBeachM +
      TRUE.hasCardPayment * (hasCardPayment ? 1 : 0) +
      TRUE.hasWork * (hasWork ? 1 : 0),
  });
}

const model = fitOls(syntheticRows);
assert.ok(model !== null, "fitOls phải trả về mô hình với 24 dòng hợp lệ");
assert.equal(model.n, syntheticRows.length, "n phải bằng số dòng huấn luyện");
approx(model.coef.intercept, TRUE.intercept, EPS, "hệ số chặn");
approx(model.coef.distToBeachM, TRUE.distToBeachM, EPS, "hệ số khoảng cách");
approx(model.coef.hasCardPayment, TRUE.hasCardPayment, EPS, "hệ số thanh toán thẻ");
approx(model.coef.hasWork, TRUE.hasWork, EPS, "hệ số quán làm việc");
approx(model.r2, 1, 1e-9, "R² dữ liệu không nhiễu");
approx(model.looR2, 1, 1e-9, "LOO R² dữ liệu không nhiễu");
approx(model.looRmseK, 0, EPS, "LOO RMSE dữ liệu không nhiễu");

// (c) Các trường hợp phải trả null
assert.equal(fitOls(syntheticRows.slice(0, 14)), null, "dưới 15 dòng phải trả null");
assert.equal(
  fitOls(syntheticRows.map((row) => ({ ...row, distToBeachM: 500, hasCardPayment: true, hasWork: true }))),
  null,
  "mọi dòng trùng đặc trưng (ma trận suy biến) phải trả null",
);
assert.equal(fitOls([]), null, "tập rỗng phải trả null");

// (d) Gợi ý giá: phần rã khớp rawK, khoảng giá bao quanh giá khuyến nghị
const suggestion = suggestPrice(model, { distToBeachM: 400, hasCardPayment: true, hasWork: false });
assert.equal(suggestion.contributions.length, 4, "phải có đúng 4 phần rã");
assert.deepEqual(
  suggestion.contributions.map((item) => item.key),
  ["intercept", "distToBeachM", "hasCardPayment", "hasWork"],
  "thứ tự phần rã phải cố định",
);
const contributionSum = suggestion.contributions.reduce((sum, item) => sum + item.valueK, 0);
approx(contributionSum, suggestion.rawK, 1e-9, "tổng contributions phải bằng rawK");
approx(suggestion.rawK, 40 - 0.015 * 400 + 8, EPS, "rawK theo công thức");
assert.ok(suggestion.lower <= suggestion.recommended, "lower phải ≤ recommended");
assert.ok(suggestion.recommended <= suggestion.upper, "recommended phải ≤ upper");

// Sàn giá: dự đoán rất thấp vẫn không xuống dưới PRICE_FLOOR_K nghìn VND
const lowSuggestion = suggestPrice(
  { ...model, coef: { intercept: -500, distToBeachM: 0, hasCardPayment: 0, hasWork: 0 } },
  { distToBeachM: 0, hasCardPayment: false, hasWork: false },
);
assert.ok(lowSuggestion.recommended >= 15000, "recommended không được thấp hơn sàn 15.000đ");
assert.ok(lowSuggestion.lower >= 15000, "lower không được thấp hơn sàn 15.000đ");

// (e) Dữ liệu có nhiễu: LOO metrics hữu hạn và không âm
const noisyRows: TrainingRow[] = syntheticRows.map((row, i) => ({
  ...row,
  priceK: row.priceK + (i % 3 === 0 ? 1.5 : i % 3 === 1 ? -1 : 0.5),
}));
const noisyModel = fitOls(noisyRows);
assert.ok(noisyModel !== null, "dữ liệu có nhiễu nhỏ vẫn phải fit được");
assert.ok(Number.isFinite(noisyModel.looR2), "looR2 phải hữu hạn");
assert.ok(noisyModel.looRmseK >= 0 && noisyModel.looMaeK >= 0, "LOO RMSE/MAE phải không âm");
assert.ok(noisyModel.r2 > 0.95, "dữ liệu gần tuyến tính phải có R² cao");

console.log("OK — regression self-check passed (geometry, OLS recovery, null cases, price suggestion).");
