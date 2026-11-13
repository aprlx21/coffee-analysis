import { Suspense } from "react";
import type { Metadata } from "next";

import { CoffeeRunningLoader } from "@/components/coffee-running-loader";
import { CafeExploreClient, parseCafeFilters } from "@/features/cafes";
import { getFacets, listCafes, listCanonicalItems } from "@/server/db";

export const metadata: Metadata = {
  title: { absolute: "An Thuong Review" },
  description: "Tra cứu hơn 115 quán cafe tại khu phố Tây An Thượng Đà Nẵng với đầy đủ tiện ích và khoảng giá.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function HomePageSkeleton() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/80 glass-strong p-8 text-center shadow-glass-lg">
        <CoffeeRunningLoader
          size="lg"
          title="Đang tải danh sách quán cafe..."
          subtitle="Cappuccino Ninja đang phi nước đại quét menu 115 quán An Thượng ☕"
        />
      </div>
    </div>
  );
}

async function HomeContent(props: PageProps) {
  const rawParams = await props.searchParams;
  const filters = parseCafeFilters(rawParams);

  const [cafesResult, facets, canonicalItems] = await Promise.all([
    listCafes(filters),
    getFacets(),
    listCanonicalItems(),
  ]);

  return (
    <CafeExploreClient
      initialFilters={filters}
      cafesResult={cafesResult}
      facets={facets}
      canonicalItems={canonicalItems}
    />
  );
}

export default function HomePage(props: PageProps) {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent {...props} />
    </Suspense>
  );
}
