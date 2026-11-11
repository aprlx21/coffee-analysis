"use client";

import { useState } from "react";
import { ChevronDown, Coffee, ListFilter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
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
  const [minimized, setMinimized] = useState(false);

  const handleSelectAndClose = (placeId: string) => {
    onSelectCafe(placeId);
    setOpen(false);
  };

  return (
    <>
      {/* Floating navigation trigger for mobile */}
      <div
        className={cn(
          "pointer-events-none absolute z-[999] transition-all duration-200 md:hidden",
          minimized
            ? "right-3 bottom-3 flex items-center justify-end"
            : "inset-x-0 bottom-3 flex items-center justify-center gap-1.5 px-4",
        )}
      >
        <Sheet open={open} onOpenChange={setOpen}>
          {minimized ? (
            /* Minimized state: sleek compact floating action button docked to bottom-right */
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  aria-label={`Xem danh sách ${total} quán cafe`}
                  title={`Xem danh sách ${total} quán cafe`}
                  className="border-glass-border pointer-events-auto relative size-11 rounded-full border glass text-foreground shadow-glass-lg hover:-translate-y-0.5 active:translate-y-0"
                />
              }
            >
              <ListFilter className="size-5 stroke-[2.2] text-primary" />
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-border bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-glass-sm">
                {total}
              </span>
            </SheetTrigger>
          ) : (
            /* Expanded state: centered pill with list button + minimize toggle */
            <div className="border-glass-border/70 flex items-center gap-1.5 rounded-full border glass p-1 shadow-glass-lg backdrop-blur-md">
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="default"
                    size="default"
                    aria-label="Xem danh sách quán cafe"
                    className="pointer-events-auto h-9 gap-2 rounded-full px-4 font-heading text-xs font-bold tracking-wide text-primary-foreground shadow-glass-sm hover:-translate-y-0.5 active:translate-y-0"
                  />
                }
              >
                <ListFilter className="size-3.5" />
                <span>DANH SÁCH ({total})</span>
              </SheetTrigger>

              {/* Minimize button to give 100% unobstructed view of markers at bottom of map */}
              <button
                type="button"
                onClick={() => setMinimized(true)}
                aria-label="Thu gọn thanh điều hướng để xem trọn bản đồ"
                title="Thu gọn thanh điều hướng"
                className="pointer-events-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-card/80 hover:text-foreground active:scale-95"
              >
                <ChevronDown className="size-4 stroke-[2.2]" />
              </button>
            </div>
          )}

          <SheetContent
            side="bottom"
            className="flex h-[75vh] max-h-[85vh] flex-col rounded-t-2xl glass-strong p-0 pb-[env(safe-area-inset-bottom)] shadow-glass-lg"
          >
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
    </>
  );
}
