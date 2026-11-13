"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

import { getReliability, suggestPrice } from "../lib/regression";
import type { PricingDrinkData } from "../types";
import { PricingContributions } from "./pricing-contributions";

interface PricingDrinkCardProps {
  drink: PricingDrinkData;
  distToBeachM: number | null;
  hasCardPayment: boolean;
  hasWork: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function PricingDrinkCard({
  drink,
  distToBeachM,
  hasCardPayment,
  hasWork,
  isSelected,
  onSelect,
}: PricingDrinkCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const model = drink.model;

  // Độ tin cậy theo LOO R² (dùng chung logic getReliability)
  const reliability = useMemo(() => {
    if (!model) return null;
    const rel = getReliability(model.looR2);
    const variant =
      rel.level === "high"
        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
        : rel.level === "medium"
          ? "border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-300"
          : "border-destructive/30 bg-destructive/10 text-destructive";
    return {
      label: rel.label,
      variant,
      tooltip: rel.tooltip,
    };
  }, [model]);

  // Tính dự đoán giá nếu đã có pin và model
  const suggestion = useMemo(() => {
    if (!model || distToBeachM === null) return null;
    return suggestPrice(model, {
      distToBeachM,
      hasCardPayment,
      hasWork,
    });
  }, [model, distToBeachM, hasCardPayment, hasWork]);

  // Tính vị trí % trên thanh khoảng giá
  const barPercent = useMemo(() => {
    if (!suggestion) return 50;
    const { lower, upper, recommended } = suggestion;
    if (upper <= lower) return 50;
    const p = ((recommended - lower) / (upper - lower)) * 100;
    return Math.max(8, Math.min(92, p));
  }, [suggestion]);

  return (
    <div
      onClick={onSelect}
      className={`relative flex cursor-pointer flex-col rounded-2xl border glass p-5 shadow-glass-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass-lg ${
        isSelected ? "border-primary bg-card/90 ring-2 ring-primary/20" : "border-border/80 hover:border-border"
      }`}
    >
      {/* Header: Tên món + số lượng quán + badge độ tin cậy */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-foreground">{drink.displayName}</h3>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground uppercase">
              {drink.canonicalId}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {model ? `Dữ liệu huấn luyện: ${model.n} quán An Thượng` : "Chưa đủ dữ liệu"}
          </div>
        </div>

        {reliability && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${reliability.variant}`}
            title={reliability.tooltip}
          >
            <Sparkles className="size-3 shrink-0" />
            <span>{reliability.label}</span>
          </span>
        )}
      </div>

      {/* Thân thẻ: Kết quả giá */}
      <div className="mt-4">
        {!model ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Chưa đủ dữ liệu quán để huấn luyện mô hình cho món này.
          </div>
        ) : distToBeachM === null || distToBeachM === undefined ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            <span className="mb-1 block font-medium text-foreground">Chưa chọn vị trí</span>
            Chạm bản đồ để xem định giá cho {drink.displayName}
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            {/* Giá khuyến nghị to nổi bật */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="block text-xs font-medium text-muted-foreground">Giá bán đề xuất</span>
                <span className="font-mono text-3xl font-extrabold tracking-tight text-primary">
                  {formatVND(suggestion.recommended)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] text-muted-foreground">Mặt bằng giá chung</span>
                <span className="font-mono text-sm font-semibold text-foreground">
                  ~{formatVND(Math.round(model.meanPriceK * 1000))}
                </span>
              </div>
            </div>

            {/* Thanh trực quan hoá khoảng giá thâm nhập - premium */}
            <div className="space-y-1.5 pt-1">
              <div className="relative h-3 w-full overflow-hidden rounded-full border border-border/60 bg-muted/80">
                {/* Dải khoảng giá */}
                <div className="absolute inset-x-1 inset-y-0 rounded-full bg-gradient-to-r from-sky-400/40 via-primary/50 to-amber-500/40" />

                {/* Điểm marker giá đề xuất */}
                <div
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md transition-all duration-300"
                  style={{ left: `${barPercent}%` }}
                />
              </div>

              {/* Nhãn 2 đầu */}
              <div className="flex justify-between pt-0.5 text-[11px] font-medium text-muted-foreground">
                <div>
                  <span className="block text-[10px] text-muted-foreground/80">Giá thâm nhập</span>
                  <span className="font-mono font-semibold text-foreground">{formatVND(suggestion.lower)}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-semibold text-primary">Đề xuất</span>
                  <span className="font-mono font-bold text-primary">{formatVND(suggestion.recommended)}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-muted-foreground/80">Giá premium</span>
                  <span className="font-mono font-semibold text-foreground">{formatVND(suggestion.upper)}</span>
                </div>
              </div>
            </div>

            {/* Nút bật/tắt breakdown */}
            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBreakdown((prev) => !prev);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span>Chi tiết đóng góp vào giá ({suggestion.contributions.length} yếu tố)</span>
                {showBreakdown ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              {showBreakdown && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <PricingContributions
                    contributions={suggestion.contributions}
                    distToBeachM={distToBeachM}
                    hasCardPayment={hasCardPayment}
                    hasWork={hasWork}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
