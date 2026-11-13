"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, Calculator, CreditCard, Laptop, RefreshCw } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { distToBeachFrontM } from "../lib/regression";
import type { LatLng, PricingData } from "../types";
import { PricingContextPanel } from "./pricing-context-panel";
import { PricingDrinkCard } from "./pricing-drink-card";
import { PricingMapContainer } from "./pricing-map-container";
import { PricingMethodology } from "./pricing-methodology";

interface PricingPageViewProps {
  data: PricingData;
}

export function PricingPageView({ data }: PricingPageViewProps) {
  // Trạng thái mặt bằng người dùng chọn trên bản đồ
  const [pin, setPin] = useState<LatLng | null>(null);

  // 2 nút gạt định vị quán
  const [hasCardPayment, setHasCardPayment] = useState<boolean>(false);
  const [hasWork, setHasWork] = useState<boolean>(false);

  // Món đồ uống đang chọn xem chi tiết
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>("bac_xiu");

  // Khoảng cách vuông góc ra trục biển Võ Nguyên Giáp
  const distToBeachM = useMemo(() => {
    if (!pin) return null;
    return distToBeachFrontM(pin.lat, pin.lng);
  }, [pin]);

  // Kiểm tra vị trí có bị ngoại suy (nằm ngoài bounds mở rộng ~150m hoặc distToBeachM < 0)
  const isExtrapolated = useMemo(() => {
    if (!pin || distToBeachM === null) return false;
    const LAT_PAD_150M = 0.00135;
    const LNG_PAD_150M = 0.0014;

    const outsideLat = pin.lat < data.bounds.minLat - LAT_PAD_150M || pin.lat > data.bounds.maxLat + LAT_PAD_150M;
    const outsideLng = pin.lng < data.bounds.minLng - LNG_PAD_150M || pin.lng > data.bounds.maxLng + LNG_PAD_150M;
    const beyondBeach = distToBeachM < 0;

    return outsideLat || outsideLng || beyondBeach;
  }, [pin, distToBeachM, data.bounds]);

  // Quán của món đang chọn để truyền cho map (nếu cần highlight)
  const activeDrinkData = useMemo(() => {
    return data.drinks.find((d) => d.canonicalId === selectedDrinkId) ?? data.drinks[0];
  }, [data.drinks, selectedDrinkId]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Tiêu đề trang */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-primary">
          <Calculator className="size-5" />
          <span className="font-heading text-xs font-bold tracking-wider uppercase">
            Công cụ khảo sát F&B An Thượng
          </span>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Định giá bán đồ uống cho quán cafe mới
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Chấm chọn vị trí mặt bằng dự kiến trên bản đồ để nhận mức giá gợi ý cho 3 món chủ lực (Bạc xỉu, Cà phê muối,
          Cappuccino), dựa trên mô hình hồi quy từ dữ liệu thực tế tại khu phố du lịch An Thượng.
        </p>
      </div>

      {/* Cảnh báo ngoại suy khi chọn vị trí ngoài phạm vi */}
      {isExtrapolated && (
        <div className="flex animate-in items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 shadow-glass-sm fade-in dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <strong className="block text-sm font-bold">Cảnh báo phạm vi dữ liệu (Ngoại suy):</strong>
            <span>
              {distToBeachM !== null && distToBeachM < 0
                ? "Vị trí được chọn nằm ở phía biển (phía đông đường Võ Nguyên Giáp). Mô hình hồi quy đang chạy ở chế độ ngoại suy (extrapolation) nên khoảng giá đề xuất có thể không phản ánh chính xác thực tế."
                : "Vị trí được chọn nằm ngoài phạm vi khảo sát khu phố An Thượng. Mô hình hồi quy đang chạy ở chế độ ngoại suy (extrapolation) nên khoảng giá đề xuất có thể không phản ánh chính xác thực tế."}
            </span>
          </div>
        </div>
      )}

      {/* Khu vực nội dung chính: Cột trái Bản đồ + Bối cảnh, Cột phải Điều khiển + Thẻ giá */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12">
        {/* CỘT TRÁI (Bản đồ + Bối cảnh vị trí) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Hộp bản đồ */}
          <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-border glass shadow-glass-card sm:h-[420px] lg:h-[480px]">
            <PricingMapContainer
              allShops={data.allShops}
              activeDrinkShops={activeDrinkData?.shops}
              pin={pin}
              onSetPin={setPin}
              distToBeachM={distToBeachM}
            />
          </div>

          {/* Bảng bối cảnh vị trí */}
          <PricingContextPanel
            pin={pin}
            distToBeachM={distToBeachM}
            allShops={data.allShops}
            drinks={data.drinks}
            selectedDrinkId={selectedDrinkId}
            onSelectDrinkId={setSelectedDrinkId}
          />
        </div>

        {/* CỘT PHẢI (Bộ chuyển đổi tiện ích + Kết quả 3 món) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Khối điều khiển đặc trưng quán */}
          <div className="space-y-4 rounded-2xl border border-border glass p-4 shadow-glass-card sm:p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-foreground">Đặc trưng mặt bằng của bạn</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Bật/tắt các tiện ích dự kiến trang bị</p>
              </div>

              {pin && (
                <button
                  type="button"
                  onClick={() => setPin(null)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Xoá ghim hiện tại"
                >
                  <RefreshCw className="size-3" />
                  <span>Chọn lại</span>
                </button>
              )}
            </div>

            <div className="space-y-3.5">
              {/* Toggle 1: Thanh toán thẻ / NFC */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/60 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-emerald-500/15 p-1.5 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <label htmlFor="toggle-card" className="block cursor-pointer text-xs font-medium text-foreground">
                      Nhận thanh toán thẻ / NFC
                    </label>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      Hỗ trợ quẹt thẻ POS hoặc Apple Pay / Google Wallet
                    </span>
                  </div>
                </div>

                <Switch
                  id="toggle-card"
                  checked={hasCardPayment}
                  onCheckedChange={(checked) => setHasCardPayment(Boolean(checked))}
                />
              </div>

              {/* Toggle 2: Laptop-friendly */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/60 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-purple-500/15 p-1.5 text-purple-600 dark:text-purple-400">
                    <Laptop className="size-4" />
                  </div>
                  <div>
                    <label htmlFor="toggle-work" className="block cursor-pointer text-xs font-medium text-foreground">
                      Định vị quán làm việc (laptop-friendly)
                    </label>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      Không gian yên tĩnh, bàn cao, ổ cắm điện đầy đủ
                    </span>
                  </div>
                </div>

                <Switch
                  id="toggle-work"
                  checked={hasWork}
                  onCheckedChange={(checked) => setHasWork(Boolean(checked))}
                />
              </div>
            </div>
          </div>

          {/* Danh sách thẻ giá cho 3 món */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Gợi ý định giá 3 thức uống chủ lực
              </h3>
              <span className="text-[11px] text-muted-foreground">3 mô hình OLS độc lập</span>
            </div>

            {data.drinks.map((drink) => (
              <PricingDrinkCard
                key={drink.canonicalId}
                drink={drink}
                distToBeachM={distToBeachM}
                hasCardPayment={hasCardPayment}
                hasWork={hasWork}
                isSelected={selectedDrinkId === drink.canonicalId}
                onSelect={() => setSelectedDrinkId(drink.canonicalId)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ghi chú phương pháp luận ở cuối trang */}
      <PricingMethodology />
    </div>
  );
}
