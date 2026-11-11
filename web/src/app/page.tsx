import { Suspense } from "react";
import type { Metadata } from "next";

import { CafeExploreClient, parseCafeFilters } from "@/features/cafes";
import { getFacets, listCafes, listCanonicalItems } from "@/server/db";

export const metadata: Metadata = {
  title: "Khám phá quán cafe An Thượng",
  description: "Tra cứu hơn 115 quán cafe tại khu phố Tây An Thượng Đà Nẵng với đầy đủ tiện ích và khoảng giá.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8">Đang tải...</div>}>
      <HomeContent {...props} />
    </Suspense>
  );
}
