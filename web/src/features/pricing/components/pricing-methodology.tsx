"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export function PricingMethodology() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/80 glass p-4 text-xs shadow-glass-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-heading font-semibold text-foreground"
      >
        <div className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
          <Info className="size-4 text-primary" />
          <span>Phương pháp tính toán & Giới hạn mô hình (Đọc kỹ)</span>
        </div>
        {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2.5 border-t border-border/50 pt-3 leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">1. Mô hình toán học:</strong> Sử dụng mô hình hồi quy tuyến tính cổ điển
            (OLS - Ordinary Least Squares) được huấn luyện trực tiếp từ dữ liệu thực đơn bóc tách tự động (Menu OCR) của
            hơn 115 quán cafe tại khu phố An Thượng, Đà Nẵng.
          </p>
          <p>
            <strong className="text-foreground">2. Ba đặc trưng dự đoán:</strong> (1) Khoảng cách vuông góc từ kinh độ
            mặt bằng ra trục đường biển Võ Nguyên Giáp (kinh độ 108.2485); (2) Quán có chấp nhận thanh toán qua thẻ ngân
            hàng/NFC; (3) Quán định vị không gian làm việc chuyên nghiệp (laptop-friendly).
          </p>
          <p>
            <strong className="text-foreground">3. Khoảng giá khuyến nghị:</strong> Được xác định bằng công thức{" "}
            <code>Giá đề xuất ± Sai số kiểm định chéo Leave-One-Out (LOO RMSE)</code>, đảm bảo không thấp hơn sàn giá
            thị trường 15.000đ.
          </p>
          <p>
            <strong className="text-foreground">4. Lưu ý quan trọng:</strong> Đây là công cụ mô phỏng hỗ trợ khảo sát
            thị trường và định giá chiến lược ban đầu dành cho chủ quán. Mô hình thống kê không phải là cam kết bảo đảm
            doanh thu hay thay thế cho việc khảo sát khẩu vị, phong cách và chi phí vận hành chi tiết thực tế của quán.
          </p>
        </div>
      )}
    </div>
  );
}
