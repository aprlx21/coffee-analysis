"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CafeCard as CafeCardData } from "@/server/db/types";

import { CafeCard } from "./cafe-card";

export interface CafeGridProps {
  items: CafeCardData[];
  viewMode: "grid" | "list";
  total: number;
  onReset: () => void;
  className?: string;
}

export function CafeGrid({ items, viewMode, total, onReset, className }: CafeGridProps) {
  if (items.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl glass p-8 text-center shadow-glass-card md:p-14">
        <div className="mb-4 flex size-16 items-center justify-center rounded-lg border border-border bg-primary text-3xl font-bold text-primary-foreground shadow-glass">
          ☕
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground">Không tìm thấy quán cafe phù hợp</h3>
        <p className="mt-2 max-w-md text-sm font-medium text-muted-foreground">
          Không có quán nào khớp với các điều kiện lọc hiện tại. Thử bỏ bớt tiện ích hoặc xóa từ khóa tìm kiếm xem nhé!
        </p>
        <Button variant="default" onClick={onReset} className="mt-6 font-bold shadow-glass-sm">
          <RotateCcw className="mr-1.5 size-4 stroke-[2.5]" />
          XÓA TẤT CẢ BỘ LỌC
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4",
        className,
      )}
    >
      {items.map((cafe) => (
        <CafeCard key={cafe.placeId} cafe={cafe} />
      ))}
    </div>
  );
}
