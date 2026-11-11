"use client";

import { useEffect, useRef } from "react";
import { Coffee } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CafeCard } from "@/server/db";
import { MapCafeCard } from "./map-cafe-card";

interface MapListPanelProps {
  cafes: CafeCard[];
  total: number;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
  onHoverCafe: (placeId: string | null) => void;
  onClearFilters?: () => void;
}

export function MapListPanel({
  cafes,
  total,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectCafe,
  onHoverCafe,
  onClearFilters,
}: MapListPanelProps) {
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll list to active card when marker is clicked on map
  useEffect(() => {
    if (!selectedPlaceId) return;

    const el = cardRefs.current[selectedPlaceId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedPlaceId]);

  return (
    <div className="flex size-full flex-col overflow-hidden bg-background/50">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-card/60 p-4 shadow-glass-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg">
              {total} quán trên bản đồ
            </h2>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-bold text-primary">
              AN THƯỢNG
            </Badge>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Nhấp vào quán hoặc ghim trên bản đồ để xem chi tiết
          </p>
        </div>
      </div>

      {/* Cards list container */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {cafes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-xl glass text-foreground shadow-glass">
              <Coffee className="size-7 stroke-[1.8] text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Không tìm thấy quán nào</h3>
              <p className="mt-1 max-w-xs text-xs font-medium text-muted-foreground">
                Không có quán cafe nào phù hợp với các tiêu chí lọc hiện tại. Thử bỏ bớt bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>
            {onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glass-sm hover:-translate-y-0.5 hover:shadow-glass active:translate-y-0"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        ) : (
          cafes.map((cafe) => (
            <div
              key={cafe.placeId}
              ref={(ref) => {
                if (ref) {
                  cardRefs.current[cafe.placeId] = ref;
                } else {
                  delete cardRefs.current[cafe.placeId];
                }
              }}
            >
              <MapCafeCard
                cafe={cafe}
                isSelected={selectedPlaceId === cafe.placeId}
                isHovered={hoveredPlaceId === cafe.placeId}
                onSelect={() => onSelectCafe(cafe.placeId)}
                onHover={(hovering) => onHoverCafe(hovering ? cafe.placeId : null)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
