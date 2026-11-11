import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface CafeSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

export function CafeSkeleton({ count = 6, viewMode = "grid" }: CafeSkeletonProps) {
  return (
    <div
      className={cn(
        viewMode === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4",
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col overflow-hidden rounded-xl glass shadow-glass-card">
          {/* Cover image skeleton */}
          <div className="relative aspect-[16/10] w-full border-b border-border bg-muted">
            <Skeleton className="size-full rounded-none" />
          </div>

          {/* Body skeleton */}
          <div className="flex flex-1 flex-col justify-between gap-3 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            <div className="space-y-2 border-t border-border/10 pt-2.5">
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
