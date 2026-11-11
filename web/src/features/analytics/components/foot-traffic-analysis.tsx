"use client";

import * as React from "react";
import { Clock, Coffee, Sparkles, Users, Zap } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeDayTraffic, DAYS_OF_WEEK, type DayOfWeek, getCafeTraffic } from "../lib/traffic";

interface FootTrafficAnalysisProps {
  totalAnalyzedShops?: number;
}

export function FootTrafficAnalysis({ totalAnalyzedShops = 73 }: FootTrafficAnalysisProps) {
  // Default to today's day of week or Monday
  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>(() => {
    const dayIdx = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const map: Record<number, DayOfWeek> = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };
    return map[dayIdx] || "Monday";
  });

  const [hoveredHour, setHoveredHour] = React.useState<number | null>(null);

  const trafficData = React.useMemo(() => {
    return getCafeTraffic();
  }, []);

  const dayAnalysis = React.useMemo(() => {
    return analyzeDayTraffic(trafficData[selectedDay]);
  }, [trafficData, selectedDay]);

  const activeSlot = hoveredHour !== null ? dayAnalysis.slots[hoveredHour] : dayAnalysis.busiestHour;

  return (
    <Card className="overflow-hidden border-border/80 glass shadow-glass-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Clock className="size-4" />
              </span>
              <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
                Phân Bố Lưu Lượng Khách 24h & Khung Giờ Hoạt Động
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground sm:text-sm">
              Mật độ lưu lượng khách theo từng giờ (Thứ 2 đến Chủ Nhật) tổng hợp từ {totalAnalyzedShops} quán cafe có dữ
              liệu Google Maps tại An Thượng.
            </CardDescription>
          </div>

          {/* Day of Week Selector */}
          <div className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/70 bg-muted/50 p-1">
            {DAYS_OF_WEEK.map((d) => {
              const active = selectedDay === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  aria-pressed={active}
                  className={`shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="hidden sm:inline">{d.label}</span>
                  <span className="sm:hidden">{d.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {/* KPI Mini-cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 glass p-3.5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Zap className="size-3.5 text-amber-500" />
              <span>Đỉnh cao điểm</span>
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{dayAnalysis.busiestHour.label}</div>
            <div className="text-[11px] text-muted-foreground">Mật độ ~{dayAnalysis.busiestHour.percentage}%</div>
          </div>

          <div className="rounded-xl border border-border/50 glass p-3.5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Coffee className="size-3.5 text-emerald-500" />
              <span>Khung giờ yên tĩnh</span>
            </div>
            <div className="mt-1 truncate text-lg font-bold text-foreground">
              {dayAnalysis.quietHours.length > 0 ? dayAnalysis.quietHours[0] : "Sáng sớm"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">Lý tưởng làm việc & học bài</div>
          </div>

          <div className="rounded-xl border border-border/50 glass p-3.5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="size-3.5 text-sky-500" />
              <span>Mật độ trung bình ngày</span>
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">~{dayAnalysis.averageBusyness}%</div>
            <div className="text-[11px] text-muted-foreground">Mức độ lấp đầy chỗ ngồi</div>
          </div>
        </div>

        {/* 24-Hour Interactive Bar Chart */}
        <div className="space-y-3 rounded-2xl border border-border/60 glass p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">Biểu đồ mật độ 24 giờ (00:00 – 23:00)</div>
            <div className="font-mono text-xs text-muted-foreground">
              {hoveredHour !== null ? (
                <span className="font-bold text-primary">
                  {activeSlot.label}: ~{activeSlot.percentage}%
                </span>
              ) : (
                <span>Rê chuột hoặc chạm cột để xem</span>
              )}
            </div>
          </div>

          {/* Bars container */}
          <div className="flex h-48 w-full items-end gap-1 border-b border-border/40 px-1 pt-6 pb-2">
            {dayAnalysis.slots.map((slot) => {
              const heightPct = Math.max(slot.percentage, 4);
              const isHovered = hoveredHour === slot.hour;

              let barColor = "bg-primary/50";
              if (slot.percentage >= 50) {
                barColor = isHovered ? "bg-amber-500" : "bg-amber-500/80";
              } else if (slot.percentage >= 25) {
                barColor = isHovered ? "bg-sky-500" : "bg-sky-500/70";
              } else if (slot.percentage > 0) {
                barColor = isHovered ? "bg-emerald-500" : "bg-emerald-500/60";
              } else {
                barColor = "bg-muted/40";
              }

              return (
                <div
                  key={slot.hour}
                  className="group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                  onMouseEnter={() => setHoveredHour(slot.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  onClick={() => setHoveredHour(slot.hour)}
                >
                  {/* Hover tooltip bubble */}
                  {isHovered && (
                    <div className="pointer-events-none absolute -top-7 z-20 rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-background shadow-md">
                      {slot.label}: {slot.percentage}%
                    </div>
                  )}
                  {/* Vertical bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-150 ${barColor} ${
                      isHovered ? "scale-y-105 ring-2 ring-foreground/40" : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between px-1 font-mono text-[10px] text-muted-foreground">
            <span>0h</span>
            <span>3h</span>
            <span>6h</span>
            <span>9h</span>
            <span>12h</span>
            <span>15h</span>
            <span>18h</span>
            <span>21h</span>
            <span>23h</span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-amber-500" />
              <span>Đông đúc ({">"}50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-sky-500" />
              <span>Vừa phải (25–50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-500" />
              <span>Vắng / Yên tĩnh ({"<"}25%)</span>
            </div>
          </div>
        </div>

        {/* Business & Consumer Insights Box */}
        <div className="space-y-2 rounded-xl border border-border/50 glass p-4 text-left text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Sparkles className="size-4 text-primary" />
            <span>Phân tích nhịp điệu kinh doanh F&B khu An Thượng:</span>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Đặc tính khu phố Tây & Du lịch:</strong> Khác với các quận nội thành
              Đà Nẵng thường đạt đỉnh lúc 7h–8h sáng, khu An Thượng mở cửa và tăng lượng khách từ{" "}
              <strong>8h30 – 11h00</strong> (nhóm khách du lịch, freelancer quốc tế dùng bữa sáng / brunch).
            </li>
            <li>
              <strong className="text-foreground">Đỉnh phố đêm & giải trí:</strong> Từ <strong>19h00 – 22h00</strong>{" "}
              (đặc biệt tối Thứ 6 đến Chủ Nhật) là lúc toàn bộ khu phố đạt mật độ khách tối đa, các mô hình kết hợp Cafe
              & Bar / Bistro có tỷ lệ khai thác chỗ ngồi cao nhất.
            </li>
            <li>
              <strong className="text-foreground">Khung giờ tối ưu cho khách làm việc (Remote / Nomad):</strong> Từ{" "}
              <strong>13h30 – 16h30</strong> các ngày từ Thứ 2 đến Thứ 5 là khung giờ mát mẻ, yên tĩnh, ít tiếng ồn đàm
              thoại và tốc độ Wi-Fi đạt mức thông suốt cao nhất.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
