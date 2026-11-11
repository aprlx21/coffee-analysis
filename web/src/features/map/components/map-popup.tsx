"use client";

import Link from "next/link";
import { ArrowRight, Coffee, ExternalLink, Laptop, MapPin, Plug, Snowflake, Star, Users, Wifi } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { resizeGoogleImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { CafeCard } from "@/server/db";
import { industryGroup, priceTier, spatialCluster } from "../lib/classify";

interface MapPopupProps {
  cafe: CafeCard;
}

function formatVnd(val: number | null): string | null {
  if (val === null || val === undefined) return null;
  return `${val.toLocaleString("vi-VN")}đ`;
}

export function MapPopup({ cafe }: MapPopupProps) {
  const cluster = spatialCluster(cafe.lat, cafe.lng);
  const indGroup = industryGroup(cafe.mainCategory);
  const prTier = priceTier(cafe.drinkPriceMedian);
  const ratingText = cafe.rating ? cafe.rating.toFixed(1) : null;
  const medianPriceStr = formatVnd(cafe.drinkPriceMedian);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    cafe.name,
  )}&query_place_id=${cafe.placeId}`;

  return (
    <div className="flex flex-col overflow-hidden text-foreground">
      {/* Cover image or placeholder */}
      <div className="relative h-28 w-full overflow-hidden bg-muted">
        {cafe.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resizeGoogleImage(cafe.featuredImage, 480, 240) ?? undefined}
            alt={cafe.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/10">
            <Coffee className="size-8 stroke-[1.8] text-foreground/40" />
          </div>
        )}

        {/* Rating badge */}
        {ratingText && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md glass-strong px-2 py-0.5 text-xs font-bold text-foreground shadow-glass-sm">
            <Star className="size-3 fill-amber-500 text-amber-500" />
            <span>{ratingText}</span>
            {cafe.reviews !== null && cafe.reviews > 0 && (
              <span className="text-[10px] font-normal text-muted-foreground">({cafe.reviews})</span>
            )}
          </div>
        )}

        {/* Spatial Cluster badge */}
        <div
          className="absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-glass-sm"
          style={{ backgroundColor: cluster.color }}
        >
          {cluster.shortLabel}
        </div>
      </div>

      {/* Info Body */}
      <div className="flex flex-col gap-2 p-3.5">
        <div>
          {/* Industry • Category */}
          <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            {indGroup.label} {cafe.mainCategory ? `• ${cafe.mainCategory}` : ""}
          </div>

          <h4 className="mt-0.5 line-clamp-1 font-heading text-sm font-bold text-foreground" title={cafe.name}>
            {cafe.name}
          </h4>

          {/* Address */}
          <div className="mt-1 line-clamp-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3 shrink-0 text-primary" />
            <span className="truncate">{cafe.shortAddress || cafe.address || "An Thượng, Đà Nẵng"}</span>
          </div>
        </div>

        {/* Price info */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
            {prTier.label}
          </span>
          {medianPriceStr && (
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              Giá trung vị: <span className="font-semibold text-foreground">{medianPriceStr}</span>
            </span>
          )}
        </div>

        {/* Amenities badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {(cafe.hasWifi || cafe.laptopFriendly) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
              <Wifi className="size-2.5 text-primary" />
              <span>Wifi</span>
            </span>
          )}
          {cafe.hasAc && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
              <Snowflake className="size-2.5 text-sky-500" />
              <span>Máy lạnh</span>
            </span>
          )}
          {cafe.hasOutlets && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
              <Plug className="size-2.5 text-amber-500" />
              <span>Ổ cắm</span>
            </span>
          )}
          {cafe.outdoorSeating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
              <Users className="size-2.5 text-emerald-500" />
              <span>Ngoài trời</span>
            </span>
          )}
          {cafe.petFriendly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-foreground">
              <span>🐾 Thú cưng</span>
            </span>
          )}
          {cafe.laptopFriendly && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-foreground">
              <Laptop className="size-2.5 text-primary" />
              <span>Work</span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-1 flex items-center gap-2 border-t border-border/50 pt-1">
          <Link
            href={`/quan/${cafe.placeId}`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "h-8 flex-1 justify-center text-xs font-bold shadow-glass-sm hover:shadow-glass",
            )}
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="ml-1 size-3.5" />
          </Link>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mở Google Maps"
            title="Mở Google Maps"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 glass px-2.5 text-foreground shadow-glass-sm hover:shadow-glass",
            )}
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
