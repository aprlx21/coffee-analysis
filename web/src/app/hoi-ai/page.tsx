import type { Metadata } from "next";

import { AskAiView } from "@/features/ask-ai";

export const metadata: Metadata = {
  title: "Hỏi AI · Trợ lý Cà phê An Thượng",
  description:
    "Hỏi trợ lý AI về quán cafe An Thượng: tiện ích làm việc, giá đồ uống từ thực đơn và báo cáo thị trường — trả lời từ dữ liệu thật của 115 quán.",
};

export default function HoiAiPage() {
  return <AskAiView />;
}
