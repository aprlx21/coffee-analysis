"use client";

import React, { useMemo } from "react";
import {
  CircleMarker,
  LayersControl,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { AN_THUONG_CENTER, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM, TILE_LAYERS } from "@/features/map";
import { BEACH_AXIS, nearestBeachPoint } from "../lib/regression";
import type { LatLng, PricingAllShop, PricingTrainingShop } from "../types";

import "@/features/map/styles/leaflet-glass.css";

interface PricingMapViewProps {
  allShops: PricingAllShop[];
  activeDrinkShops?: PricingTrainingShop[];
  pin: LatLng | null;
  onSetPin: (pin: LatLng) => void;
  distToBeachM: number | null;
}

/** Tương tác click/tap trên bản đồ để đặt toạ độ */
function MapClickHandler({ onSetPin }: { onSetPin: (pin: LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onSetPin({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Nút điều khiển đặt lại vị trí tâm An Thượng */
function MapCenterControl() {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-left !pointer-events-auto z-20 mb-5 ml-4">
      <button
        type="button"
        onClick={() => map.flyTo(AN_THUONG_CENTER, DEFAULT_ZOOM, { duration: 0.8 })}
        className="flex items-center gap-1.5 rounded-lg border border-border/80 glass-strong px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-glass-sm transition-all hover:-translate-y-0.5 hover:shadow-glass"
        title="Về tâm An Thượng"
      >
        <span className="font-bold text-primary">◎</span>
        <span>Tâm An Thượng</span>
      </button>
    </div>
  );
}

/** Icon điểm đánh dấu mặt bằng người dùng (kéo thả được) */
function createUserPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "pricing-user-pin-marker",
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 42px;">
        <div style="position: absolute; bottom: 0; width: 14px; height: 6px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(2px);"></div>
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="#C8792B" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
          <circle cx="17" cy="17" r="4.5" fill="#2A1708"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42],
  });
}

/** Icon điểm giao trên trục biển */
function createBeachPointIcon(): L.DivIcon {
  return L.divIcon({
    className: "pricing-beach-point",
    html: `
      <div style="width: 12px; height: 12px; border-radius: 50%; background: #0284c7; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export function PricingMapView({ allShops, activeDrinkShops = [], pin, onSetPin, distToBeachM }: PricingMapViewProps) {
  const userPinIcon = useMemo(() => createUserPinIcon(), []);
  const beachPointIcon = useMemo(() => createBeachPointIcon(), []);

  // Đường trục biển Võ Nguyên Giáp theo tim đường OSM (polyline)
  const beachAxisPolyline: [number, number][] = useMemo(() => BEACH_AXIS.map(([lat, lng]) => [lat, lng]), []);

  // Điểm gần nhất trên trục biển
  const nearestBeach = useMemo(() => {
    if (!pin) return null;
    return nearestBeachPoint(pin.lat, pin.lng);
  }, [pin]);

  // Đường nối ngắn nhất từ pin ra trục biển (true shortest segment)
  const connectorLine: [number, number][] | null = useMemo(() => {
    if (!pin || !nearestBeach) return null;
    return [
      [pin.lat, pin.lng],
      [nearestBeach.lat, nearestBeach.lng],
    ];
  }, [pin, nearestBeach]);

  // Set quán bán món hiện tại để nhận diện nhanh
  const activeShopSet = useMemo(() => new Set(activeDrinkShops.map((s) => s.placeId)), [activeDrinkShops]);

  return (
    <div className="relative size-full overflow-hidden bg-muted select-none">
      <MapContainer
        center={pin ? [pin.lat, pin.lng] : AN_THUONG_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        className="z-0 size-full"
      >
        <MapClickHandler onSetPin={onSetPin} />

        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name={TILE_LAYERS[0].name}>
            <TileLayer
              attribution={TILE_LAYERS[0].attribution}
              url={TILE_LAYERS[0].url}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={TILE_LAYERS[1].name}>
            <TileLayer
              attribution={TILE_LAYERS[1].attribution}
              url={TILE_LAYERS[1].url}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={18}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={TILE_LAYERS[2].name}>
            <TileLayer
              attribution={TILE_LAYERS[2].attribution}
              url={TILE_LAYERS[2].url}
              maxZoom={MAX_ZOOM}
              maxNativeZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Trục biển Võ Nguyên Giáp (lng = 108.2485) */}
        <Polyline
          positions={beachAxisPolyline}
          pathOptions={{
            color: "#0284c7",
            weight: 2,
            dashArray: "6, 6",
            opacity: 0.8,
          }}
        />

        {/* Các quán cafe đã có trong khu vực làm chấm mờ */}
        {allShops.map((shop) => {
          const isActiveDrink = activeShopSet.has(shop.placeId);
          return (
            <CircleMarker
              key={shop.placeId}
              center={[shop.lat, shop.lng]}
              radius={isActiveDrink ? 4.5 : 3}
              pathOptions={{
                color: isActiveDrink ? "#C8792B" : "#94a3b8",
                fillColor: isActiveDrink ? "#C8792B" : "#64748b",
                fillOpacity: isActiveDrink ? 0.85 : 0.45,
                weight: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
                <div className="text-xs font-medium">
                  <div className="font-semibold text-foreground">{shop.name}</div>
                  {isActiveDrink && <div className="text-[10px] text-primary">Có phục vụ món đang xem</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Đường nối ngắn nhất từ pin ra trục biển */}
        {connectorLine && pin && nearestBeach && (
          <>
            <Polyline
              positions={connectorLine}
              pathOptions={{
                color: "#ea580c",
                weight: 2.5,
                dashArray: "4, 4",
                opacity: 0.9,
              }}
            />
            {/* Điểm chân vuông góc trên trục biển */}
            <Marker position={[nearestBeach.lat, nearestBeach.lng]} icon={beachPointIcon}>
              <Tooltip direction="top" offset={[0, -6]} permanent opacity={0.85}>
                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300">
                  Trục biển {distToBeachM !== null ? `(${Math.round(distToBeachM)}m)` : ""}
                </span>
              </Tooltip>
            </Marker>
          </>
        )}

        {/* Pin mặt bằng người dùng (có thể kéo thả) */}
        {pin && (
          <Marker
            position={[pin.lat, pin.lng]}
            icon={userPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target as L.Marker;
                const pos = marker.getLatLng();
                onSetPin({ lat: pos.lat, lng: pos.lng });
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -42]} permanent opacity={0.95}>
              <div className="px-1 py-0.5 text-center text-xs font-bold text-foreground">
                Vị trí quán của bạn
                <div className="text-[10px] font-normal text-muted-foreground">Kéo thả để dời vị trí</div>
              </div>
            </Tooltip>
          </Marker>
        )}

        <MapCenterControl />
      </MapContainer>

      {/* Chú giải góc trên trục biển */}
      <div className="pointer-events-none absolute top-3 right-3 z-10 flex max-w-[200px] flex-col gap-1.5 rounded-xl border border-border/80 glass-strong p-2.5 text-xs shadow-glass-sm">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 border-b-2 border-dashed border-[#0284c7]" />
          <span className="text-[11px] font-semibold text-foreground">Trục biển Võ Nguyên Giáp</span>
        </div>
        {pin && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 border-b-2 border-dashed border-[#ea580c]" />
            <span className="text-[11px] text-muted-foreground">
              Khoảng cách: <strong className="text-foreground">{Math.round(distToBeachM ?? 0)} m</strong>
            </span>
          </div>
        )}
      </div>

      {/* Thông báo mời click khi chưa đặt pin */}
      {!pin && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
          <div className="flex animate-bounce items-center gap-2.5 rounded-2xl border border-border glass-strong px-4 py-2.5 text-sm font-semibold text-foreground shadow-glass-lg">
            <span className="text-lg">📍</span>
            <span>Chạm hoặc nhấp vào bản đồ để chọn vị trí mặt bằng</span>
          </div>
        </div>
      )}
    </div>
  );
}
