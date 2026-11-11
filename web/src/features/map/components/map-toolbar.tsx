"use client";

import React from "react";
import { CircleDot, Layers, MapPin, Palette, Plug, Search, Snowflake, Trees, Wifi, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  COLOR_MODES,
  SPATIAL_CLUSTERS,
  type ColorMode,
  type DisplayMode,
  type SpatialClusterKey,
} from "../lib/constants";
import type { AmenityFilterKey } from "../types";
import { MapCompass } from "./map-compass";

interface MapToolbarProps {
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  clusterFilter: "all" | SpatialClusterKey;
  onClusterFilterChange: (cluster: "all" | SpatialClusterKey) => void;
  clusterCounts: Record<"all" | SpatialClusterKey, number>;
  selectedAmenities: AmenityFilterKey[];
  onToggleAmenity: (amenity: AmenityFilterKey) => void;
  totalFiltered: number;
  totalAll: number;
}

const AMENITY_BUTTONS: { key: AmenityFilterKey; label: string; icon: React.ReactNode }[] = [
  { key: "outdoor", label: "Ngoài trời", icon: <Trees className="size-3 text-emerald-500" /> },
  { key: "wifi", label: "Wifi/Laptop", icon: <Wifi className="size-3 text-primary" /> },
  { key: "ac", label: "Máy lạnh", icon: <Snowflake className="size-3 text-sky-500" /> },
  { key: "outlets", label: "Ổ cắm", icon: <Plug className="size-3 text-amber-500" /> },
  { key: "pet", label: "Thú cưng", icon: <span className="text-[11px] leading-none">🐾</span> },
];

export function MapToolbar({
  displayMode,
  onDisplayModeChange,
  colorMode,
  onColorModeChange,
  searchQuery,
  onSearchQueryChange,
  clusterFilter,
  onClusterFilterChange,
  clusterCounts,
  selectedAmenities,
  onToggleAmenity,
  totalFiltered,
  totalAll,
}: MapToolbarProps) {
  const activeColorModeLabel = COLOR_MODES.find((m) => m.id === colorMode)?.label ?? "Tô màu";

  const activeClusterLabel =
    clusterFilter === "all"
      ? `Tất cả cụm (${clusterCounts.all ?? totalAll})`
      : `${SPATIAL_CLUSTERS[clusterFilter]?.shortLabel ?? clusterFilter} (${clusterCounts[clusterFilter] ?? 0})`;

  return (
    <div
      aria-label="Thanh công cụ lọc và hiển thị bản đồ"
      className="pointer-events-auto absolute inset-x-2 top-2 z-[900] flex flex-col gap-2 rounded-xl glass-strong p-2 shadow-glass sm:inset-x-3 sm:top-3 sm:p-2.5"
    >
      {/* Row 1: Search, Display Mode, Color Mode Select, Cluster Filter Select (Always in 1 line) */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
        {/* 1. Search Box */}
        <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Tìm tên, đường, món..."
            aria-label="Tìm kiếm quán cafe"
            className="h-8 rounded-lg border-border bg-card/80 pr-7 pl-8 text-xs font-medium placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              aria-label="Xóa tìm kiếm"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Display Mode Toggle (Điểm rời rạc vs Gom cụm) */}
        <div
          role="group"
          aria-label="Chế độ hiển thị điểm"
          className="flex h-8 shrink-0 items-center rounded-lg border border-border/80 bg-muted/60 p-0.5 text-xs shadow-xs"
        >
          <button
            type="button"
            onClick={() => onDisplayModeChange("points")}
            aria-pressed={displayMode === "points"}
            className={cn(
              "flex h-full items-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-all",
              displayMode === "points"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CircleDot className="size-3" />
            <span className="hidden sm:inline">Rời rạc</span>
            <span className="sm:hidden">Điểm</span>
          </button>
          <button
            type="button"
            onClick={() => onDisplayModeChange("clusters")}
            aria-pressed={displayMode === "clusters"}
            className={cn(
              "flex h-full items-center gap-1 rounded-md px-2.5 text-xs font-semibold transition-all",
              displayMode === "clusters"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="size-3" />
            <span className="hidden sm:inline">Gom cụm</span>
            <span className="sm:hidden">Cụm</span>
          </button>
        </div>

        {/* 3. Color Mode Select */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Select value={colorMode} onValueChange={(val) => onColorModeChange(val as ColorMode)}>
            <SelectTrigger
              size="sm"
              aria-label="Chọn chế độ tô màu"
              className="h-8 gap-1.5 rounded-lg border-border bg-card/80 px-2.5 text-xs font-semibold"
            >
              <Palette className="size-3 shrink-0 text-primary" />
              <span className="truncate">{activeColorModeLabel}</span>
            </SelectTrigger>
            <SelectContent align="start" className="w-auto min-w-max">
              {COLOR_MODES.map((mode) => (
                <SelectItem key={mode.id} value={mode.id} className="text-xs">
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Cluster Filter Select */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Select
            value={clusterFilter}
            onValueChange={(val) => onClusterFilterChange(val as "all" | SpatialClusterKey)}
          >
            <SelectTrigger
              size="sm"
              aria-label="Lọc theo cụm địa lý"
              className="h-8 gap-1.5 rounded-lg border-border bg-card/80 px-2.5 text-xs font-semibold"
            >
              <MapPin className="size-3 shrink-0 text-primary" />
              <span className="truncate">{activeClusterLabel}</span>
            </SelectTrigger>
            <SelectContent align="start" className="w-auto min-w-max">
              <SelectItem value="all" className="text-xs">
                Tất cả cụm ({clusterCounts.all ?? totalAll})
              </SelectItem>
              <SelectItem value="core" className="text-xs">
                {SPATIAL_CLUSTERS.core.label} ({clusterCounts.core ?? 0})
              </SelectItem>
              <SelectItem value="beach" className="text-xs">
                {SPATIAL_CLUSTERS.beach.label} ({clusterCounts.beach ?? 0})
              </SelectItem>
              <SelectItem value="west" className="text-xs">
                {SPATIAL_CLUSTERS.west.label} ({clusterCounts.west ?? 0})
              </SelectItem>
              <SelectItem value="north" className="text-xs">
                {SPATIAL_CLUSTERS.north.label} ({clusterCounts.north ?? 0})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Compass + Amenity Pills (AND logic) + Counter */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
        {/* Compass inline at top-left of row 2 */}
        <MapCompass />

        {AMENITY_BUTTONS.map(({ key, label, icon }) => {
          const isSelected = selectedAmenities.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleAmenity(key)}
              aria-pressed={isSelected}
              className={cn(
                "flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap shadow-xs transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/70 bg-card/80 text-foreground hover:bg-muted/80",
              )}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}

        {/* Counter - always separated with ml-auto and no overlap */}
        <div className="ml-auto flex shrink-0 items-center pl-2">
          <Badge
            variant="outline"
            className="h-7 shrink-0 border-border/80 bg-card/80 px-2.5 text-[11px] font-semibold whitespace-nowrap text-foreground shadow-xs"
          >
            <span className="font-mono font-bold text-primary">{totalFiltered}</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span>{totalAll} quán</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
