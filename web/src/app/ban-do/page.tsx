import type { Metadata } from "next";
import { MapPin } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Bản đồ",
  description: "Bản đồ tương tác các quán cafe tại khu phố Tây An Thượng.",
};

export default function BanDoPage() {
  return (
    <ComingSoon
      title="Bản đồ tương tác An Thượng"
      description="Khám phá vị trí trực quan của hơn 100 quán cafe tại An Thượng cùng bộ lọc tiện ích và bảng giá nhanh trên nền tảng bản đồ số."
      icon={<MapPin className="size-8 stroke-[2.5]" />}
      plannedMilestone="Issue #6"
    />
  );
}
