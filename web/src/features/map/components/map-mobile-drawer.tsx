"use client";

import { useState } from "react";
import { Coffee, ListFilter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CafeFilters } from "@/features/cafes/schema";
import type { CafeCard, Facets } from "@/server/db";
import { MapCafeCard } from "./map-cafe-card";
import { MapFilterSheet } from "./map-filter-sheet";
import { MapQuickFilters } from "./map-quick-filters";

interface MapMobileDrawerProps {
  cafes: CafeCard[];
  total: number;
  facets: Facets;
  filters: CafeFilters;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
  onHoverCafe: (placeId: string | null) => void;
}

export function MapMobileDrawer({
  cafes,
  total,
  facets,
  filters,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectCafe,
  onHoverCafe,
}: MapMobileDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleSelectAndClose = (placeId: string) => {
    onSelectCafe(placeId);
    setOpen(false);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[999] flex items-center justify-center gap-2 px-4 md:hidden">
      {/* List bottom sheet trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="default"
              size="default"
              aria-label="Xem danh sách quán"
              className="pointer-events-auto h-11 gap-2 rounded-full border-2 border-border bg-primary px-5 font-heading text-xs font-black tracking-wide text-primary-foreground shadow-hard-card active:translate-x-[2px] active:translate-y-[2px]"
            />
          }
        >
          <ListFilter className="size-4 stroke-[2.5]" />
          <span>DANH SÁCH ({total})</span>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="flex h-[80vh] flex-col rounded-t-xl border-t-2 border-border bg-background p-0 shadow-hard-lg"
        >
          {/* Header */}
          <SheetHeader className="border-b-2 border-border bg-card p-4">
            <div className="flex items-center justify-between pr-8">
              <div>
                <SheetTitle className="font-heading text-base font-black text-foreground">
                  {total} quán trên bản đồ
                </SheetTitle>
                <SheetDescription className="text-xs font-medium text-muted-foreground">
                  Khu phố Tây An Thượng, Đà Nẵng
                </SheetDescription>
              </div>
              <Badge variant="default" className="text-[10px] font-bold">
                AN THƯỢNG
              </Badge>
            </div>

            {/* Quick Filter Pills in mobile sheet */}
            <div className="pt-2">
              <MapQuickFilters />
            </div>
          </SheetHeader>

          {/* List */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {cafes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Coffee className="size-8 stroke-[2] text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Không tìm thấy quán nào</p>
                <p className="text-xs text-muted-foreground">Vui lòng điều chỉnh lại bộ lọc</p>
              </div>
            ) : (
              cafes.map((cafe) => (
                <MapCafeCard
                  key={cafe.placeId}
                  cafe={cafe}
                  isSelected={selectedPlaceId === cafe.placeId}
                  isHovered={hoveredPlaceId === cafe.placeId}
                  onSelect={() => handleSelectAndClose(cafe.placeId)}
                  onHover={(hovering) => onHoverCafe(hovering ? cafe.placeId : null)}
                />
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick Filter button on mobile bottom bar */}
      <div className="pointer-events-auto">
        <MapFilterSheet filters={filters} facets={facets} totalResults={total} />
      </div>
    </div>
  );
}
