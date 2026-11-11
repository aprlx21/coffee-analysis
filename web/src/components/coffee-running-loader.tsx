import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CoffeeRunningLoaderProps {
  size?: "sm" | "md" | "lg";
  title?: string;
  subtitle?: string;
  className?: string;
  fullscreen?: boolean;
}

export function CoffeeRunningLoader({
  size = "md",
  title = "Đang tải dữ liệu quán...",
  subtitle = "Cappuccino Ninja đang phi nước đại mang menu đến bạn ☕",
  className,
  fullscreen = false,
}: CoffeeRunningLoaderProps) {
  const sizeMap = {
    sm: {
      img: 64,
      container: "gap-2 p-3",
      title: "text-xs font-bold",
      subtitle: "text-[11px]",
      shadow: "w-12 h-2",
    },
    md: {
      img: 96,
      container: "gap-3 p-5",
      title: "text-sm font-bold sm:text-base",
      subtitle: "text-xs",
      shadow: "w-20 h-3",
    },
    lg: {
      img: 130,
      container: "gap-4 p-6 sm:p-8",
      title: "text-base font-bold sm:text-lg",
      subtitle: "text-xs sm:text-sm",
      shadow: "w-28 h-3.5",
    },
  };

  const current = sizeMap[size];

  const content = (
    <div className={cn("relative flex flex-col items-center justify-center text-center", current.container, className)}>
      {/* Runner Area */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Speed lines behind character */}
        <div className="pointer-events-none absolute inset-x-[-20px] top-1/2 h-8 -translate-y-1/2 overflow-hidden">
          <div className="animate-speed-dash-1 absolute top-1 left-2 h-[2px] w-8 rounded-full bg-primary/40" />
          <div className="animate-speed-dash-2 absolute top-5 left-8 h-[1.5px] w-6 rounded-full bg-amber-500/50" />
          <div className="animate-speed-dash-1 absolute top-3 left-4 h-[2px] w-10 rounded-full bg-primary/30" />
        </div>

        {/* Running dust puffs */}
        <div className="animate-coffee-dust-1 pointer-events-none absolute -bottom-1 -left-4 size-3 rounded-full bg-muted-foreground/30" />
        <div className="animate-coffee-dust-2 pointer-events-none absolute bottom-1 -left-2 size-2 rounded-full bg-primary/25" />

        {/* Character Image */}
        <div className="animate-coffee-run relative select-none">
          <Image
            src="/cappuccino-ninja.png"
            alt="Cappuccino Assassino Ninja Loading"
            width={current.img}
            height={current.img}
            priority
            className="drop-shadow-md transition-transform"
          />
        </div>

        {/* Dynamic Shadow */}
        <div className={cn("animate-coffee-shadow -mt-1 rounded-[50%] bg-foreground/20 blur-[2px]", current.shadow)} />
      </div>

      {/* Text Info */}
      {(title || subtitle) && (
        <div className="mt-2 space-y-1">
          {title && <h4 className={cn("font-heading tracking-tight text-foreground", current.title)}>{title}</h4>}
          {subtitle && (
            <p className={cn("mx-auto max-w-xs font-medium text-muted-foreground", current.subtitle)}>{subtitle}</p>
          )}
        </div>
      )}

      {/* Progress Dots */}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="size-1.5 animate-pulse rounded-full bg-primary" />
        <span className="size-1.5 animate-pulse rounded-full bg-primary/70 [animation-delay:200ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-primary/40 [animation-delay:400ms]" />
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
        <div className="w-full max-w-sm rounded-3xl border border-border/80 glass-strong p-6 shadow-glass-lg sm:p-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
