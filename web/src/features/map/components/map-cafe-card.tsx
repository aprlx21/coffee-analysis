"use client";

import Link from "next/link";
import { ArrowRight, Coffee, Laptop, MapPin, Plug, Snowflake, Star, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { resizeGoogleImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { CafeCard } from "@/server/db";

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

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      data-place-id={cafe.placeId}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 rounded-lg border-2 border-border p-3.5 text-card-foreground transition-all select-none",
        isSelected
          ? "translate-x-[-2px] translate-y-[-2px] border-foreground bg-primary/15 ring-2 shadow-hard-card ring-primary"
          : isHovered
            ? "-translate-x-0.5 -translate-y-0.5 border-foreground bg-muted/50 shadow-hard-card"
            : "bg-card shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-foreground hover:bg-muted/30 hover:shadow-hard-card",
      )}
    >
      <div className="flex gap-3">
        {/* Cover thumbnail */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md border-2 border-border bg-muted sm:size-24">
          {cafe.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resizeGoogleImage(cafe.featuredImage, 240, 240) ?? undefined}
              alt={cafe.name}
              loading="lazy"
              className="size-full object-cover text-transparent transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-primary/20">
              <Coffee className="size-6 stroke-[2] text-foreground/50" />
            </div>
          )}

          {/* Rating tag overlay on image */}
          {ratingText && (
            <div className="absolute top-1 left-1 flex items-center gap-0.5 rounded border border-border bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground shadow-hard-sm">
              <Star className="size-2.5 fill-foreground stroke-foreground" />
              <span>{ratingText}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden">
          <div>
            {/* Category / Work score badges */}
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              {cafe.mainCategory && (
                <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                  {cafe.mainCategory}
                </span>
              )}
              {cafe.workScore !== null && cafe.workScore > 0 && (
                <span className="py-0.2 rounded border border-border bg-primary/30 px-1 text-[9px] font-black text-foreground">
                  💻 {cafe.workScore}/100
                </span>
              )}
            </div>

            {/* Name */}
            <h3 className="line-clamp-1 font-heading text-sm leading-tight font-extrabold text-foreground group-hover:text-foreground">
              {cafe.name}
            </h3>

            {/* Address */}
            <div className="mt-1 line-clamp-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0 stroke-[2.5]" />
              <span className="truncate">{cafe.shortAddress || cafe.address || "An Thượng, Đà Nẵng"}</span>
            </div>
          </div>

          {/* Bottom row: Price & Reviews */}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-1.5 text-xs">
            <span className="font-mono font-bold text-foreground">{priceDisplay || "Chưa có giá"}</span>

            {cafe.reviews !== null && cafe.reviews > 0 && (
              <span className="text-[11px] font-medium text-muted-foreground">({cafe.reviews} đánh giá)</span>
            )}
          </div>
        </div>
      </div>

      {/* Amenities Chips row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {cafe.hasWifi && (
          <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px] font-bold">
            <Wifi className="mr-1 size-2.5 stroke-[2.5]" />
            Wi-Fi
          </Badge>
        )}
        {cafe.hasAc && (
          <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px] font-bold">
            <Snowflake className="mr-1 size-2.5 stroke-[2.5]" />
            Máy lạnh
          </Badge>
        )}
        {cafe.hasOutlets && (
          <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px] font-bold">
            <Plug className="mr-1 size-2.5 stroke-[2.5]" />Ổ cắm
          </Badge>
        )}
        {cafe.laptopFriendly && (
          <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[10px] font-bold">
            <Laptop className="mr-1 size-2.5 stroke-[2.5]" />
            Làm việc
          </Badge>
        )}

        {/* View detail link button */}
        <Link
          href={`/quan/${cafe.placeId}`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            buttonVariants({ variant: "ghost", size: "xs" }),
            "ml-auto text-[11px] font-bold text-foreground hover:border-border hover:bg-primary",
          )}
        >
          <span>Chi tiết</span>
          <ArrowRight className="ml-1 size-3 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
