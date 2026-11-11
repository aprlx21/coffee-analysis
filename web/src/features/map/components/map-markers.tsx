"use client";

import { useEffect, useRef } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import type { MapPoint } from "../types";
import { MapPopup } from "./map-popup";

interface MapMarkersProps {
  points: MapPoint[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectPoint: (placeId: string) => void;
}

export function MapMarkers({ points, selectedPlaceId, hoveredPlaceId, onSelectPoint }: MapMarkersProps) {
  const map = useMap();
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Sync: When selectedPlaceId changes from external interaction (e.g. list card click),
  // pan the map smoothly and open marker popup
  useEffect(() => {
    if (!selectedPlaceId) return;

    const targetPoint = points.find((p) => p.placeId === selectedPlaceId);
    if (!targetPoint) return;

    map.panTo([targetPoint.lat, targetPoint.lng], {
      animate: true,
      duration: 0.5,
    });

    const marker = markerRefs.current[selectedPlaceId];
    if (marker && !marker.isPopupOpen()) {
      marker.openPopup();
    }
  }, [selectedPlaceId, points, map]);

  return (
    <>
      {points.map((point) => {
        const isSelected = selectedPlaceId === point.placeId;
        const isHovered = hoveredPlaceId === point.placeId;
        const ratingText = point.rating ? `${point.rating.toFixed(1)}★` : "☕";

        const icon = L.divIcon({
          className: "neubrutalism-marker-icon",
          html: `<div class="neubrutalism-marker-pill ${isSelected ? "is-active" : ""} ${isHovered ? "is-hovered" : ""}">${ratingText}</div>`,
          iconSize: [44, 24],
          iconAnchor: [22, 12],
          popupAnchor: [0, -14],
        });

        return (
          <Marker
            key={point.placeId}
            position={[point.lat, point.lng]}
            icon={icon}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[point.placeId] = ref;
              } else {
                delete markerRefs.current[point.placeId];
              }
            }}
            eventHandlers={{
              click: () => {
                onSelectPoint(point.placeId);
              },
            }}
          >
            <Popup closeButton={true} autoPan={true}>
              <MapPopup point={point} />
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
