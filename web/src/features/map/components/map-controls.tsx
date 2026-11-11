"use client";

import { useMap } from "react-leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AN_THUONG_CENTER, DEFAULT_ZOOM } from "../types";

export function MapControls() {
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

  return (
    <div className="pointer-events-auto absolute bottom-6 left-3 z-[900] flex flex-col gap-1.5">
      <TooltipProvider delay={150}>
        {/* Reset to An Thượng */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleResetCenter}
                aria-label="Về trung tâm An Thượng"
                className="size-9 rounded-lg glass text-foreground shadow-glass hover:-translate-y-0.5 hover:shadow-glass-lg active:translate-y-0"
              />
            }
          >
            <LocateFixed className="size-4 stroke-[2.2] text-primary" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="text-xs font-semibold">Về trung tâm An Thượng 🎯</span>
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
                aria-label="Phóng to bản đồ"
                className="size-9 rounded-lg glass text-foreground shadow-glass hover:-translate-y-0.5 hover:shadow-glass-lg active:translate-y-0"
              />
            }
          >
            <Plus className="size-4 stroke-[2.2]" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="text-xs font-semibold">Phóng to (+)</span>
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
                aria-label="Thu nhỏ bản đồ"
                className="size-9 rounded-lg glass text-foreground shadow-glass hover:-translate-y-0.5 hover:shadow-glass-lg active:translate-y-0"
              />
            }
          >
            <Minus className="size-4 stroke-[2.2]" />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="text-xs font-semibold">Thu nhỏ (-)</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
