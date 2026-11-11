import Link from "next/link";
import { ArrowLeft, Laptop, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Cafe } from "@/server/db/types";
import { cn } from "@/lib/utils";

import { CafeActionButtons } from "./cafe-action-buttons";
import { CafeImage } from "./cafe-image";
import { RatingDistribution } from "./rating-distribution";

interface CafeHeaderProps {
  cafe: Cafe;
  className?: string;
}

export function CafeHeader({ cafe, className }: CafeHeaderProps) {
  return (
    <div data-slot="cafe-header" className={cn("space-y-6", className)}>
      {/* Top row: Back button */}
      <div>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 font-bold shadow-hard-sm")}
        >
          <ArrowLeft className="size-4 stroke-[2.5]" />
          <span>Quay lại khám phá</span>
        </Link>
      </div>

      {/* Main hero grid: image on left/top, info on right */}
      <div className="grid gap-6 md:grid-cols-12 md:items-start">
        {/* Left column: Featured Image */}
        <div className="md:col-span-5 lg:col-span-5">
          <CafeImage src={cafe.featuredImage} name={cafe.name} />
        </div>

        {/* Right column: Title, badges, address, actions */}
        <div className="flex flex-col justify-between space-y-4 md:col-span-7 lg:col-span-7">
          <div className="space-y-3">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {cafe.workScore !== null && cafe.workScore > 0 ? (
                <Badge
                  variant="default"
                  className="gap-1.5 border-2 border-border bg-primary px-3 py-1 text-xs font-black text-primary-foreground uppercase shadow-hard-sm"
                >
                  <Laptop className="size-3.5 stroke-[2.5]" />
                  <span>LÀM VIỆC TỐT: {cafe.workScore}/100</span>
                </Badge>
              ) : null}

              {cafe.mainCategory ? (
                <Badge
                  variant="secondary"
                  className="border-2 border-border bg-secondary px-2.5 py-1 text-xs font-bold text-foreground shadow-hard-sm"
                >
                  {cafe.mainCategory}
                </Badge>
              ) : null}

              {cafe.priceRange ? (
                <Badge
                  variant="outline"
                  className="border-2 border-border bg-card px-2.5 py-1 font-mono text-xs font-bold text-foreground shadow-hard-sm"
                >
                  {cafe.priceRange}
                </Badge>
              ) : null}
            </div>

            {/* Cafe Name */}
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {cafe.name}
            </h1>

            {/* Address */}
            <div className="flex items-start gap-2 text-sm font-semibold text-muted-foreground">
              <MapPin className="mt-0.5 size-4.5 shrink-0 stroke-[2.5] text-foreground" />
              <span>{cafe.address || "Khu phố Tây An Thượng, Mỹ An, Ngũ Hành Sơn, Đà Nẵng"}</span>
            </div>

            {cafe.description ? (
              <p className="text-sm leading-relaxed font-medium text-muted-foreground">{cafe.description}</p>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <CafeActionButtons mapsLink={cafe.mapsLink} phone={cafe.phone} website={cafe.website} />
          </div>
        </div>
      </div>

      {/* Rating distribution section */}
      <div className="pt-2">
        <RatingDistribution rating={cafe.rating} reviews={cafe.reviews} reviewsPerRating={cafe.reviewsPerRating} />
      </div>
    </div>
  );
}
