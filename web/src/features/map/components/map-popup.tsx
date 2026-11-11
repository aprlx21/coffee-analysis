"use client";

import Link from "next/link";
import { ArrowRight, Coffee, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { resizeGoogleImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";
import type { MapPoint } from "../types";

interface MapPopupProps {
  point: MapPoint;
}

export function MapPopup({ point }: MapPopupProps) {
  const ratingText = point.rating ? point.rating.toFixed(1) : null;

  return (
    <div className="flex flex-col bg-card text-foreground">
      {/* Thumbnail or placeholder */}
      <div className="relative h-28 w-full overflow-hidden border-b-2 border-border bg-muted">
        {point.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resizeGoogleImage(point.featuredImage, 480, 240) ?? undefined}
            alt={point.name}
            loading="lazy"
            className="size-full object-cover text-transparent transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/20">
            <Coffee className="size-8 stroke-[2] text-foreground/60" />
          </div>
        )}

        {/* Rating badge overlay */}
        {ratingText && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md border-2 border-border bg-primary px-2 py-0.5 text-xs font-black text-primary-foreground shadow-hard-sm">
            <Star className="size-3 fill-foreground stroke-foreground" />
            <span>{ratingText}</span>
          </div>
        )}

        {/* Price range badge overlay */}
        {point.priceRange && (
          <div className="absolute right-2 bottom-2 rounded-md border-2 border-border bg-card px-2 py-0.5 text-[10px] font-bold text-foreground shadow-hard-sm">
            {point.priceRange}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="flex flex-col gap-2 p-3">
        <h4
          className="line-clamp-1 font-heading text-sm leading-snug font-extrabold text-foreground"
          title={point.name}
        >
          {point.name}
        </h4>

        {/* Quick action button */}
        <div className="pt-1">
          <Link
            href={`/quan/${point.placeId}`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-full justify-between text-xs font-bold shadow-hard-sm",
            )}
          >
            <span>XEM CHI TIẾT</span>
            <ArrowRight className="size-3.5 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
