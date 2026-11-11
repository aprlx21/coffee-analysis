"use client";

import Link from "next/link";
import { ArrowRight, Coffee, MapPin, Plug, Snowflake, Star, Trees, Wifi } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { resizeGoogleImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { CafeCard } from "@/server/db";
import { spatialCluster } from "../lib/classify";

interface MapCafeCardProps {
  cafe: CafeCard;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}

function formatPrice(val: number | null): string | null {
  if (val === null || val === undefined) return null;
  return `${Math.round(val / 1000)}k`;
}

export function MapCafeCard({ cafe, isSelected, isHovered, onSelect, onHover }: MapCafeCardProps) {
  const ratingText = cafe.rating ? cafe.rating.toFixed(1) : null;
  const minPrice = formatPrice(cafe.drinkPriceMin);
  const maxPrice = formatPrice(cafe.drinkPriceMax);
  const priceDisplay = minPrice && maxPrice ? `${minPrice} - ${maxPrice}` : cafe.priceRange;
  const cluster = spatialCluster(cafe.lat, cafe.lng);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      data-place-id={cafe.placeId}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border p-3.5 text-card-foreground transition-all duration-200 select-none",
        isSelected
          ? "-translate-y-0.5 border-primary/60 glass-strong ring-2 shadow-glass-lg ring-primary/40"
          : isHovered
            ? "-translate-y-0.5 border-border glass-strong shadow-glass-lg"
            : "glass shadow-glass hover:-translate-y-0.5 hover:glass-strong hover:shadow-glass-lg",
      )}
    >
      <div className="flex gap-3">
        {/* Cover thumbnail */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted sm:size-24">
          {cafe.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resizeGoogleImage(cafe.featuredImage, 240, 240) ?? undefined}
              alt={cafe.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-primary/10">
              <Coffee className="size-6 stroke-[1.8] text-foreground/40" />
            </div>
          )}

          {/* Rating tag overlay on image */}
          {ratingText && (
            <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded-md glass-strong px-1.5 py-0.5 text-[10px] font-bold text-foreground shadow-glass-sm">
              <Star className="size-2.5 fill-amber-500 text-amber-500" />
              <span>{ratingText}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden">
          <div>
            {/* Badges: Cluster + Category + Work score */}
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white shadow-xs"
                style={{ backgroundColor: cluster.color }}
              >
                {cluster.shortLabel}
              </span>
              {cafe.mainCategory && (
                <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                  {cafe.mainCategory}
                </span>
              )}
              {cafe.workScore !== null && cafe.workScore > 0 && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-foreground">
                  💻 {cafe.workScore}/100
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="line-clamp-1 font-heading text-sm font-bold text-foreground transition-colors group-hover:text-primary">
              {cafe.name}
            </h3>

            {/* Address */}
            <div className="mt-1 line-clamp-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0 text-primary" />
              <span className="truncate">{cafe.shortAddress || cafe.address || "An Thượng, Đà Nẵng"}</span>
            </div>
          </div>

          {/* Price Range & Quick Link */}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-1.5 text-xs">
            <span className="font-mono text-xs font-semibold text-foreground">
              {priceDisplay ? priceDisplay : "Chưa có giá"}
            </span>

            <Link
              href={`/quan/${cafe.placeId}`}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-6 px-2 text-[11px] font-bold text-primary hover:bg-primary/10 hover:text-primary",
              )}
            >
              <span>Chi tiết</span>
              <ArrowRight className="ml-0.5 size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Facilities row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {(cafe.hasWifi || cafe.laptopFriendly) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            <Wifi className="size-2.5 text-primary" />
            <span>Wifi</span>
          </span>
        )}
        {cafe.hasAc && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            <Snowflake className="size-2.5 text-sky-500" />
            <span>Máy lạnh</span>
          </span>
        )}
        {cafe.hasOutlets && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            <Plug className="size-2.5 text-amber-500" />
            <span>Ổ cắm</span>
          </span>
        )}
        {cafe.outdoorSeating && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            <Trees className="size-2.5 text-emerald-500" />
            <span>Ngoài trời</span>
          </span>
        )}
        {cafe.petFriendly && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
            <span>🐾 Thú cưng</span>
          </span>
        )}
      </div>
    </div>
  );
}
