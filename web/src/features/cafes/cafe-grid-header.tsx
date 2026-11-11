"use client";

import { LayoutGrid, List, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CanonicalItem, Facets } from "@/server/db/types";

import { CafeFilterSheet } from "./cafe-filter-sheet";
import { countActiveFilters } from "./cafe-filter-sidebar";
import { AMENITY_MAP, PRICE_RANGE_LABELS, SORT_LABELS } from "./constants";
import type { AmenityKey, CafeFilters, SortKey } from "./schema";

export interface CafeGridHeaderProps {
  total: number;
  filters: CafeFilters;
  facets: Facets;
  canonicalItems: CanonicalItem[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onFilterChange: (updates: Partial<CafeFilters>) => void;
  onReset: () => void;
}

export function CafeGridHeader({
  total,
  filters,
  facets,
  canonicalItems,
  viewMode,
  onViewModeChange,
  onFilterChange,
  onReset,
}: CafeGridHeaderProps) {
  const activeCount = countActiveFilters(filters);

  // Generate list of active chips
  interface FilterChip {
    id: string;
    label: string;
    onRemove: () => void;
  }

  const chips: FilterChip[] = [];

  if (filters.q) {
    chips.push({
      id: "q",
      label: `Tìm: "${filters.q}"`,
      onRemove: () => onFilterChange({ q: undefined }),
    });
  }

  if (filters.amenities?.length) {
    for (const key of filters.amenities) {
      const meta = AMENITY_MAP[key as AmenityKey];
      chips.push({
        id: `amenity-${key}`,
        label: meta ? `${meta.icon} ${meta.label}` : key,
        onRemove: () => {
          const next = filters.amenities?.filter((k) => k !== key);
          onFilterChange({ amenities: next?.length ? next : undefined });
        },
      });
    }
  }

  if (filters.categories?.length) {
    for (const cat of filters.categories) {
      chips.push({
        id: `cat-${cat}`,
        label: `☕ ${cat}`,
        onRemove: () => {
          const next = filters.categories?.filter((c) => c !== cat);
          onFilterChange({ categories: next?.length ? next : undefined });
        },
      });
    }
  }

  if (filters.priceRange?.length) {
    for (const pr of filters.priceRange) {
      const label = PRICE_RANGE_LABELS[pr] ?? pr;
      chips.push({
        id: `price-${pr}`,
        label: `💰 ${label}`,
        onRemove: () => {
          const next = filters.priceRange?.filter((p) => p !== pr);
          onFilterChange({ priceRange: next?.length ? next : undefined });
        },
      });
    }
  }

  if (filters.minRating !== undefined) {
    chips.push({
      id: "rating",
      label: `★ ≥ ${filters.minRating}`,
      onRemove: () => onFilterChange({ minRating: undefined }),
    });
  }

  if (filters.item) {
    const itemObj = canonicalItems.find((i) => i.canonicalId === filters.item);
    const itemName = itemObj ? itemObj.displayName : filters.item;
    const priceText = filters.maxItemPrice ? ` (≤ ${filters.maxItemPrice.toLocaleString("vi-VN")}đ)` : "";
    chips.push({
      id: "item",
      label: `🥤 ${itemName}${priceText}`,
      onRemove: () => onFilterChange({ item: undefined, maxItemPrice: undefined }),
    });
  }

  return (
    <div className="space-y-4">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          <span className="font-extrabold">{total} quán cafe</span> tại An Thượng
        </h1>
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
          {activeCount > 0
            ? `Đang áp dụng ${activeCount} điều kiện lọc · Sắp xếp theo ${SORT_LABELS[filters.sort]}`
            : "Toàn bộ quán cafe khu phố Tây An Thượng, Đà Nẵng với đầy đủ tiện ích và khoảng giá."}
        </p>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-border bg-card p-3 shadow-hard">
        {/* Left Side: Mobile Filter Sheet button & Result stats */}
        <div className="flex items-center gap-2">
          {/* Mobile Sheet Trigger (hidden on lg where sidebar is visible) */}
          <div className="lg:hidden">
            <CafeFilterSheet
              filters={filters}
              facets={facets}
              canonicalItems={canonicalItems}
              totalResults={total}
              onFilterChange={onFilterChange}
              onReset={onReset}
            />
          </div>

          <span className="hidden font-mono text-xs font-bold text-muted-foreground sm:inline">
            Hiển thị {total} kết quả
          </span>
        </div>

        {/* Right Side: Sort dropdown & View Toggle */}
        <div className="ml-auto flex items-center gap-2.5">
          {/* Sort Select */}
          <div className="flex items-center gap-1.5">
            <span className="hidden text-xs font-bold text-muted-foreground md:inline">Sắp xếp:</span>
            <Select
              value={filters.sort}
              onValueChange={(val) => {
                if (val) onFilterChange({ sort: val as SortKey });
              }}
            >
              <SelectTrigger className="h-9 w-[170px] text-xs sm:w-[190px]">
                <SelectValue placeholder="Sắp xếp theo...">
                  {filters.sort ? SORT_LABELS[filters.sort] : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                <SelectItem value="reviews">Nhiều đánh giá nhất</SelectItem>
                <SelectItem value="work_score">Hợp làm việc nhất</SelectItem>
                <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <ToggleGroup
            value={[viewMode]}
            onValueChange={(val) => {
              const v = val[0];
              if (v === "grid" || v === "list") onViewModeChange(v);
            }}
            className="rounded-lg border-2 border-border bg-background p-0.5"
          >
            <ToggleGroupItem
              value="grid"
              aria-label="Xem dạng lưới thẻ"
              className={`size-8 rounded-md p-0 ${
                viewMode === "grid"
                  ? "bg-primary font-black text-primary-foreground shadow-hard-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4 stroke-[2.2]" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="Xem dạng danh sách"
              className={`size-8 rounded-md p-0 ${
                viewMode === "list"
                  ? "bg-primary font-black text-primary-foreground shadow-hard-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4 stroke-[2.2]" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Active Filter Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-muted-foreground">Đang lọc:</span>
          {chips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-2.5 py-0.5 text-xs font-bold text-foreground shadow-hard-sm"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Xóa lọc ${chip.label}`}
              >
                <X className="size-3 stroke-[2.5]" />
              </button>
            </span>
          ))}

          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="text-xs font-bold text-destructive hover:bg-destructive/10"
          >
            Xóa tất cả ({chips.length})
          </Button>
        </div>
      )}
    </div>
  );
}
