"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AmenityKey, CafeFilters, SortKey } from "@/features/cafes/schema";
import { cafeFiltersToSearchParams } from "@/features/cafes/schema";
import type { Facets } from "@/server/db";

interface MapFilterSheetProps {
  filters: CafeFilters;
  facets: Facets;
  totalResults: number;
}

const AMENITY_LIST: { key: AmenityKey; label: string; icon: string }[] = [
  { key: "has_wifi", label: "Có Wi-Fi", icon: "📶" },
  { key: "laptop_friendly", label: "Ngồi làm việc / Laptop", icon: "💻" },
  { key: "has_ac", label: "Máy lạnh / Điều hòa", icon: "❄️" },
  { key: "has_outlets", label: "Ổ cắm điện", icon: "⚡" },
  { key: "quiet", label: "Không gian yên tĩnh", icon: "🤫" },
  { key: "outdoor_seating", label: "Chỗ ngồi ngoài trời", icon: "🌿" },
  { key: "pet_friendly", label: "Cho phép thú cưng", icon: "🐾" },
  { key: "accepts_card", label: "Thanh toán thẻ", icon: "💳" },
  { key: "accepts_nfc", label: "Apple Pay / NFC", icon: "📱" },
  { key: "has_parking", label: "Bãi đỗ xe", icon: "🛵" },
  { key: "rooftop", label: "Rooftop / Sân thượng", icon: "🏙️" },
  { key: "good_for_kids", label: "Phù hợp trẻ em", icon: "👶" },
];

const RATING_OPTIONS = [
  { value: undefined, label: "Tất cả" },
  { value: 4.0, label: "4.0★ trở lên" },
  { value: 4.5, label: "4.5★ trở lên" },
];

const PRICE_RANGE_OPTIONS = [
  { value: "D1-100,000", label: "Dưới 100k (D1-100,000)" },
  { value: "D100-200K", label: "100k - 200k (D100-200K)" },
  { value: "D200-300K", label: "200k - 300k (D200-300K)" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rating", label: "Đánh giá cao nhất" },
  { value: "reviews", label: "Nhiều review nhất" },
  { value: "work_score", label: "Điểm làm việc cao nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
];

export function MapFilterSheet({ filters, facets, totalResults }: MapFilterSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Local state initialized from filters
  const [q, setQ] = useState(filters.q || "");
  const [amenities, setAmenities] = useState<AmenityKey[]>(filters.amenities || []);
  const [priceRange, setPriceRange] = useState<string[]>(filters.priceRange || []);
  const [minRating, setMinRating] = useState<number | undefined>(filters.minRating);
  const [sort, setSort] = useState<SortKey>(filters.sort || "rating");

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setQ(filters.q || "");
      setAmenities(filters.amenities || []);
      setPriceRange(filters.priceRange || []);
      setMinRating(filters.minRating);
      setSort(filters.sort || "rating");
    }
    setOpen(nextOpen);
  };

  const activeFilterCount =
    (filters.amenities?.length || 0) +
    (filters.priceRange?.length || 0) +
    (filters.minRating ? 1 : 0) +
    (filters.q ? 1 : 0) +
    (filters.sort && filters.sort !== "rating" ? 1 : 0);

  const handleToggleAmenity = (key: AmenityKey) => {
    setAmenities((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleTogglePriceRange = (val: string) => {
    setPriceRange((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const handleReset = () => {
    setQ("");
    setAmenities([]);
    setPriceRange([]);
    setMinRating(undefined);
    setSort("rating");
    startTransition(() => {
      router.push("/ban-do", { scroll: false });
      setOpen(false);
    });
  };

  const handleApply = () => {
    const nextFilters: Partial<CafeFilters> = {
      q: q.trim() || undefined,
      amenities: amenities.length > 0 ? amenities : undefined,
      priceRange: priceRange.length > 0 ? priceRange : undefined,
      minRating: minRating !== undefined ? minRating : undefined,
      sort: sort !== "rating" ? sort : undefined,
    };

    const sp = cafeFiltersToSearchParams(nextFilters);
    startTransition(() => {
      const queryStr = sp.toString();
      router.push(queryStr ? `/ban-do?${queryStr}` : "/ban-do", { scroll: false });
      setOpen(false);
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="default"
            size="sm"
            aria-label="Mở bộ lọc"
            className="gap-1.5 rounded-lg border-2 border-border bg-primary px-3 text-xs font-bold text-primary-foreground shadow-hard active:translate-x-[2px] active:translate-y-[2px]"
          />
        }
      >
        <Filter className="size-3.5 stroke-[2.5]" />
        <span>BỘ LỌC</span>
        {activeFilterCount > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-black text-primary">
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col border-l-2 border-border bg-card p-0 shadow-hard-lg sm:max-w-md"
      >
        <SheetHeader className="border-b-2 border-border bg-muted/40 p-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
              <Filter className="size-4 stroke-[2.5]" />
            </div>
            <div>
              <SheetTitle className="font-heading text-lg font-extrabold text-foreground">Bộ lọc quán cafe</SheetTitle>
              <SheetDescription className="text-xs font-medium text-muted-foreground">
                Khu phố Tây An Thượng · {totalResults} kết quả
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable filter sections */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Keyword search input */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold tracking-wide text-foreground uppercase">
              Tìm theo tên / đường
            </label>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                placeholder="VD: 43 Factory, Ngô Thì Sĩ..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold tracking-wide text-foreground uppercase">Sắp xếp theo</label>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSort(opt.value)}
                  className={cn(
                    "flex items-center justify-between rounded-md border-2 border-border px-3 py-1.5 text-left text-xs font-bold transition-all",
                    sort === opt.value
                      ? "bg-primary text-primary-foreground shadow-hard-sm"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{opt.label}</span>
                  {sort === opt.value && <Sparkles className="size-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tiện ích nổi bật (Checkboxes) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold tracking-wide text-foreground uppercase">
                Tiện ích & Cơ sở vật chất
              </label>
              {amenities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAmenities([])}
                  className="text-[11px] font-bold text-destructive hover:underline"
                >
                  Bỏ chọn ({amenities.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AMENITY_LIST.map((item) => {
                const isChecked = amenities.includes(item.key);
                const count = facets.amenities[item.key] || 0;

                return (
                  <label
                    key={item.key}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-md border-2 border-border p-2 text-xs font-bold transition-all select-none",
                      isChecked
                        ? "border-foreground bg-primary/20 text-foreground shadow-hard-sm"
                        : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={isChecked} onCheckedChange={() => handleToggleAmenity(item.key)} />
                      <span>
                        <span className="mr-1">{item.icon}</span>
                        {item.label}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Đánh giá tối thiểu */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold tracking-wide text-foreground uppercase">
              Đánh giá sao Google
            </label>
            <div className="flex items-center gap-2">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setMinRating(opt.value)}
                  className={cn(
                    "flex-1 rounded-md border-2 border-border py-1.5 text-center text-xs font-bold transition-all",
                    minRating === opt.value
                      ? "bg-primary text-primary-foreground shadow-hard-sm"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Khoảng giá */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold tracking-wide text-foreground uppercase">Khoảng giá</label>
            <div className="flex flex-col gap-1.5">
              {PRICE_RANGE_OPTIONS.map((opt) => {
                const isChecked = priceRange.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border-2 border-border p-2 text-xs font-bold transition-all select-none",
                      isChecked
                        ? "border-foreground bg-primary/20 text-foreground shadow-hard-sm"
                        : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Checkbox checked={isChecked} onCheckedChange={() => handleTogglePriceRange(opt.value)} />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <SheetFooter className="flex flex-row items-center justify-between gap-3 border-t-2 border-border bg-muted/30 p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="flex-1 text-xs font-bold"
          >
            <RotateCcw className="mr-1 size-3.5 stroke-[2.5]" />
            XOÁ BỘ LỌC
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleApply}
            disabled={isPending}
            className="flex-1 text-xs font-bold"
          >
            ÁP DỤNG
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
