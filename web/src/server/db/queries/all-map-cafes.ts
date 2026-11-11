import "server-only";

import type { CafeFilters, SortKey } from "@/features/cafes/schema";

import type { CafeCard } from "../types";
import { filterCafes, getCafeSnapshot, sortCafes, toCard } from "./snapshot";

/** Toàn bộ quán có toạ độ cho bản đồ — lọc trên snapshot đã cache, không query DB thêm. */
export async function getAllMapCafes(filters: CafeFilters, sort: SortKey = filters.sort): Promise<CafeCard[]> {
  const rows = await filterCafes(await getCafeSnapshot(), filters);
  return sortCafes(
    rows.filter((c) => c.lat !== null && c.lng !== null),
    sort,
  ).map(toCard);
}
