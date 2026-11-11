import type { Metadata } from "next";

import { AskAiView } from "@/features/ask-ai";

export const metadata: Metadata = {
  title: "Hỏi AI · Trợ lý Cà phê An Thượng",
  description:
    "Trợ lý thông minh khai thác dữ liệu từ 115 quán cafe, hàng nghìn đánh giá thực tế và bảng giá menu bóc tách OCR tại An Thượng, Đà Nẵng.",
};

export default function HoiAiPage() {
  return <AskAiView />;
}
