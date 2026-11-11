import * as React from "react";
import { Coffee, FileText, Laptop, Star, Wifi } from "lucide-react";

import type { AnalyticsKpi } from "@/server/db";

interface KpiTilesProps {
  kpi: AnalyticsKpi;
}

export function KpiTiles({ kpi }: KpiTilesProps) {
  const tiles = [
    {
      id: "total",
      label: "Tổng số quán",
      value: `${kpi.totalShops}`,
      unit: "quán",
      subtext: "Toàn bộ khu phố Tây An Thượng",
      icon: Coffee,
      highlight: false,
    },
    {
      id: "rating",
      label: "Đánh giá trung bình",
      value: `${kpi.avgRating.toFixed(1)}`,
      unit: "★",
      subtext: "Thang điểm 5.0 Google Maps",
      icon: Star,
      highlight: true,
    },
    {
      id: "wifi",
      label: "Tỷ lệ có Wi-Fi",
      value: `${kpi.wifiPercent}%`,
      unit: `(${kpi.wifiCount}/${kpi.totalShops})`,
      subtext: "Xác nhận Wi-Fi hoạt động ổn định",
      icon: Wifi,
      highlight: false,
    },
    {
      id: "laptop",
      label: "Hợp làm việc laptop",
      value: `${kpi.laptopFriendlyPercent}%`,
      unit: `(${kpi.laptopFriendlyCount}/${kpi.totalShops})`,
      subtext: "Bàn cao, yên tĩnh & phù hợp làm việc",
      icon: Laptop,
      highlight: false,
    },
    {
      id: "menu",
      label: "Dữ liệu Menu OCR",
      value: `${kpi.menuOcrCount}`,
      unit: `quán`,
      subtext: `${kpi.menuPriceCount} quán có bảng giá chi tiết`,
      icon: FileText,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.id}
            className="flex flex-col justify-between rounded-lg border-2 border-border bg-card p-5 shadow-hard-card transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{tile.label}</span>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
                <Icon className="size-4 stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {tile.value}
                </span>
                <span className="text-sm font-bold text-muted-foreground">{tile.unit}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{tile.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
