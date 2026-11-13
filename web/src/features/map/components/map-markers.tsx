"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { createRoot, type Root } from "react-dom/client";

import type { CafeCard } from "@/server/db";
import { getCafeVisual, industryGroup, priceTier, spatialCluster } from "../lib/classify";
import type { ColorMode, DisplayMode } from "../types";
import { MapPopup } from "./map-popup";

interface MapMarkersProps {
  cafes: CafeCard[];
  colorMode: ColorMode;
  displayMode: DisplayMode;
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
}

/**
 * Tạo icon giọt nước (Teardrop Pin) theo màu sắc trực quan hóa data-viz.
 */
function createTeardropPinIcon(color: string, isSelected = false): L.DivIcon {
  const size = isSelected ? 30 : 24;
  const height = isSelected ? 38 : 32;
  const svg = `
    <svg width="${size}" height="${height}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
      <circle cx="12" cy="12" r="4.5" fill="#FFFFFF"/>
    </svg>
  `;
  return L.divIcon({
    className: `glass-teardrop-pin ${isSelected ? "is-active" : ""}`,
    html: svg,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4],
  });
}

/**
 * Component xử lý lớp gom cụm (MarkerClusterGroup) qua useMap() theo yêu cầu imperative.
 */
function ClusteredMarkersLayer({
  cafes,
  colorMode,
  selectedPlaceId,
  onSelectCafe,
}: {
  cafes: CafeCard[];
  colorMode: ColorMode;
  selectedPlaceId: string | null;
  onSelectCafe: (placeId: string) => void;
}) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const rootsRef = useRef<Map<string, Root>>(new Map());

  // Khởi tạo cluster group và render markers
  useEffect(() => {
    if (!map) return;

    const roots = rootsRef.current;
    const markers = markersRef.current;

    // Cleanup previous cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current.clearLayers();
    }
    // Cleanup previous React roots
    roots.forEach((root) => {
      try {
        root.unmount();
      } catch {
        // Ignore unmount errors
      }
    });
    roots.clear();
    markers.clear();

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 35,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: "marker-cluster",
          iconSize: L.point(36, 36),
        });
      },
    });

    for (const cafe of cafes) {
      if (cafe.lat === null || cafe.lng === null) continue;

      const visual = getCafeVisual(cafe, colorMode);
      const icon = createTeardropPinIcon(visual.color, false);

      const marker = L.marker([cafe.lat, cafe.lng], { icon });

      marker.bindPopup(
        () => {
          const popupContainer = document.createElement("div");
          const root = createRoot(popupContainer);
          roots.set(cafe.placeId, root);
          root.render(<MapPopup cafe={cafe} />);
          return popupContainer;
        },
        {
          autoPan: true,
          autoPanPadding: L.point(16, 76),
          closeButton: true,
        },
      );

      marker.on("click", () => {
        onSelectCafe(cafe.placeId);
      });

      markers.set(cafe.placeId, marker);
      clusterGroup.addLayer(marker);
    }

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current.clearLayers();
      }
      roots.forEach((root) => {
        try {
          root.unmount();
        } catch {
          // Ignore
        }
      });
      roots.clear();
      markers.clear();
    };
  }, [map, cafes, colorMode, onSelectCafe]);

  // Đồng bộ chọn quán: pan map & mở popup (zoomToShowLayer)
  useEffect(() => {
    if (!selectedPlaceId || !clusterGroupRef.current) return;

    const marker = markersRef.current.get(selectedPlaceId);
    if (!marker) return;

    clusterGroupRef.current.zoomToShowLayer(marker, () => {
      marker.openPopup();
    });
  }, [selectedPlaceId]);

  return null;
}

export function MapMarkers({
  cafes,
  colorMode,
  displayMode,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectCafe,
}: MapMarkersProps) {
  const map = useMap();
  const circleMarkerRefs = useRef<Record<string, L.CircleMarker | null>>({});

  // Valid cafes with lat & lng
  const validCafes = useMemo(() => cafes.filter((c) => c.lat !== null && c.lng !== null), [cafes]);

  // Sync pan & open popup for discrete points mode
  useEffect(() => {
    if (displayMode !== "points" || !selectedPlaceId) return;

    const target = validCafes.find((c) => c.placeId === selectedPlaceId);
    if (!target || target.lat === null || target.lng === null) return;

    map.panTo([target.lat, target.lng], {
      animate: true,
      duration: 0.5,
    });

    const marker = circleMarkerRefs.current[selectedPlaceId];
    if (marker && !marker.isPopupOpen()) {
      marker.openPopup();
    }
  }, [selectedPlaceId, validCafes, displayMode, map]);

  // If in cluster mode, delegate to ClusteredMarkersLayer
  if (displayMode === "clusters") {
    return (
      <ClusteredMarkersLayer
        cafes={validCafes}
        colorMode={colorMode}
        selectedPlaceId={selectedPlaceId}
        onSelectCafe={onSelectCafe}
      />
    );
  }

  // Discrete points mode (L.circleMarker r=8, viền trắng 2px, hover r=12)
  return (
    <>
      {validCafes.map((cafe) => {
        const visual = getCafeVisual(cafe, colorMode);
        const cluster = spatialCluster(cafe.lat, cafe.lng);
        const indGroup = industryGroup(cafe.mainCategory);
        const prTier = priceTier(cafe.drinkPriceMedian);
        const isSelected = selectedPlaceId === cafe.placeId;
        const isHovered = hoveredPlaceId === cafe.placeId;

        const currentRadius = isSelected ? 13 : isHovered ? 12 : 8;

        return (
          <CircleMarker
            key={cafe.placeId}
            center={[cafe.lat!, cafe.lng!]}
            radius={currentRadius}
            pathOptions={{
              color: "#ffffff",
              weight: isSelected ? 3 : 2,
              fillColor: visual.color,
              fillOpacity: 0.92,
            }}
            ref={(ref) => {
              if (ref) {
                circleMarkerRefs.current[cafe.placeId] = ref;
              } else {
                delete circleMarkerRefs.current[cafe.placeId];
              }
            }}
            eventHandlers={{
              click: () => {
                onSelectCafe(cafe.placeId);
              },
              mouseover: (e) => {
                if (!isSelected) {
                  e.target.setRadius(12);
                }
              },
              mouseout: (e) => {
                if (!isSelected && hoveredPlaceId !== cafe.placeId) {
                  e.target.setRadius(8);
                }
              },
            }}
          >
            {/* Tooltip hover ở chế độ rời rạc - Đảm bảo màu chữ luôn tương phản cao trên cả nền vệ tinh & đường phố */}
            <Tooltip direction="top" offset={[0, -10]} className="glass-marker-hover-tooltip">
              <div className="flex items-center gap-1.5 font-sans text-xs">
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-white/60"
                  style={{ backgroundColor: visual.color }}
                />
                <span className="font-bold text-white drop-shadow-sm">{cafe.name}</span>
                <span className="text-zinc-400">•</span>
                <span className="font-semibold text-amber-300 drop-shadow-sm">{cluster.shortLabel}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-200">
                  {cafe.mainCategory ?? indGroup.label} ({prTier.label})
                </span>
              </div>
            </Tooltip>

            {/* Popup chi tiết */}
            <Popup autoPan={true} autoPanPadding={L.point(16, 76)} closeButton={true}>
              <MapPopup cafe={cafe} />
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
