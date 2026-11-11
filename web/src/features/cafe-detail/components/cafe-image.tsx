"use client";

import { useState } from "react";
import { Coffee } from "lucide-react";

import { resizeGoogleImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";

interface CafeImageProps {
  src: string | null;
  name: string;
  className?: string;
}

export function CafeImage({ src, name, className }: CafeImageProps) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  if (!src || hasError) {
    return (
      <div
        data-slot="cafe-image-fallback"
        className={cn(
          "border-glass-border relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br from-primary/20 via-card/85 to-accent/25 p-6 shadow-glass-card select-none md:aspect-4/3",
          className,
        )}
      >
        {/* Soft decorative background blurs */}
        <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-primary/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 size-36 rounded-full bg-accent/30 blur-2xl" />

        <div className="border-glass-border relative z-10 flex size-20 items-center justify-center rounded-2xl border glass text-primary shadow-glass">
          <Coffee className="size-10 stroke-[2.2]" />
        </div>
        <h3 className="relative z-10 mt-3 line-clamp-1 max-w-[90%] font-heading text-base font-bold text-foreground">
          {name}
        </h3>
        <div className="relative z-10 mt-1 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <span>Khu phố Tây An Thượng · Đà Nẵng</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="cafe-image-container"
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted shadow-glass-card md:aspect-4/3",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={resizeGoogleImage(src, 960, 720) ?? src}
        alt={name}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover text-transparent transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}
