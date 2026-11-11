import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Phân tích",
  description: "Phân tích phổ giá và thị trường cafe An Thượng.",
};

export default function PhanTichPage() {
  return (
    <ComingSoon
      title="Phân tích Thị trường & Bảng giá"
      description="Thống kê phổ giá các món đồ uống phổ biến (cà phê sữa, bạc xỉu, cold brew) và mật độ tiện ích không gian quán tại An Thượng."
      icon={<BarChart3 className="size-8 stroke-[2.5]" />}
      plannedMilestone="MVP v0.1"
    />
  );
}
