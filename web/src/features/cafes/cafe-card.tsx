"use client";

import Link from "next/link";
import * as React from "react";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { resizeGoogleImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { CafeCard as CafeCardData } from "@/server/db/types";

import { PRICE_RANGE_LABELS } from "./constants";

export interface CafeCardProps {
  cafe: CafeCardData;
  variant?: "default" | "compact";
  className?: string;
}

function formatDrinkPrice(cafe: CafeCardData): string {
  if (cafe.drinkPriceMin != null && cafe.drinkPriceMin > 0) {
    return `Cà phê từ ${cafe.drinkPriceMin.toLocaleString("vi-VN")}đ`;
  }
  if (cafe.drinkPriceMedian != null && cafe.drinkPriceMedian > 0) {
    return `Cà phê ~ ${cafe.drinkPriceMedian.toLocaleString("vi-VN")}đ`;
  }
  if (cafe.priceRange) {
    return PRICE_RANGE_LABELS[cafe.priceRange] ?? cafe.priceRange;
  }
  return "Chưa rõ giá";
}

interface AmenityPill {
  key: string;
  label: string;
  icon: string;
}

function getFeaturedAmenities(cafe: CafeCardData): AmenityPill[] {
  const pills: AmenityPill[] = [];
  if (cafe.hasWifi) pills.push({ key: "wifi", label: "Wi-Fi", icon: "📶" });
  if (cafe.hasAc) pills.push({ key: "ac", label: "Máy lạnh", icon: "❄️" });
  if (cafe.hasOutlets) pills.push({ key: "outlets", label: "Ổ cắm", icon: "🔌" });
  if (cafe.laptopFriendly) pills.push({ key: "laptop", label: "Laptop", icon: "💻" });
  if (cafe.quiet) pills.push({ key: "quiet", label: "Yên tĩnh", icon: "🤫" });
  if (cafe.outdoorSeating) pills.push({ key: "outdoor", label: "Ngoài trời", icon: "🌿" });
  if (cafe.petFriendly) pills.push({ key: "pet", label: "Thú cưng", icon: "🐾" });
  return pills.slice(0, 3);
}

export function CafeCard({ cafe, variant = "default", className }: CafeCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const isWorkFriendly = (cafe.workScore ?? 0) >= 60;
  const isHot = (cafe.reviews ?? 0) >= 300 || ((cafe.rating ?? 0) >= 4.7 && (cafe.reviews ?? 0) >= 50);
  const featuredAmenities = getFeaturedAmenities(cafe);
  const priceDisplay = formatDrinkPrice(cafe);
  const initial = cafe.name ? cafe.name.trim().charAt(0).toUpperCase() : "☕";
  const imageSrc = resizeGoogleImage(cafe.featuredImage, 640, 400);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "group/card relative flex w-full max-w-[280px] flex-col overflow-hidden rounded-lg border-2 border-border bg-card text-card-foreground shadow-hard-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard",
          className,
        )}
      >
        <Link href={`/quan/${cafe.placeId}`} className="block overflow-hidden">
          {/* Thumbnail */}
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-border bg-muted">
            {imageSrc && !imgError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSrc}
                alt={cafe.name}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className="size-full object-cover text-transparent transition-transform duration-300 group-hover/card:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted text-xl font-black text-muted-foreground">
                ☕ {initial}
              </div>
            )}
            {isWorkFriendly && (
              <span className="py-0.2 absolute top-1.5 left-1.5 rounded-full border border-border bg-primary px-1.5 text-[9px] font-black text-primary-foreground uppercase shadow-hard-sm">
                LÀM VIỆC TỐT
              </span>
            )}
          </div>

          {/* Compact Info */}
          <div className="flex flex-col gap-1 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
              <span className="truncate">{cafe.mainCategory || "Quán cafe"}</span>
              <div className="flex items-center gap-0.5 font-mono text-foreground">
                <Star className="size-3 fill-primary stroke-[2] text-primary" />
                <span>{cafe.rating ? cafe.rating.toFixed(1) : "—"}</span>
              </div>
            </div>

            <h4 className="line-clamp-1 font-heading text-sm font-bold text-foreground transition-colors group-hover/card:text-primary">
              {cafe.name}
            </h4>

            <div className="flex items-center justify-between pt-1 font-mono text-[11px] font-bold text-foreground">
              <span className="truncate text-[10px] text-muted-foreground">
                {cafe.shortAddress || cafe.address || "An Thượng"}
              </span>
              <span className="shrink-0 text-foreground">{priceDisplay}</span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-border bg-card text-card-foreground shadow-hard-card transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--border)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm",
        className,
      )}
    >
      <Link
        href={`/quan/${cafe.placeId}`}
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Cover image container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-border bg-muted">
          {imageSrc && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={imageSrc}
              alt={cafe.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="size-full object-cover text-transparent transition-transform duration-300 group-hover/card:scale-105"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center bg-muted p-4 text-center select-none">
              <span className="text-4xl font-black text-muted-foreground/80">{initial}</span>
              <span className="mt-1 text-[11px] font-bold text-muted-foreground">Cafe An Thượng</span>
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
            {isWorkFriendly && (
              <Badge
                variant="default"
                className="border-2 border-border bg-primary text-[10px] font-black tracking-wider text-primary-foreground uppercase shadow-hard-sm"
              >
                💻 LÀM VIỆC TỐT
              </Badge>
            )}
            {isHot && (
              <Badge
                variant="destructive"
                className="border-2 border-border bg-destructive text-[10px] font-black tracking-wider text-primary-foreground uppercase shadow-hard-sm"
              >
                🔥 HOT
              </Badge>
            )}
          </div>

          {/* Work Score Pill */}
          {cafe.workScore != null && cafe.workScore > 0 && (
            <div className="absolute top-2.5 right-2.5 z-10 rounded-md border-2 border-border bg-card/95 px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground shadow-hard-sm">
              💻 {cafe.workScore}/100
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <div className="space-y-1.5">
            {/* Header: Category & Rating */}
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="max-w-[60%] truncate tracking-wider uppercase">{cafe.mainCategory || "Quán cafe"}</span>
              <div className="flex shrink-0 items-center gap-1 font-mono font-bold text-foreground">
                <Star className="size-3.5 fill-primary stroke-[2] text-primary" />
                <span>{cafe.rating ? cafe.rating.toFixed(1) : "—"}</span>
                <span className="font-normal text-muted-foreground">({cafe.reviews ?? 0})</span>
              </div>
            </div>

            {/* Cafe Name */}
            <h3 className="line-clamp-1 font-heading text-lg leading-snug font-bold tracking-tight text-foreground transition-colors group-hover/card:text-primary">
              {cafe.name}
            </h3>

            {/* Address */}
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 stroke-[2.2] text-muted-foreground" />
              <span className="truncate">{cafe.shortAddress || cafe.address || "An Thượng, Ngũ Hành Sơn"}</span>
            </div>
          </div>

          {/* Bottom row: Price and Amenities */}
          <div className="space-y-2 border-t-2 border-border/10 pt-2.5">
            {/* Price row */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-foreground">{priceDisplay}</span>
            </div>

            {/* Amenities pills (max 3) */}
            {featuredAmenities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {featuredAmenities.map((amenity) => (
                  <span
                    key={amenity.key}
                    className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-foreground"
                  >
                    {amenity.icon} {amenity.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
