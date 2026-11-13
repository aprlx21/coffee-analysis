"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Compass, ExternalLink, MapPin, Store, Waves } from "lucide-react";

import { spatialCluster } from "@/features/map";
import { distanceM } from "../lib/regression";
import type { LatLng, PricingAllShop, PricingDrinkData } from "../types";

interface PricingContextPanelProps {
  pin: LatLng | null;
  distToBeachM: number | null;
  allShops: PricingAllShop[];
  drinks: PricingDrinkData[];
  selectedDrinkId: string;
  onSelectDrinkId: (id: string) => void;
}

export function PricingContextPanel({
  pin,
  distToBeachM,
  allShops,
  drinks,
  selectedDrinkId,
  onSelectDrinkId,
}: PricingContextPanelProps) {
  // Cụm không gian
  const cluster = useMemo(() => {
    if (!pin) return null;
    return spatialCluster(pin.lat, pin.lng);
  }, [pin]);

  // Số lượng đối thủ trong bán kính 200m
  const competitorCount200m = useMemo(() => {
    if (!pin) return 0;
    return allShops.filter((s) => distanceM(pin.lat, pin.lng, s.lat, s.lng) <= 200).length;
  }, [pin, allShops]);

  // Món đang chọn
  const activeDrink = useMemo(() => {
    return drinks.find((d) => d.canonicalId === selectedDrinkId) ?? drinks[0];
  }, [drinks, selectedDrinkId]);

  // 5 quán gần nhất thực tế có bán món này
  const nearestShops = useMemo(() => {
    if (!pin || !activeDrink) return [];
    return activeDrink.shops
      .map((shop) => ({
        ...shop,
        distanceM: distanceM(pin.lat, pin.lng, shop.lat, shop.lng),
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 5);
  }, [pin, activeDrink]);

  if (!pin) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 glass bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <MapPin className="mx-auto mb-2 size-8 stroke-1 text-muted-foreground/60" />
        <div className="font-semibold text-foreground">Chưa có vị trí phân tích</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Chấm chọn mặt bằng trên bản đồ để xem cự ly ra biển, phân cụm địa lý và 5 đối thủ cạnh tranh gần nhất.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border glass p-5 shadow-glass-card">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-primary" />
          <h3 className="font-heading text-base font-bold text-foreground">Bối cảnh vị trí mặt bằng</h3>
        </div>
        {cluster && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white shadow-glass-sm"
            style={{ backgroundColor: cluster.color }}
          >
            <span>{cluster.label}</span>
          </span>
        )}
      </div>

      {/* 3 chỉ số nhanh */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Khoảng cách ra biển */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Waves className="size-3.5 text-sky-600 dark:text-sky-400" />
            <span>Ra trục biển</span>
          </div>
          <div className="font-mono text-xl font-bold text-foreground">
            {distToBeachM !== null ? `${Math.round(distToBeachM)} m` : "—"}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">đường Võ Nguyên Giáp</div>
        </div>

        {/* Mật độ cạnh tranh 200m */}
        <div className="rounded-xl border border-border/60 bg-card/60 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Đối thủ 200m</span>
          </div>
          <div className="font-mono text-xl font-bold text-foreground">{competitorCount200m} quán</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">trong bán kính 200 m</div>
        </div>

        {/* Tọa độ */}
        <div className="col-span-2 rounded-xl border border-border/60 bg-card/60 p-3 sm:col-span-1">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" />
            <span>Tọa độ GPS</span>
          </div>
          <div className="font-mono text-xs font-medium text-foreground">
            {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">An Thượng, Đà Nẵng</div>
        </div>
      </div>

      {/* Danh sách 5 quán gần nhất bán món này */}
      <div className="space-y-2 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-foreground">5 quán gần nhất đang bán món:</div>

          {/* Tab chọn nhanh 3 món */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/80 p-0.5">
            {drinks.map((d) => (
              <button
                key={d.canonicalId}
                type="button"
                onClick={() => onSelectDrinkId(d.canonicalId)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
                  selectedDrinkId === d.canonicalId
                    ? "bg-primary text-primary-foreground shadow-glass-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.displayName}
              </button>
            ))}
          </div>
        </div>

        {nearestShops.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-muted/20 p-3 text-center text-xs text-muted-foreground">
            Không tìm thấy quán nào trong mẫu bán món này.
          </div>
        ) : (
          <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/70 bg-card/50">
            {nearestShops.map((shop, idx) => (
              <div
                key={shop.placeId}
                className="flex items-center justify-between p-2.5 text-xs transition-colors hover:bg-muted/30"
              >
                <div className="flex min-w-0 items-center gap-2 pr-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/quan/${shop.placeId}`}
                      target="_blank"
                      className="flex items-center gap-1 truncate font-medium text-foreground transition-colors hover:text-primary"
                    >
                      <span className="truncate">{shop.name}</span>
                      <ExternalLink className="size-3 shrink-0 opacity-60" />
                    </Link>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>Cách {Math.round(shop.distanceM)} m</span>
                      {shop.hasCardPayment && (
                        <span className="rounded bg-muted px-1 text-emerald-700 dark:text-emerald-400">Thẻ</span>
                      )}
                      {shop.hasWork && (
                        <span className="rounded bg-muted px-1 text-purple-700 dark:text-purple-400">Laptop</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="font-mono text-sm font-bold text-foreground">
                    {Math.round(shop.priceK * 1000).toLocaleString("vi-VN")} đ
                  </div>
                  <div className="text-[10px] text-muted-foreground">giá thực đơn</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
