"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Layers } from "lucide-react";

import type { CafeCard } from "@/server/db";
import { getCafeVisual } from "../lib/classify";
import {
  COLOR_MODES,
  INDUSTRY_GROUPS,
  PRICE_TIERS,
  RATING_TIERS,
  SPATIAL_CLUSTERS,
  type ColorMode,
} from "../lib/constants";

interface MapLegendProps {
  colorMode: ColorMode;
  filteredCafes: CafeCard[];
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const STORAGE_KEY_POS = "ban_do_legend_pos_v2";
const STORAGE_KEY_COLLAPSED = "ban_do_legend_collapsed_v2";

export function MapLegend({ colorMode, filteredCafes, containerRef }: MapLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      return savedCollapsed !== null ? savedCollapsed === "true" : false;
    } catch {
      return false;
    }
  });

  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedPos = localStorage.getItem(STORAGE_KEY_POS);
      if (savedPos) {
        const parsed = JSON.parse(savedPos);
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          return parsed;
        }
      }
    } catch {
      return null;
    }
    return null;
  });

  const legendRef = useRef<HTMLDivElement>(null);
  const dragDataRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    isDragging: boolean;
  } | null>(null);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_COLLAPSED, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Pointer drag logic
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !legendRef.current) return;
    // Don't drag if clicking a button inside header
    if ((e.target as HTMLElement).closest("button")) return;

    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const legendRect = legendRef.current.getBoundingClientRect();

    const currentX = pos ? pos.x : legendRect.left - containerRect.left;
    const currentY = pos ? pos.y : legendRect.top - containerRect.top;

    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: currentX,
      initialPosY: currentY,
      isDragging: true,
    };

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragDataRef.current?.isDragging || !containerRef.current || !legendRef.current) return;

    const dx = e.clientX - dragDataRef.current.startX;
    const dy = e.clientY - dragDataRef.current.startY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const legendRect = legendRef.current.getBoundingClientRect();

    let newX = dragDataRef.current.initialPosX + dx;
    let newY = dragDataRef.current.initialPosY + dy;

    // Clamp within map bounds
    const minX = 8;
    const maxX = Math.max(minX, containerRect.width - legendRect.width - 8);
    const minY = 104; // Under toolbar
    const maxY = Math.max(minY, containerRect.height - legendRect.height - 8);

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragDataRef.current?.isDragging) return;
    dragDataRef.current.isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (pos) {
      try {
        localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(pos));
      } catch {
        // Ignore
      }
    }
  };

  // Compute counts for active color mode on filtered data
  const countsByVisualKey = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cafe of filteredCafes) {
      const visual = getCafeVisual(cafe, colorMode);
      counts[visual.key] = (counts[visual.key] || 0) + 1;
    }
    return counts;
  }, [filteredCafes, colorMode]);

  const activeModeConfig = COLOR_MODES.find((m) => m.id === colorMode);
  const activeTitle = activeModeConfig?.label ?? "Chú giải";

  // Position styles (inline style override or default top 104px right 12px)
  const posStyle: React.CSSProperties = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px` }
    : { right: "12px", top: "104px" };

  // Render items based on active color mode
  const renderItems = () => {
    switch (colorMode) {
      case "spatial":
        return Object.values(SPATIAL_CLUSTERS).map((cluster) => (
          <div key={cluster.key} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border border-white/80 shadow-xs"
                style={{ backgroundColor: cluster.color }}
              />
              <span className="font-medium text-foreground">{cluster.label}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {countsByVisualKey[cluster.key] ?? 0}
            </span>
          </div>
        ));

      case "price":
        return Object.values(PRICE_TIERS).map((tier) => (
          <div key={tier.key} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border border-white/80 shadow-xs"
                style={{ backgroundColor: tier.color }}
              />
              <span className="font-medium text-foreground">{tier.label}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {countsByVisualKey[tier.key] ?? 0}
            </span>
          </div>
        ));

      case "industry":
        return Object.values(INDUSTRY_GROUPS).map((group) => (
          <div key={group.key} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border border-white/80 shadow-xs"
                style={{ backgroundColor: group.color }}
              />
              <span className="font-medium text-foreground">{group.label}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {countsByVisualKey[group.key] ?? 0}
            </span>
          </div>
        ));

      case "rating":
        return Object.values(RATING_TIERS).map((tier) => (
          <div key={tier.key} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border border-white/80 shadow-xs"
                style={{ backgroundColor: tier.color }}
              />
              <span className="font-medium text-foreground">{tier.label}</span>
            </div>
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {countsByVisualKey[tier.key] ?? 0}
            </span>
          </div>
        ));
    }
  };

  if (isCollapsed) {
    return (
      <div
        ref={legendRef}
        style={posStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute z-[950] flex cursor-grab touch-none items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs font-bold text-foreground shadow-glass-lg select-none hover:-translate-y-0.5 active:cursor-grabbing"
      >
        <GripVertical className="size-3 text-muted-foreground" />
        <span>🎨 {activeTitle}</span>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Mở rộng chú giải"
          className="ml-1 flex size-5 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-muted"
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={legendRef}
      style={posStyle}
      className="absolute z-[950] w-64 rounded-xl glass-strong shadow-glass-lg select-none"
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex cursor-grab touch-none items-center justify-between border-b border-border/60 px-3.5 py-2.5 active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-foreground">
          <GripVertical className="size-3.5 text-muted-foreground" />
          <Layers className="size-3.5 text-primary" />
          <span>{activeTitle}</span>
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Thu gọn chú giải"
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        >
          <ChevronUp className="size-3.5" />
        </button>
      </div>

      {/* Legend Items */}
      <div className="space-y-2 p-3">{renderItems()}</div>

      {/* Zones info */}
      <div className="space-y-1.5 rounded-b-xl border-t border-border/50 bg-muted/20 px-3 py-2 text-[11px]">
        <div className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Vùng quy hoạch</div>
        <div className="flex items-center gap-2 text-foreground">
          <span className="size-2.5 rounded-xs border-2 border-dashed border-orange-500 bg-yellow-300/40" />
          <span>Siêu lõi phố đi bộ & đêm (18h–23h)</span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <span className="size-2.5 rounded-xs border border-dashed border-blue-500 bg-blue-300/20" />
          <span>Vành đai Khu DL An Thượng</span>
        </div>
      </div>
    </div>
  );
}
