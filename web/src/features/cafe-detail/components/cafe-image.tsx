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
  const [hasError, setHasError] = useState(false);
  const initialChar = name.trim().charAt(0).toUpperCase() || "C";

  if (!src || hasError) {
    return (
      <div
        data-slot="cafe-image-fallback"
        className={cn(
          "flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-border bg-primary/25 p-6 shadow-glass-card md:aspect-4/3",
          className,
        )}
      >
        <div className="flex size-20 items-center justify-center rounded-lg border border-border bg-primary font-heading text-3xl font-bold text-primary-foreground shadow-glass">
          {initialChar}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
          <Coffee className="size-3.5 stroke-[2.5]" />
          <span>Cà phê An Thượng</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="cafe-image-container"
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted shadow-glass-card md:aspect-4/3",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resizeGoogleImage(src, 960, 720) ?? src}
        alt={name}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full object-cover text-transparent transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}
