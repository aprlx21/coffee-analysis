import * as React from "react";
import { Info, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AmenityStat } from "@/server/db";

interface TopAmenitiesProps {
  amenities: AmenityStat[];
  totalShops: number;
}

export function TopAmenities({ amenities, totalShops }: TopAmenitiesProps) {
  return (
    <div className="rounded-lg border-2 border-border bg-card p-6 shadow-hard-card md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
              <Sparkles className="size-4 stroke-[2.5]" />
            </div>
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Phân tích Tiện ích & Cơ sở Vật chất
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Mức độ đáp ứng tiện ích không gian, thanh toán và làm việc tại các quán cafe An Thượng
          </p>
        </div>

        <Badge variant="secondary" className="w-fit text-xs font-bold">
          {totalShops} quán khảo sát
        </Badge>
      </div>

      {/* Grid of amenities */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
        {amenities.map((item) => {
          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-heading font-bold text-foreground">{item.label}</span>
                  {item.isInferred && (
                    <span className="py-0.2 rounded border border-border bg-primary px-1.5 text-[10px] font-extrabold text-primary-foreground uppercase shadow-[1px_1px_0px_0px_var(--border)]">
                      Suy luận từ review
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs font-bold text-foreground sm:text-sm">
                    {item.count} <span className="text-[11px] font-medium text-muted-foreground">quán</span>
                  </span>
                  <Badge variant="outline" className="font-mono text-[11px] font-bold">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-6 w-full overflow-hidden rounded-md border-2 border-border bg-muted p-0.5">
                <div
                  className="h-full rounded-xs border border-border bg-primary shadow-hard-sm transition-all duration-700"
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodological Callout */}
      <div className="mt-8 flex items-start gap-3 rounded-lg border-2 border-border bg-secondary/60 p-4 text-xs text-foreground shadow-hard-sm">
        <Info className="mt-0.5 size-4 shrink-0 rounded bg-primary stroke-[2.5] p-0.5 text-primary-foreground" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">ℹ️ Lưu ý phương pháp luận trích xuất tiện ích:</p>
          <p className="leading-relaxed font-medium text-muted-foreground">
            Tiện ích <strong className="text-foreground">Máy lạnh & Ổ cắm điện</strong> là dữ liệu được hệ thống suy
            luận từ đánh giá thực tế của khách hàng (Google Maps Review NLP). Các tiện ích khác (Wi-Fi, Chỗ ngồi ngoài
            trời, Thanh toán NFC/Thẻ...) được tổng hợp trực tiếp từ thông tin chính thức đã xác thực của cơ sở.
          </p>
        </div>
      </div>
    </div>
  );
}
