import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = {
  title: "Hỏi AI",
  description: "Trợ lý AI tìm quán cafe chuẩn gu tại An Thượng.",
};

export default function HoiAiPage() {
  return (
    <ComingSoon
      title="Hỏi AI Cà Phê"
      description="Trợ lý thông minh hỗ trợ tìm kiếm không gian ngồi làm việc, quán yên tĩnh có ổ điện hay điểm hẹn bạn bè qua trò chuyện tự nhiên."
      badgeText="SOON"
      icon={<Sparkles className="size-8 stroke-[2.5]" />}
      plannedMilestone="MVP v0.1"
    />
  );
}
