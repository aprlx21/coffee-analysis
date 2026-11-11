"use client";

import * as React from "react";
import { Coffee, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { BenchmarkDrinkItem } from "@/server/db";

interface BenchmarkMenuProps {
  items: BenchmarkDrinkItem[];
}

function formatVnd(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "—";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

type CategoryTab = "all" | "coffee_vn" | "coffee_machine" | "tea" | "other";

const CATEGORY_MAP: Record<CategoryTab, { label: string; ids?: string[] }> = {
  all: { label: "Tất cả món" },
  coffee_vn: {
    label: "Cà phê Việt",
    ids: ["ca_phe_den", "ca_phe_sua", "bac_xiu", "ca_phe_muoi", "ca_phe_dua", "ca_phe_trung"],
  },
  coffee_machine: {
    label: "Pha máy & Cold Brew",
    ids: ["americano", "espresso", "latte", "cappuccino", "flat_white", "mocha", "caramel_macchiato", "cold_brew"],
  },
  tea: {
    label: "Trà & Matcha",
    ids: [
      "tra_dao",
      "tra_chanh",
      "tra_tac",
      "tra_vai",
      "tra_sen_vang",
      "tra_xanh",
      "hong_tra",
      "tra_sua_tran_chau",
      "matcha_latte",
    ],
  },
  other: {
    label: "Nước ép & Khác",
    ids: [
      "nuoc_cam",
      "nuoc_dua",
      "chanh_day",
      "soda_chanh",
      "sinh_to_bo",
      "sinh_to_dau",
      "sinh_to_xoai",
      "sua_chua",
      "cacao",
    ],
  },
};

export function BenchmarkMenu({ items }: BenchmarkMenuProps) {
  const [search, setSearch] = React.useState("");
  const [selectedTab, setSelectedTab] = React.useState<CategoryTab>("all");

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // 1. Filter by category
      if (selectedTab !== "all") {
        const allowedIds = CATEGORY_MAP[selectedTab].ids ?? [];
        if (!allowedIds.includes(item.canonicalId)) {
          return false;
        }
      }

      // 2. Filter by search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return item.displayName.toLowerCase().includes(q) || item.canonicalId.toLowerCase().includes(q);
      }

      return true;
    });
  }, [items, search, selectedTab]);

  return (
    <div className="rounded-lg border-2 border-border bg-card p-6 shadow-hard-card md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
              <Coffee className="size-4 stroke-[2.5]" />
            </div>
            <h2 className="font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              Bảng Giá Đồ Uống Điển Hình Toàn Khu
            </h2>
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Phân tích giá thị trường (Min - Median - Max) trích xuất từ OCR thực đơn 76 quán cafe tại An Thượng
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 stroke-[2.5] text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm món đồ uống..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-medium"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_MAP) as CategoryTab[]).map((tabKey) => {
          const active = selectedTab === tabKey;
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setSelectedTab(tabKey)}
              className={`cursor-pointer rounded-full border-2 border-border px-3.5 py-1 text-xs font-bold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-hard-sm"
                  : "bg-surface text-foreground hover:bg-muted"
              }`}
            >
              {CATEGORY_MAP[tabKey].label}
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border-2 border-border bg-card shadow-hard-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b-2 border-border bg-muted/70 text-xs font-extrabold tracking-wide text-foreground uppercase">
            <tr>
              <th scope="col" className="px-4 py-3.5">
                Món đồ uống
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                Số quán có món
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Giá thấp nhất
              </th>
              <th scope="col" className="bg-primary/20 px-4 py-3.5 text-right">
                Giá trung vị (Median)
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Giá cao nhất
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center font-medium text-muted-foreground">
                  Không tìm thấy món đồ uống phù hợp với từ khóa &quot;{search}&quot;.
                </td>
              </tr>
            ) : (
              filteredItems.map((drink) => (
                <tr key={drink.canonicalId} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-heading font-bold text-foreground">{drink.displayName}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{drink.canonicalId}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="font-mono text-xs font-bold">
                      {drink.shopCount} quán
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-muted-foreground">
                    {formatVnd(drink.priceMin)}
                  </td>
                  <td className="bg-primary/10 px-4 py-3 text-right font-mono text-base font-extrabold text-foreground">
                    {formatVnd(drink.priceMedian)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-muted-foreground">
                    {formatVnd(drink.priceMax)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Hiển thị {filteredItems.length} món đồ uống được chuẩn hoá qua mô hình OCR.</span>
        <span className="font-semibold text-foreground">
          💡 Cột Giá trung vị (Median) phản ánh mức giá phổ biến thực tế nhất của thị trường.
        </span>
      </div>
    </div>
  );
}
