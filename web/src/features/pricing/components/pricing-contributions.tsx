"use client";

import { CreditCard, Home, Laptop, Waves } from "lucide-react";
import type { PriceContribution } from "../types";

interface PricingContributionsProps {
  contributions: PriceContribution[];
  distToBeachM: number;
  hasCardPayment: boolean;
  hasWork: boolean;
}

function formatSignedVND(valueK: number): string {
  const vnd = Math.round(valueK * 1000);
  if (vnd > 0) return `+${vnd.toLocaleString("vi-VN")} đ`;
  if (vnd < 0) return `-${Math.abs(vnd).toLocaleString("vi-VN")} đ`;
  return `0 đ`;
}

export function PricingContributions({
  contributions,
  distToBeachM,
  hasCardPayment,
  hasWork,
}: PricingContributionsProps) {
  const getContributionMeta = (key: PriceContribution["key"]) => {
    switch (key) {
      case "intercept":
        return {
          label: "Giá nền thị trường",
          desc: "Mặt bằng giá cơ sở tại An Thượng",
          icon: Home,
          color: "text-foreground",
        };
      case "distToBeachM":
        return {
          label: "Vị trí so với biển",
          desc: `${Math.round(distToBeachM)}m ra trục Võ Nguyên Giáp`,
          icon: Waves,
          color: "text-sky-600 dark:text-sky-400",
        };
      case "hasCardPayment":
        return {
          label: "Thanh toán thẻ / NFC",
          desc: hasCardPayment ? "Có máy POS / Apple Pay" : "Chưa bật thanh toán thẻ",
          icon: CreditCard,
          color: "text-emerald-600 dark:text-emerald-400",
        };
      case "hasWork":
        return {
          label: "Định vị làm việc",
          desc: hasWork ? "Không gian laptop-friendly" : "Không chuyên làm việc",
          icon: Laptop,
          color: "text-purple-600 dark:text-purple-400",
        };
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-border/70 bg-card/60 p-3 text-xs">
      <div className="flex items-center justify-between border-b border-border/50 pb-1 font-heading font-semibold text-foreground">
        <span>Vì sao ra mức giá này?</span>
        <span className="text-[11px] font-normal text-muted-foreground">Tác động từng yếu tố</span>
      </div>

      <div className="divide-y divide-border/40">
        {contributions.map((item) => {
          const meta = getContributionMeta(item.key);
          const Icon = meta.icon;
          const isPositive = item.valueK > 0;
          const isNegative = item.valueK < 0;

          return (
            <div key={item.key} className="flex items-center justify-between py-1.5 first:pt-1 last:pb-0">
              <div className="flex items-center gap-2">
                <div className={`rounded-md bg-muted/60 p-1 ${meta.color}`}>
                  <Icon className="size-3.5" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{meta.label}</div>
                  <div className="text-[10px] text-muted-foreground">{meta.desc}</div>
                </div>
              </div>

              <div
                className={`font-mono text-xs font-semibold ${
                  item.key === "intercept"
                    ? "text-foreground"
                    : isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isNegative
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                }`}
              >
                {formatSignedVND(item.valueK)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
