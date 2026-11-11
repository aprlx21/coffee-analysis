"use client";

import { useMap } from "react-leaflet";
import { LocateFixed, Minus, Plus, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AN_THUONG_CENTER, DEFAULT_ZOOM } from "../types";

export type TileLayerType = "voyager" | "satellite" | "positron";

interface MapControlsProps {
  currentLayer: TileLayerType;
  onChangeLayer: (layer: TileLayerType) => void;
}

export function MapControls({ currentLayer, onChangeLayer }: MapControlsProps) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleResetCenter = () => {
    map.flyTo(AN_THUONG_CENTER, DEFAULT_ZOOM, {
      duration: 0.8,
    });
  };

  const cycleLayer = () => {
    const next: Record<TileLayerType, TileLayerType> = {
      voyager: "satellite",
      satellite: "positron",
      positron: "voyager",
    };
    onChangeLayer(next[currentLayer]);
  };

  const layerLabels: Record<TileLayerType, string> = {
    voyager: "Bản đồ Chi tiết 🗺️",
    satellite: "Ảnh Vệ tinh Thật 🛰️",
    positron: "Bản đồ Tối giản 🏙️",
  };

  return (
    <div className="leaflet-top leaflet-right pointer-events-auto z-[1000] m-3 flex flex-col gap-2">
      <TooltipProvider delay={150}>
        {/* Toggle Map Layer (Satellite / Voyager / Positron) */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={cycleLayer}
                aria-label="Đổi kiểu bản đồ"
                className="size-9 rounded-md border-2 border-border bg-card text-foreground shadow-hard active:translate-x-[2px] active:translate-y-[2px]"
              />
            }
          >
            <Layers className="size-4 stroke-[2.5]" />
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            <span className="font-bold">{layerLabels[currentLayer]} (Bấm để đổi)</span>
          </TooltipContent>
        </Tooltip>

        {/* Reset to An Thượng */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="default"
                size="icon-sm"
                onClick={handleResetCenter}
                aria-label="Về trung tâm An Thượng"
                className="size-9 rounded-md border-2 border-border bg-primary text-primary-foreground shadow-hard active:translate-x-[2px] active:translate-y-[2px]"
              />
            }
          >
            <LocateFixed className="size-4 stroke-[2.5]" />
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            <span className="font-bold">Về An Thượng 🎯</span>
          </TooltipContent>
        </Tooltip>

        {/* Zoom In */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleZoomIn}
                aria-label="Phóng to"
                className="size-9 rounded-md border-2 border-border bg-card text-card-foreground shadow-hard active:translate-x-[2px] active:translate-y-[2px]"
              />
            }
          >
            <Plus className="size-4 stroke-[2.5]" />
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            <span className="font-bold">Phóng to (+)</span>
          </TooltipContent>
        </Tooltip>

        {/* Zoom Out */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleZoomOut}
                aria-label="Thu nhỏ"
                className="size-9 rounded-md border-2 border-border bg-card text-card-foreground shadow-hard active:translate-x-[2px] active:translate-y-[2px]"
              />
            }
          >
            <Minus className="size-4 stroke-[2.5]" />
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={8}>
            <span className="font-bold">Thu nhỏ (-)</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
