import type { PriceComparison } from "./types";

export interface BenchmarkPrice {
  medianMin: number;
  medianMax: number;
}

/**
 * Mức giá trung vị thống kê từ v_typical_price_v2 trên toàn bộ quán khu vực An Thượng.
 */
export const CANONICAL_BENCHMARKS: Record<string, BenchmarkPrice> = {
  americano: { medianMin: 40000, medianMax: 40000 },
  bac_xiu: { medianMin: 35000, medianMax: 35000 },
  ca_phe_den: { medianMin: 25000, medianMax: 30000 },
  ca_phe_dua: { medianMin: 41000, medianMax: 45000 },
  ca_phe_muoi: { medianMin: 37000, medianMax: 40000 },
  ca_phe_sua: { medianMin: 30000, medianMax: 35000 },
  ca_phe_sua_tuoi: { medianMin: 27500, medianMax: 31000 },
  ca_phe_trung: { medianMin: 45000, medianMax: 47500 },
  cacao: { medianMin: 32500, medianMax: 35000 },
  cappuccino: { medianMin: 45000, medianMax: 50000 },
  caramel_macchiato: { medianMin: 55000, medianMax: 57500 },
  chanh_day: { medianMin: 35000, medianMax: 35000 },
  cold_brew: { medianMin: 47000, medianMax: 55000 },
  espresso: { medianMin: 30000, medianMax: 40000 },
  flat_white: { medianMin: 55000, medianMax: 55000 },
  hong_tra: { medianMin: 23500, medianMax: 25500 },
  latte: { medianMin: 45000, medianMax: 49000 },
  matcha_latte: { medianMin: 45000, medianMax: 45000 },
  mocha: { medianMin: 50000, medianMax: 50000 },
  nuoc_cam: { medianMin: 35000, medianMax: 35000 },
  nuoc_dua: { medianMin: 32500, medianMax: 36000 },
  sinh_to_bo: { medianMin: 40000, medianMax: 40000 },
  sinh_to_dau: { medianMin: 45000, medianMax: 45000 },
  sinh_to_xoai: { medianMin: 40000, medianMax: 40000 },
  soda_chanh: { medianMin: 35000, medianMax: 37500 },
  sua_chua: { medianMin: 27500, medianMax: 32500 },
  tra_chanh: { medianMin: 25000, medianMax: 25000 },
  tra_dao: { medianMin: 30000, medianMax: 35000 },
  tra_sen_vang: { medianMin: 26000, medianMax: 27000 },
  tra_sua_tran_chau: { medianMin: 35000, medianMax: 37000 },
  tra_tac: { medianMin: 20500, medianMax: 25000 },
  tra_vai: { medianMin: 30000, medianMax: 35000 },
  tra_xanh: { medianMin: 54000, medianMax: 54000 },
};

export function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function formatPriceRange(priceMin: number | null, priceMax: number | null): string {
  if (priceMin === null && priceMax === null) return "Chưa rõ giá";
  if (priceMin !== null && priceMax !== null) {
    if (priceMin === priceMax) return formatPrice(priceMin);
    return `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`;
  }
  if (priceMin !== null) return formatPrice(priceMin);
  if (priceMax !== null) return formatPrice(priceMax);
  return "Chưa rõ giá";
}

export function getPriceComparison(
  canonicalId: string,
  priceMin: number | null,
  priceMax: number | null,
): PriceComparison | null {
  const benchmark = CANONICAL_BENCHMARKS[canonicalId];
  if (!benchmark) return null;

  const validPriceMin = priceMin ?? priceMax;
  const validPriceMax = priceMax ?? priceMin;
  if (validPriceMin === null || validPriceMax === null || validPriceMin <= 0) return null;

  const shopAvg = (validPriceMin + validPriceMax) / 2;
  const benchmarkAvg = (benchmark.medianMin + benchmark.medianMax) / 2;

  const diff = shopAvg - benchmarkAvg;
  const diffPct = Math.round((diff / benchmarkAvg) * 100);

  if (diffPct <= -10) {
    return {
      status: "cheaper",
      diffPct,
      median: benchmarkAvg,
      label: `Rẻ hơn khu vực (${Math.abs(diffPct)}%)`,
    };
  }

  if (diffPct >= 10) {
    return {
      status: "higher",
      diffPct,
      median: benchmarkAvg,
      label: `Cao hơn khu vực (+${diffPct}%)`,
    };
  }

  return {
    status: "equal",
    diffPct: 0,
    median: benchmarkAvg,
    label: `Ngang trung vị khu vực (${formatPrice(benchmarkAvg)})`,
  };
}
