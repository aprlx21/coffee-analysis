import { Tag } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReviewKeyword } from "../types";

interface ReviewKeywordsProps {
  reviewKeywords: unknown;
  className?: string;
}

function parseKeywords(raw: unknown): ReviewKeyword[] {
  if (!Array.isArray(raw)) return [];
  const list: ReviewKeyword[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if ("keyword" in obj && obj.keyword) {
        list.push({
          keyword: String(obj.keyword),
          count: Number(obj.count ?? 1),
        });
      }
    }
  }
  return list;
}

export function ReviewKeywords({ reviewKeywords, className }: ReviewKeywordsProps) {
  const keywords = parseKeywords(reviewKeywords);

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div data-slot="review-keywords-card" className={cn("rounded-xl glass p-4 shadow-glass-card sm:p-6", className)}>
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Tag className="size-5 stroke-[2.5] text-foreground" />
        <h2 className="font-heading text-lg font-bold text-foreground">Từ khóa được nhắc nhiều ({keywords.length})</h2>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <span
            key={kw.keyword}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-foreground shadow-glass-sm transition-transform hover:-translate-y-0.5 hover:shadow-glass-lg"
          >
            <span>#{kw.keyword}</span>
            <span className="font-mono text-[10px] text-muted-foreground">({kw.count})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
