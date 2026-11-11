"use client";

import { useState } from "react";
import { Coffee, ListFilter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CafeCard } from "@/server/db";
import { MapCafeCard } from "./map-cafe-card";

interface MapMobileDrawerProps {
  cafes: CafeCard[];
  total: number;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
  onHoverCafe: (placeId: string | null) => void;
}

export function MapMobileDrawer({
  cafes,
  total,
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
              aria-label="Xem danh sách quán cafe"
              className="pointer-events-auto h-10 gap-2 rounded-full px-5 font-heading text-xs font-bold tracking-wide text-primary-foreground shadow-glass-lg hover:-translate-y-0.5 active:translate-y-0"
            />
          }
        >
          <ListFilter className="size-4" />
          <span>DANH SÁCH ({total})</span>
        </SheetTrigger>

        <SheetContent side="bottom" className="flex h-[80vh] flex-col rounded-t-2xl glass-strong p-0 shadow-glass-lg">
          {/* Header */}
          <SheetHeader className="border-b border-border/70 bg-card/60 p-4">
            <div className="flex items-center justify-between pr-8">
              <div>
                <SheetTitle className="font-heading text-base font-bold text-foreground">
                  {total} quán trên bản đồ
                </SheetTitle>
                <SheetDescription className="text-xs font-medium text-muted-foreground">
                  Khu phố Tây An Thượng, Đà Nẵng
                </SheetDescription>
              </div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-bold text-primary">
                AN THƯỢNG
              </Badge>
            </div>
          </SheetHeader>

          {/* List */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {cafes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Coffee className="size-8 stroke-[1.8] text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Không tìm thấy quán nào</p>
                <p className="text-xs text-muted-foreground">Vui lòng điều chỉnh lại bộ lọc trên bản đồ</p>
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
    </div>
  );
}
