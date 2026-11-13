"use client";

import * as React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { checkCafeOpenStatus, parseHoursData, VIETNAMESE_DAYS } from "../hours-utils";

interface OpeningHoursProps {
  hours: unknown;
  className?: string;
}

const emptySubscribe = () => () => {};

function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function OpeningHours({ hours, className }: OpeningHoursProps) {
  const isClient = useIsClient();

  const schedules = React.useMemo(() => parseHoursData(hours), [hours]);
  const status = React.useMemo(() => {
    if (!isClient) return null;
    return checkCafeOpenStatus(hours);
  }, [isClient, hours]);

  return (
    <div data-slot="opening-hours-card" className={cn("rounded-xl glass p-4 shadow-glass-card sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Clock className="size-5 stroke-[2.5] text-foreground" />
          <h2 className="font-heading text-lg font-bold text-foreground">Giờ mở cửa</h2>
        </div>

        <div>
          {status === null ? (
            <Badge
              variant="muted"
              className="border border-border bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground"
            >
              <Clock className="size-3.5 stroke-[2.5]" />
              <span>Đang kiểm tra...</span>
            </Badge>
          ) : status.isOpen === true ? (
            <Badge
              variant="default"
              className="gap-1.5 border border-border bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-glass-sm"
            >
              <CheckCircle2 className="size-3.5 stroke-[2.5]" />
              <span>Đang mở cửa</span>
            </Badge>
          ) : status.isOpen === false ? (
            <Badge
              variant="destructive"
              className="gap-1.5 border border-border bg-destructive px-3 py-1 text-xs font-bold text-primary-foreground shadow-glass-sm"
            >
              <XCircle className="size-3.5 stroke-[2.5]" />
              <span>Đã đóng cửa</span>
            </Badge>
          ) : (
            <Badge
              variant="muted"
              className="border border-border bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground"
            >
              Chưa cập nhật giờ
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4">
        {schedules.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-1">
            {schedules.map((schedule) => {
              const isToday = status ? status.isToday(schedule.day) : false;
              const vnDay = VIETNAMESE_DAYS[schedule.day] ?? schedule.day;
              const timesText = schedule.times.join(", ");

              return (
                <div
                  key={schedule.day}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all",
                    isToday
                      ? "border-border bg-primary font-bold text-primary-foreground shadow-glass-sm"
                      : "border-border/60 bg-muted/40 font-medium text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{vnDay}</span>
                    {isToday ? (
                      <span className="py-0.2 rounded border border-border bg-card px-1.5 text-[10px] font-bold text-foreground uppercase">
                        Hôm nay
                      </span>
                    ) : null}
                  </div>
                  <div className="font-mono text-xs font-bold sm:text-sm">{timesText}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-2 text-center text-sm font-medium text-muted-foreground">
            Quán chưa công bố lịch mở cửa chi tiết 7 ngày trên Google Maps.
          </p>
        )}
      </div>
    </div>
  );
}
