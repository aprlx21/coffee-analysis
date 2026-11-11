"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { Loader2 } from "lucide-react";

import type { CafeListResult, CanonicalItem, Facets } from "@/server/db/types";

import { CafeFilterSidebar } from "./cafe-filter-sidebar";
import { CafeGrid } from "./cafe-grid";
import { CafeGridHeader } from "./cafe-grid-header";
import { CafePagination } from "./cafe-pagination";
import { CafeSkeleton } from "./cafe-skeleton";
import { type CafeFilters, cafeFiltersToSearchParams } from "./schema";

export interface CafeExploreClientProps {
  initialFilters: CafeFilters;
  cafesResult: CafeListResult;
  facets: Facets;
  canonicalItems: CanonicalItem[];
}

export function CafeExploreClient({ initialFilters, cafesResult, facets, canonicalItems }: CafeExploreClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Keep filters synced with initialFilters from server render
  const filters = initialFilters;

  const handleFilterChange = (updates: Partial<CafeFilters>) => {
    const next: CafeFilters = {
      ...filters,
      ...updates,
    };
    // Reset page to 1 whenever any filter other than page changes
    if (!("page" in updates)) {
      next.page = 1;
    }

    const sp = cafeFiltersToSearchParams(next);
    const query = sp.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(targetUrl, { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const handlePageChange = (newPage: number) => {
    const next: CafeFilters = {
      ...filters,
      page: newPage,
    };
    const sp = cafeFiltersToSearchParams(next);
    const query = sp.toString();
    const targetUrl = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(targetUrl, { scroll: true });
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="flex flex-col items-start gap-8 lg:flex-row">
        {/* ======================================================== */}
        {/* Desktop Left Sidebar (>= 1024px, sticky, width 280px)     */}
        {/* ======================================================== */}
        <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] w-72 shrink-0 overflow-y-auto pr-1 lg:block">
          <CafeFilterSidebar
            filters={filters}
            facets={facets}
            canonicalItems={canonicalItems}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </aside>

        {/* ======================================================== */}
        {/* Right Main Content Panel                                 */}
        {/* ======================================================== */}
        <div className="w-full min-w-0 flex-1 space-y-6">
          {/* Header & Controls */}
          <CafeGridHeader
            total={cafesResult.total}
            filters={filters}
            facets={facets}
            canonicalItems={canonicalItems}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />

          {/* Pending transition indicator */}
          <div className="relative">
            {isPending && (
              <div className="absolute -top-3 right-0 z-20 flex animate-pulse items-center gap-1.5 rounded-full border border-border bg-primary px-2.5 py-0.5 text-xs font-black text-primary-foreground shadow-hard-sm">
                <Loader2 className="size-3 animate-spin stroke-[3]" />
                <span>Đang tải...</span>
              </div>
            )}

            {/* Grid / List Results */}
            <div className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {isPending && cafesResult.items.length === 0 ? (
                <CafeSkeleton viewMode={viewMode} count={6} />
              ) : (
                <CafeGrid
                  items={cafesResult.items}
                  viewMode={viewMode}
                  total={cafesResult.total}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>

          {/* Pagination */}
          <CafePagination page={cafesResult.page} pageCount={cafesResult.pageCount} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
