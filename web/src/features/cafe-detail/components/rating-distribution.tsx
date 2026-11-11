import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingDistributionProps {
  rating: number | null;
  reviews: number | null;
  reviewsPerRating: unknown;
  className?: string;
}

export function RatingDistribution({ rating, reviews, reviewsPerRating, className }: RatingDistributionProps) {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumReviews = 0;

  if (typeof reviewsPerRating === "object" && reviewsPerRating !== null) {
    const raw = reviewsPerRating as Record<string, unknown>;
    for (let star = 1; star <= 5; star++) {
      const val = Number(raw[String(star)] ?? 0);
      counts[star] = Number.isFinite(val) ? val : 0;
      sumReviews += counts[star];
    }
  }

  const effectiveTotal = sumReviews > 0 ? sumReviews : (reviews ?? 0);
  const starsList = [5, 4, 3, 2, 1];

  return (
    <div
      data-slot="rating-distribution"
      className={cn("flex flex-col gap-4 rounded-xl glass p-4 shadow-glass-card sm:p-5", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-lg border border-border bg-primary shadow-glass-sm">
            <span className="font-heading text-2xl font-bold text-primary-foreground">
              {rating !== null ? rating.toFixed(1) : "—"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4 stroke-border stroke-[2.5]",
                    rating && i < Math.round(rating)
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted-foreground/30",
                  )}
                />
              ))}
            </div>
            <p className="mt-0.5 text-xs font-bold text-muted-foreground">
              {reviews !== null ? `${reviews.toLocaleString("vi-VN")} lượt đánh giá` : "Chưa có đánh giá"}
            </p>
          </div>
        </div>

        <div className="rounded border border-border bg-muted px-2.5 py-1 text-xs font-bold text-foreground">
          ĐÁNH GIÁ GOOGLE MAPS
        </div>
      </div>

      {effectiveTotal > 0 ? (
        <div className="space-y-2">
          {starsList.map((star) => {
            const count = counts[star] ?? 0;
            const pct = effectiveTotal > 0 ? Math.round((count / effectiveTotal) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2.5 text-xs font-bold">
                <span className="flex w-7 shrink-0 items-center gap-0.5 text-foreground">
                  {star} <Star className="size-3 fill-foreground stroke-none" />
                </span>
                <div className="relative h-3.5 flex-1 overflow-hidden rounded-full border border-border bg-muted">
                  <div
                    className="h-full border-r border-border bg-primary transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] font-semibold text-muted-foreground">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-2 text-center text-xs font-medium text-muted-foreground">
          Chưa có chi tiết phân bố số sao từ Google Maps.
        </p>
      )}
    </div>
  );
}
