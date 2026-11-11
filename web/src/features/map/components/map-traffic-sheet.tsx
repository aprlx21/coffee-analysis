"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DAYS_OF_WEEK, DayOfWeek, getCafeTraffic, analyzeDayTraffic } from "../lib/traffic";
import { Clock, Users, Zap, Coffee, Sparkles } from "lucide-react";
import type { CafeCard } from "@/server/db";

interface MapTrafficSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCafe?: CafeCard | null;
}

export function MapTrafficSheet({ open, onOpenChange, selectedCafe }: MapTrafficSheetProps) {
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
    return getCafeTraffic(selectedCafe?.placeId);
  }, [selectedCafe?.placeId]);

  const dayAnalysis = React.useMemo(() => {
    return analyzeDayTraffic(trafficData[selectedDay]);
  }, [trafficData, selectedDay]);

  const activeSlot = hoveredHour !== null ? dayAnalysis.slots[hoveredHour] : dayAnalysis.busiestHour;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col border-l border-border/80 glass-strong bg-background/95 p-0 backdrop-blur-xl sm:max-w-xl"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border/60 p-5 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <Clock className="h-5 w-5" />
            </span>
            <div className="text-left">
              <SheetTitle className="text-lg font-bold text-foreground">Biểu đồ Lưu lượng Khách 24h</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {selectedCafe ? (
                  <>
                    Quán: <strong className="text-foreground">{selectedCafe.name}</strong>
                  </>
                ) : (
                  "Chỉ số mật độ khách trung bình toàn thị trường An Thượng"
                )}
              </SheetDescription>
            </div>
          </div>

          {/* Day of Week Selector */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-3">
            {DAYS_OF_WEEK.map((d) => {
              const active = selectedDay === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelectedDay(d.key)}
                  className={`flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? "scale-102 bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="hidden sm:inline">{d.label}</span>
                  <span className="sm:hidden">{d.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Key Insights KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/50 glass p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Giờ cao điểm</span>
              </div>
              <div className="mt-1 text-base font-bold text-foreground">{dayAnalysis.busiestHour.label}</div>
              <div className="text-[11px] text-muted-foreground">Mức độ ~{dayAnalysis.busiestHour.percentage}%</div>
            </div>

            <div className="rounded-xl border border-border/50 glass p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Coffee className="h-3.5 w-3.5 text-emerald-500" />
                <span>Giờ yên tĩnh</span>
              </div>
              <div className="mt-1 truncate text-base font-bold text-foreground">
                {dayAnalysis.quietHours.length > 0 ? dayAnalysis.quietHours[0] : "Sáng sớm"}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">Hợp học & làm việc</div>
            </div>

            <div className="rounded-xl border border-border/50 glass p-3 text-left">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-sky-500" />
                <span>Trung bình ngày</span>
              </div>
              <div className="mt-1 text-base font-bold text-foreground">~{dayAnalysis.averageBusyness}%</div>
              <div className="text-[11px] text-muted-foreground">Mật độ bàn có khách</div>
            </div>
          </div>

          {/* 24-Hour Visual Bar Chart */}
          <div className="space-y-3 rounded-2xl border border-border/60 glass p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <span>Phân bổ 24 giờ (00:00 – 23:00)</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {hoveredHour !== null ? (
                  <span className="font-bold text-primary">
                    {activeSlot.label}: ~{activeSlot.percentage}%
                  </span>
                ) : (
                  <span>Rê chuột / Chạm cột để xem</span>
                )}
              </div>
            </div>

            {/* Bars container */}
            <div className="flex h-44 w-full items-end gap-1 border-b border-border/40 px-1 pt-6 pb-2">
              {dayAnalysis.slots.map((slot) => {
                const heightPct = Math.max(slot.percentage, 4);
                const isHovered = hoveredHour === slot.hour;
                // Bar color logic: Red/Orange for peak, Sky/Blue for normal, Emerald for quiet
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
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="pointer-events-none absolute -top-7 z-20 rounded bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap text-background shadow-md">
                        {slot.label}: {slot.percentage}%
                      </div>
                    )}
                    {/* Bar */}
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

            {/* X-axis labels (Every 3 hours) */}
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
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                <span>Đông đúc ({">"}50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
                <span>Vừa phải (25–50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span>Vắng / Yên tĩnh ({"<"}25%)</span>
              </div>
            </div>
          </div>

          {/* Actionable Tips */}
          <div className="space-y-2 rounded-xl border border-border/50 glass p-4 text-left text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Gợi ý trải nghiệm tại khu phố An Thượng:</span>
            </div>
            <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-muted-foreground">
              <li>
                <strong className="text-foreground">Làm việc & Học tập (Laptop):</strong> Khung giờ từ{" "}
                <strong>07:00 – 10:30</strong> và <strong>14:00 – 16:30</strong> các ngày trong tuần (T2–T6) là thời
                điểm yên tĩnh, mạng Wi-Fi ổn định và dễ chọn chỗ ngồi cắm sạc nhất.
              </li>
              <li>
                <strong className="text-foreground">Gặp gỡ & Không khí sôi động:</strong> Khung giờ từ{" "}
                <strong>19:30 – 22:00</strong> (đặc biệt tối Thứ 6 đến Chủ Nhật) là lúc các quán đạt đỉnh lưu lượng, phù
                hợp gặp gỡ bạn bè và tận hưởng nhịp sống phố đêm.
              </li>
              {selectedCafe && (
                <li className="font-medium text-primary">
                  Đang xem lưu lượng riêng của quán: <strong>{selectedCafe.name}</strong>.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border/60 bg-muted/20 p-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Đóng bảng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
