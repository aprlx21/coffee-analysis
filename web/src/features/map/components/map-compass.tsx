"use client";

export function MapCompass() {
  return (
    <div
      aria-label="La bàn định hướng An Thượng"
      className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-border/70 bg-card/70 px-2 py-1 text-xs shadow-xs sm:flex"
    >
      {/* Stylized Compass Needle */}
      <div className="relative flex size-5 items-center justify-center rounded-full border border-white/60 bg-white/70 shadow-xs dark:bg-card">
        <div className="relative h-3 w-0.5 -rotate-[16deg]">
          {/* North Half (Red) */}
          <div className="absolute inset-x-0 top-0 h-1.5 rounded-t bg-destructive" />
          {/* South Half (Slate) */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 rounded-b bg-muted-foreground/60" />
        </div>
      </div>

      <div className="flex items-baseline gap-1 font-heading text-xs leading-none font-bold">
        <span className="text-destructive">BẮC (N)</span>
        <span className="text-[10px] font-normal text-muted-foreground">• ~16° TB–ĐN</span>
      </div>
    </div>
  );
}
