import { Suspense } from "react";
import type { Metadata } from "next";
import { Coffee, Loader2 } from "lucide-react";

import { parseCafeFilters } from "@/features/cafes/schema";
import { MapPageView } from "@/features/map";
import { getFacets, getMapPoints, listCafes } from "@/server/db";

export const metadata: Metadata = {
  title: "Bản đồ quán cafe An Thượng",
  description:
    "Bản đồ tương tác hơn 115 quán cafe tại khu phố Tây An Thượng Đà Nẵng với bộ lọc tiện ích và bảng giá chi tiết.",
};

interface BanDoPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function MapPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] p-2 sm:p-4 md:p-6">
      <div className="relative flex h-[calc(100dvh-3.5rem-5.5rem)] w-full flex-col overflow-hidden rounded-xl border-2 border-border bg-card shadow-hard-card md:h-[calc(100vh-6rem)] md:flex-row">
        {/* Left skeleton (map) */}
        <div className="relative flex size-full items-center justify-center border-border bg-muted md:w-[58%] md:border-r-2">
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-border bg-card p-6 text-center shadow-hard">
            <div className="flex size-12 items-center justify-center rounded-lg border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
              <Coffee className="size-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Đang tải bản đồ An Thượng</h3>
              <p className="text-xs font-medium text-muted-foreground">Đang đồng bộ dữ liệu quán cafe...</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Loader2 className="size-4 animate-spin stroke-[2.5]" />
              <span>Vui lòng đợi giây lát</span>
            </div>
          </div>
        </div>

        {/* Right skeleton (list) */}
        <div className="hidden size-full flex-col bg-background p-4 md:flex md:w-[42%]">
          <div className="mb-4 h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg border-2 border-border bg-card p-3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function BanDoContent({ searchParams }: BanDoPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseCafeFilters(resolvedSearchParams);

  // Fetch map points, first page of cafes, and facets concurrently
  const [mapPoints, firstPage, facets] = await Promise.all([
    getMapPoints(filters),
    listCafes(filters, filters.sort, 1),
    getFacets(),
  ]);

  // Fetch remaining pages so all markers have matching cards in the list
  let allCafes = firstPage.items;
  if (firstPage.pageCount > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.pageCount - 1 }, (_, i) => listCafes(filters, filters.sort, i + 2)),
    );
    allCafes = [...allCafes, ...remainingPages.flatMap((page) => page.items)];
  }

  return <MapPageView points={mapPoints} cafes={allCafes} total={mapPoints.length} facets={facets} filters={filters} />;
}

export default function BanDoPage({ searchParams }: BanDoPageProps) {
  return (
    <Suspense fallback={<MapPageSkeleton />}>
      <BanDoContent searchParams={searchParams} />
    </Suspense>
  );
}
