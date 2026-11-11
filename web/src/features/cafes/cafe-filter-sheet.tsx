"use client";

import * as React from "react";
import { Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CanonicalItem, Facets } from "@/server/db/types";

import { CafeFilterSidebar, countActiveFilters } from "./cafe-filter-sidebar";
import type { CafeFilters } from "./schema";

export interface CafeFilterSheetProps {
  filters: CafeFilters;
  facets: Facets;
  canonicalItems: CanonicalItem[];
  totalResults: number;
  onFilterChange: (updates: Partial<CafeFilters>) => void;
  onReset: () => void;
}

export function CafeFilterSheet({
  filters,
  facets,
  canonicalItems,
  totalResults,
  onFilterChange,
  onReset,
}: CafeFilterSheetProps) {
  const [open, setOpen] = React.useState(false);
  const activeCount = countActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="sm" className="flex items-center gap-1.5 font-bold shadow-glass-sm" />}
      >
        <Filter className="size-4 stroke-[2.5]" />
        <span>BỘ LỌC</span>
        {activeCount > 0 && (
          <Badge variant="default" className="size-5 justify-center p-0 text-[10px] font-bold">
            {activeCount}
          </Badge>
        )}
      </SheetTrigger>

      <SheetContent side="left" className="flex h-full w-[85vw] max-w-md flex-col p-0">
        <SheetHeader className="border-b border-border bg-card p-4">
          <SheetTitle className="flex items-center gap-2 text-base font-bold uppercase">
            <Filter className="size-4 stroke-[2.5]" />
            Bộ lọc quán cafe
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <CafeFilterSidebar
            filters={filters}
            facets={facets}
            canonicalItems={canonicalItems}
            onFilterChange={onFilterChange}
            onReset={onReset}
            className="border-0 p-0 shadow-none"
          />
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 border-t border-border bg-card p-4 sm:justify-between">
          {activeCount > 0 && (
            <Button variant="outline" size="sm" onClick={onReset} className="flex-1 text-xs font-bold">
              XÓA LỌC
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => setOpen(false)}
            className="flex-1 text-xs font-bold shadow-glass-sm"
          >
            XEM {totalResults} QUÁN
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
