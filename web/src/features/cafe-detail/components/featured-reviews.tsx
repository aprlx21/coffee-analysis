import { MessageSquareQuote, Star, User } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FeaturedReview } from "../types";

interface FeaturedReviewsProps {
  featuredReviews: unknown;
  className?: string;
}

function parseReviews(raw: unknown): FeaturedReview[] {
  if (!Array.isArray(raw)) return [];
  const list: FeaturedReview[] = [];
  for (const item of raw) {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      list.push({
        name: String(obj.name || obj.author_title || "Khách hàng"),
        rating: Number(obj.rating ?? 5),
        review_text: String(obj.review_text || obj.text || ""),
        published_at: String(obj.published_at || ""),
      });
    }
  }
  return list.slice(0, 5);
}

export function FeaturedReviews({ featuredReviews, className }: FeaturedReviewsProps) {
  const reviews = parseReviews(featuredReviews);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div
      data-slot="featured-reviews-card"
      className={cn("rounded-lg border-2 border-border bg-card p-4 shadow-hard-card sm:p-6", className)}
    >
      <div className="flex items-center gap-2 border-b-2 border-border pb-4">
        <MessageSquareQuote className="size-5 stroke-[2.5] text-foreground" />
        <h2 className="font-heading text-lg font-bold text-foreground">Đánh giá nổi bật ({reviews.length})</h2>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-1">
        {reviews.map((rev, index) => {
          return (
            <div
              key={index}
              className="bg-surface flex flex-col gap-3 rounded-lg border-2 border-border p-4 shadow-hard-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full border-2 border-border bg-primary font-bold text-primary-foreground">
                    <User className="size-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-foreground">{rev.name}</h4>
                    {rev.published_at ? (
                      <span className="font-mono text-[11px] font-medium text-muted-foreground">
                        {rev.published_at}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5 stroke-border stroke-[2]",
                        i < Math.round(rev.rating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm leading-relaxed font-medium whitespace-pre-line text-foreground">
                {rev.review_text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
