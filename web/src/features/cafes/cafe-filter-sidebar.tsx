"use client";

import * as React from "react";
import { Filter, RotateCcw, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CanonicalItem, Facets } from "@/server/db/types";

import { PAYMENT_AMENITIES, PRICE_RANGE_LABELS, SPACE_AMENITIES, WORK_AMENITIES } from "./constants";
import type { AmenityKey, CafeFilters } from "./schema";

export interface CafeFilterSidebarProps {
  filters: CafeFilters;
  facets: Facets;
  canonicalItems: CanonicalItem[];
  onFilterChange: (updates: Partial<CafeFilters>) => void;
  onReset: () => void;
  className?: string;
}

export function countActiveFilters(f: CafeFilters): number {
  let count = 0;
  if (f.q) count++;
  if (f.amenities?.length) count += f.amenities.length;
  if (f.categories?.length) count += f.categories.length;
  if (f.priceRange?.length) count += f.priceRange.length;
  if (f.minRating !== undefined) count++;
  if (f.item) count++;
  return count;
}

export function CafeFilterSidebar({
  filters,
  facets,
  canonicalItems,
  onFilterChange,
  onReset,
  className,
}: CafeFilterSidebarProps) {
  // Local state for search input to allow smooth typing + debounce
  const [prevQ, setPrevQ] = React.useState(filters.q ?? "");
  const [searchValue, setSearchValue] = React.useState(filters.q ?? "");
  const activeCount = countActiveFilters(filters);

  // Sync search input when external filter changes during render
  if (prevQ !== (filters.q ?? "")) {
    setPrevQ(filters.q ?? "");
    setSearchValue(filters.q ?? "");
  }

  // Debounced search handler
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed !== (filters.q ?? "")) {
        onFilterChange({ q: trimmed || undefined });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, filters.q, onFilterChange]);

  const toggleAmenity = (key: AmenityKey) => {
    const current = new Set(filters.amenities ?? []);
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    const next = Array.from(current);
    onFilterChange({ amenities: next.length > 0 ? next : undefined });
  };

  const toggleCategory = (cat: string) => {
    const current = new Set(filters.categories ?? []);
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    const next = Array.from(current);
    onFilterChange({ categories: next.length > 0 ? next : undefined });
  };

  const togglePriceRange = (range: string) => {
    const current = new Set(filters.priceRange ?? []);
    if (current.has(range)) {
      current.delete(range);
    } else {
      current.add(range);
    }
    const next = Array.from(current);
    onFilterChange({ priceRange: next.length > 0 ? next : undefined });
  };

  const selectedItemObj = canonicalItems.find((i) => i.canonicalId === filters.item);

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-lg border-2 border-border bg-card p-4 text-card-foreground shadow-hard",
        className,
      )}
    >
      {/* Top Header of Sidebar */}
      <div className="flex items-center justify-between border-b-2 border-border pb-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 stroke-[2.5]" />
          <h2 className="font-heading text-sm font-extrabold tracking-wide uppercase">Bộ Lọc</h2>
          {activeCount > 0 && (
            <Badge variant="default" className="size-5 justify-center p-0 text-[10px] font-black">
              {activeCount}
            </Badge>
          )}
        </div>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="text-xs font-bold text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="mr-1 size-3" />
            Xóa lọc
          </Button>
        )}
      </div>

      {/* 1. Search Box */}
      <div className="space-y-1.5">
        <label
          htmlFor="cafe-search"
          className="font-heading text-xs font-extrabold tracking-wider text-muted-foreground uppercase"
        >
          Tìm kiếm quán
        </label>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 stroke-[2.2] text-muted-foreground" />
          <Input
            id="cafe-search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tên quán, tên đường..."
            className="pr-8 pl-9"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                onFilterChange({ q: undefined });
              }}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Xóa từ khóa"
            >
              <X className="size-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Tiện ích Làm việc (Work Amenities) */}
      <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">
            💻 Tiện ích Làm việc
          </h3>
        </div>

        <div className="space-y-1.5">
          {WORK_AMENITIES.map((item) => {
            const isChecked = filters.amenities?.includes(item.key) ?? false;
            const count = facets.amenities[item.key] ?? 0;

            return (
              <div
                key={item.key}
                onClick={() => toggleAmenity(item.key)}
                className="group flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={isChecked} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">
                        {item.icon} {item.label}
                      </span>
                      {item.isInferredFromReview && (
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span
                                  className="cursor-help text-[11px] text-muted-foreground hover:text-foreground"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  ℹ️
                                </span>
                              }
                            />
                            <TooltipContent side="top">
                              <span className="text-xs font-semibold">Suy luận từ review của khách hàng</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {item.isInferredFromReview && (
                      <span className="text-[10px] font-medium text-muted-foreground italic">suy luận từ review</span>
                    )}
                  </div>
                </div>

                <span className="font-mono text-[10px] font-bold text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Tiện ích Không gian (Space Amenities) */}
      <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
        <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">
          🌿 Không gian & Phong cách
        </h3>

        <div className="space-y-1.5">
          {SPACE_AMENITIES.map((item) => {
            const isChecked = filters.amenities?.includes(item.key) ?? false;
            const count = facets.amenities[item.key] ?? 0;

            return (
              <div
                key={item.key}
                onClick={() => toggleAmenity(item.key)}
                className="group flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={isChecked} />
                  <span className="text-xs font-bold text-foreground">
                    {item.icon} {item.label}
                  </span>
                </div>

                <span className="font-mono text-[10px] font-bold text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Thanh toán (Payment) */}
      <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
        <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">💳 Thanh toán</h3>

        <div className="space-y-1.5">
          {PAYMENT_AMENITIES.map((item) => {
            const isChecked = filters.amenities?.includes(item.key) ?? false;
            const count = facets.amenities[item.key] ?? 0;

            return (
              <div
                key={item.key}
                onClick={() => toggleAmenity(item.key)}
                className="group flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={isChecked} />
                  <span className="text-xs font-bold text-foreground">
                    {item.icon} {item.label}
                  </span>
                </div>

                <span className="font-mono text-[10px] font-bold text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Loại hình quán (Categories) */}
      {facets.categories.length > 0 && (
        <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
          <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">
            ☕ Loại hình quán
          </h3>

          <div className="space-y-1.5">
            {facets.categories.slice(0, 6).map((cat) => {
              const isChecked = filters.categories?.includes(cat.value) ?? false;

              return (
                <div
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className="group flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isChecked} />
                    <span className="text-xs font-bold text-foreground">{cat.value}</span>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-muted-foreground">({cat.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Khoảng giá (Price Ranges) */}
      {facets.priceRanges.length > 0 && (
        <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
          <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">
            💰 Khoảng giá
          </h3>

          <div className="space-y-1.5">
            {facets.priceRanges.map((pr) => {
              const isChecked = filters.priceRange?.includes(pr.value) ?? false;
              const displayLabel = PRICE_RANGE_LABELS[pr.value] ?? pr.value;

              return (
                <div
                  key={pr.value}
                  onClick={() => togglePriceRange(pr.value)}
                  className="group flex cursor-pointer items-center justify-between rounded p-1 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isChecked} />
                    <span className="text-xs font-bold text-foreground">{displayLabel}</span>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-muted-foreground">({pr.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Đánh giá tối thiểu (Min Rating) */}
      <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
        <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">
          ⭐ Đánh giá tối thiểu
        </h3>

        <div className="grid grid-cols-3 gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={filters.minRating === undefined ? "default" : "outline"}
            onClick={() => onFilterChange({ minRating: undefined })}
            className="px-2 text-xs font-bold"
          >
            Tất cả
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filters.minRating === 4.0 ? "default" : "outline"}
            onClick={() => onFilterChange({ minRating: filters.minRating === 4.0 ? undefined : 4.0 })}
            className="px-2 text-xs font-bold"
          >
            ★ 4.0+
          </Button>
          <Button
            type="button"
            size="sm"
            variant={filters.minRating === 4.5 ? "default" : "outline"}
            onClick={() => onFilterChange({ minRating: filters.minRating === 4.5 ? undefined : 4.5 })}
            className="px-2 text-xs font-bold"
          >
            ★ 4.5+
          </Button>
        </div>
      </div>

      {/* 8. Món đồ uống & Giá tối đa */}
      <div className="space-y-2.5 border-t-2 border-border/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xs font-extrabold tracking-wider text-foreground uppercase">
            🥤 Món & Giá tối đa
          </h3>
          {filters.item && (
            <button
              type="button"
              onClick={() => onFilterChange({ item: undefined, maxItemPrice: undefined })}
              className="text-[11px] font-bold text-destructive hover:underline"
            >
              Bỏ chọn món
            </button>
          )}
        </div>

        <Select
          value={filters.item ?? null}
          onValueChange={(val) => {
            onFilterChange({
              item: (val as string) || undefined,
              maxItemPrice: val ? (filters.maxItemPrice ?? 45000) : undefined,
            });
          }}
        >
          <SelectTrigger className="w-full text-xs">
            <SelectValue placeholder="Chọn món đồ uống...">
              {(val: string | null) =>
                val ? (canonicalItems.find((i) => i.canonicalId === val)?.displayName ?? val) : "Chọn món đồ uống..."
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {canonicalItems.map((item) => (
              <SelectItem key={item.canonicalId} value={item.canonicalId}>
                {item.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.item && (
          <div className="mt-2 space-y-2 rounded-lg border-2 border-border bg-muted/40 p-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground">Giá tối đa:</span>
              <span className="font-mono text-sm font-black text-foreground">
                {(filters.maxItemPrice ?? 45000).toLocaleString("vi-VN")}đ
              </span>
            </div>

            <Slider
              value={[filters.maxItemPrice ?? 45000]}
              min={15000}
              max={100000}
              step={5000}
              onValueChange={(val) => {
                const num = Array.isArray(val) ? val[0] : val;
                onFilterChange({ maxItemPrice: num });
              }}
            />

            <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>15.000đ</span>
              <span>50.000đ</span>
              <span>100.000đ</span>
            </div>
            {selectedItemObj && (
              <p className="text-[11px] font-medium text-muted-foreground">
                Đang lọc quán có món <span className="font-bold text-foreground">{selectedItemObj.displayName}</span> ≤{" "}
                {(filters.maxItemPrice ?? 45000).toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Reset Button */}
      {activeCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="mt-2 w-full border-2 border-border font-bold shadow-hard-sm"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          XÓA TẤT CẢ BỘ LỌC ({activeCount})
        </Button>
      )}
    </div>
  );
}
