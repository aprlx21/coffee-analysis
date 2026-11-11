import * as React from "react";
import { Coins, HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { PriceRangeStat } from "@/server/db";

interface PriceDistributionProps {
  priceRanges: PriceRangeStat[];
  totalShops: number;
}

export function PriceDistribution({ priceRanges, totalShops }: PriceDistributionProps) {
  return (
    <div className="rounded-xl glass p-6 shadow-glass-card md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground shadow-glass-sm">
              <Coins className="size-4 stroke-[2.5]" />
            </div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Phân bố Khoảng giá
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Mức chi tiêu trung bình trên mỗi khách theo dữ liệu Google Maps tại khu An Thượng
          </p>
        </div>

        <Badge variant="secondary" className="w-fit text-xs font-bold">
          {totalShops} quán khảo sát
        </Badge>
      </div>

      {/* Pure CSS Horizontal Bar Chart */}
      <div className="space-y-5">
        {priceRanges.map((item) => {
          return (
            <div key={item.range} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-heading font-bold text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-foreground">
                    {item.count} <span className="text-xs font-medium text-muted-foreground">quán</span>
                  </span>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="relative h-8 w-full overflow-hidden rounded-lg border border-border bg-muted p-1">
                <div
                  className="flex h-full items-center justify-end rounded-sm border border-border bg-primary pr-2 shadow-glass-sm transition-all duration-700"
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                >
                  {item.percentage > 12 && (
                    <span className="font-mono text-xs font-bold text-primary-foreground">{item.percentage}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight Note */}
      <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        <HelpCircle className="mt-0.5 size-4 shrink-0 stroke-[2.5] text-foreground" />
        <p className="leading-relaxed font-medium">
          <strong className="text-foreground">Nhận định thị trường:</strong> Hơn 56% quán cafe An Thượng thuộc phân khúc
          dưới 100.000đ/người. Phân khúc 100.000đ - 200.000đ (22.6%) chủ yếu là các quán specialty coffee và roastery
          phục vụ khách quốc tế và digital nomads.
        </p>
      </div>
    </div>
  );
}
