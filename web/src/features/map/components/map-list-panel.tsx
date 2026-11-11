"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Coffee, RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CafeFilters } from "@/features/cafes/schema";
import type { CafeCard, Facets } from "@/server/db";
import { MapCafeCard } from "./map-cafe-card";
import { MapFilterSheet } from "./map-filter-sheet";
import { MapQuickFilters } from "./map-quick-filters";

interface MapListPanelProps {
  cafes: CafeCard[];
  total: number;
  facets: Facets;
  filters: CafeFilters;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
  onHoverCafe: (placeId: string | null) => void;
}

export function MapListPanel({
  cafes,
  total,
  facets,
  filters,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectCafe,
  onHoverCafe,
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

  const hasActiveFilters =
    Boolean(filters.amenities?.length) ||
    Boolean(filters.priceRange?.length) ||
    Boolean(filters.minRating) ||
    Boolean(filters.q);

  return (
    <div className="flex size-full flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <div className="flex shrink-0 flex-col gap-2.5 border-b-2 border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-black tracking-tight text-foreground sm:text-xl">
                {total} quán trên bản đồ
              </h2>
              <Badge variant="default" className="text-[10px] font-black">
                AN THƯỢNG
              </Badge>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              Nhấp vào quán hoặc ghim trên bản đồ để xem chi tiết
            </p>
          </div>

          <MapFilterSheet filters={filters} facets={facets} totalResults={total} />
        </div>

        {/* Quick Filter Pills */}
        <MapQuickFilters />
      </div>

      {/* Cards list container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {cafes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-lg border-2 border-border bg-muted text-foreground shadow-hard">
              <Coffee className="size-7 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Không tìm thấy quán nào</h3>
              <p className="mt-1 max-w-xs text-xs font-medium text-muted-foreground">
                Không có quán cafe nào phù hợp với các tiêu chí lọc hiện tại. Thử bỏ bớt bộ lọc để xem nhiều kết quả
                hơn.
              </p>
            </div>
            {hasActiveFilters && (
              <Link
                href="/ban-do"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-2 text-xs font-bold shadow-hard-sm",
                )}
              >
                <RotateCcw className="mr-1 size-3.5 stroke-[2.5]" />
                Xoá tất cả bộ lọc
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cafes.map((cafe) => (
              <div
                key={cafe.placeId}
                ref={(el) => {
                  if (el) {
                    cardRefs.current[cafe.placeId] = el;
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
