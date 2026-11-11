import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Insights",
  description: "Báo cáo dữ liệu và góc nhìn F&B khu phố Tây An Thượng.",
};

export default function InsightsPage() {
  return (
    <ComingSoon
      title="Coffee Insights & Báo cáo"
      description="Góc nhìn đa chiều về thói quen người dùng, chất lượng dịch vụ và cơ hội kinh doanh F&B tại khu phố du lịch An Thượng."
      badgeText="SOON"
      icon={<Lightbulb className="size-8 stroke-[2.5]" />}
      plannedMilestone="MVP v0.1"
    />
  );
}
