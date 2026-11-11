"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface CafePaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (newPage: number) => void;
}

export function CafePagination({ page, pageCount, onPageChange }: CafePaginationProps) {
  if (pageCount <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");

      const start = Math.max(2, page - 1);
      const end = Math.min(pageCount - 1, page + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < pageCount - 2) pages.push("ellipsis");
      pages.push(pageCount);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Phân trang"
      className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row"
    >
      <div className="font-mono text-xs font-bold text-muted-foreground">
        Trang <span className="text-foreground">{page}</span> / <span className="text-foreground">{pageCount}</span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="gap-1 font-bold"
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        {/* Desktop Page Numbers */}
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span key={`ell-${idx}`} className="px-2 font-mono text-xs font-bold text-muted-foreground">
                  …
                </span>
              );
            }
            const isActive = p === page;
            return (
              <Button
                key={p}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className={`size-8 p-0 font-mono text-xs font-bold ${
                  isActive ? "bg-primary text-primary-foreground shadow-glass-sm" : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="gap-1 font-bold"
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
