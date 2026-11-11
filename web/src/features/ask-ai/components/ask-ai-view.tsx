"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Bot, Coffee, Dog, Laptop, Receipt, RotateCcw, Send, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SuggestedPrompt {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  category: string;
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "work-space",
    icon: Laptop,
    text: "Tìm quán yên tĩnh có máy lạnh và ổ cắm để làm việc chiều nay",
    category: "Làm việc",
  },
  {
    id: "salt-coffee",
    icon: Coffee,
    text: "Quán nào có cà phê muối ngon quanh đường Ngô Thì Sĩ?",
    category: "Món ngon",
  },
  {
    id: "compare-price",
    icon: Receipt,
    text: "So sánh giá bạc xỉu các quán tại An Thượng",
    category: "Giá OCR",
  },
  {
    id: "pet-friendly",
    icon: Dog,
    text: "Quán cafe nào cho phép mang thú cưng (pet-friendly)?",
    category: "Tiện ích",
  },
];

export function AskAiView() {
  const [selectedPrompt, setSelectedPrompt] = React.useState<SuggestedPrompt | null>(null);
  const [demoNotice, setDemoNotice] = React.useState<string | null>(null);

  const handleSelectPrompt = (prompt: SuggestedPrompt) => {
    setSelectedPrompt(prompt);
    setDemoNotice(
      `Bạn đã chọn câu hỏi demo: "${prompt.text}". Trợ lý AI đang được kết nối với cơ sở dữ liệu RAG (115 quán, 764 giá menu OCR, tiện ích thực địa). Tính năng sẽ phản hồi đầy đủ trong bản cập nhật tới!`,
    );
  };

  const handleReset = () => {
    setSelectedPrompt(null);
    setDemoNotice(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* ======================================================== */}
      {/* Top Header & Breadcrumb                                 */}
      {/* ======================================================== */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-bold")}>
            <ArrowLeft className="mr-1.5 size-3.5 stroke-[2.5]" />
            VỀ KHÁM PHÁ
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs font-black tracking-wider uppercase">
              SẮP RA MẮT
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs font-bold">
              MVP v0.1
            </Badge>
          </div>
        </div>

        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Hỏi AI Cà Phê An Thượng
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground sm:text-base">
            Trợ lý thông minh khai thác dữ liệu từ 115 quán cafe, hàng nghìn đánh giá thực tế và bảng giá menu bóc tách
            OCR.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Main Neubrutalist Chat Frame                             */}
      {/* ======================================================== */}
      <div className="flex min-h-[560px] flex-col overflow-hidden rounded-xl border-2 border-border bg-card shadow-hard-card">
        {/* Chatbox Header */}
        <header className="flex items-center justify-between border-b-2 border-border bg-muted/50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            {/* AI Avatar Brutalist */}
            <div className="flex size-10 items-center justify-center rounded-lg border-2 border-border bg-primary text-primary-foreground shadow-hard">
              <Bot className="size-5 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-extrabold text-foreground sm:text-lg">
                  Trợ lý Cà phê An Thượng
                </h2>
                <span className="hidden rounded-full border border-border bg-primary px-2 py-0.5 text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_var(--border)] sm:inline-block">
                  AI BOT
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block size-2 animate-pulse rounded-full border border-border bg-emerald-500" />
                <span className="text-xs font-semibold text-muted-foreground">
                  Chuẩn bị dữ liệu RAG · 115 quán phố Tây
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default" className="px-2.5 py-1 text-xs font-black tracking-wider uppercase">
              COMING SOON
            </Badge>
          </div>
        </header>

        {/* Chatbox Content / Messages Area */}
        <div className="flex flex-1 flex-col justify-between gap-6 p-4 sm:p-6">
          <div className="space-y-6">
            {/* AI Welcome Message */}
            <div className="flex items-start gap-3">
              <div className="hidden size-8 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-primary font-black text-primary-foreground shadow-hard-sm sm:flex">
                <Sparkles className="size-4 stroke-[2.5]" />
              </div>

              <div className="w-full max-w-2xl space-y-4 rounded-2xl rounded-tl-sm border-2 border-border bg-background p-4 shadow-hard-sm sm:p-5">
                <div className="flex items-center justify-between gap-2 border-b-2 border-border/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-foreground sm:text-base">
                      Trợ lý AI An Thượng
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      BẢN XEM TRƯỚC
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-muted-foreground">An Thượng, ĐN</span>
                </div>

                <div className="space-y-2 text-sm leading-relaxed font-medium text-foreground">
                  <p>
                    Chào bạn! Mình là <strong>Trợ lý AI chuyên biệt về cà phê An Thượng</strong>. Mình đang được huấn
                    luyện và nạp dữ liệu từ 115 quán cafe trong khu vực để giúp bạn tìm quán nhanh và chuẩn xác nhất:
                  </p>
                </div>

                {/* Capabilities grid */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5 rounded-lg border-2 border-border bg-card p-3 shadow-[2px_2px_0px_0px_var(--border)]">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground">
                      <Laptop className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Làm việc & Học tập</h3>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Tìm quán có máy lạnh, ổ cắm từng bàn, wifi mạnh và độ yên tĩnh cao.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border-2 border-border bg-card p-3 shadow-[2px_2px_0px_0px_var(--border)]">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground">
                      <Receipt className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">So sánh giá menu OCR</h3>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Tra cứu mức giá bạc xỉu, cold brew, cà phê muối bóc tách trực tiếp từ thực đơn.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border-2 border-border bg-card p-3 shadow-[2px_2px_0px_0px_var(--border)]">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground">
                      <Dog className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Tiện ích đặc thù</h3>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Quán mở khuya sau 22h, pet-friendly cho mang cún cưng, thanh toán Apple Pay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-lg border-2 border-border bg-card p-3 shadow-[2px_2px_0px_0px_var(--border)]">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground">
                      <Coffee className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">Gu quán chuẩn xác</h3>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Gợi ý quán cafe specialty, view chill ngắm biển Mỹ An hay góc hẹn hò lãng mạn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Prompts Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="font-heading text-xs font-extrabold tracking-wide text-foreground uppercase sm:text-sm">
                  CÂU HỎI GỢI Ý MẪU (BẤM ĐỂ TRẢI NGHIỆM THỬ)
                </span>
              </div>

              <TooltipProvider delay={100}>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => {
                    const Icon = prompt.icon;
                    const isSelected = selectedPrompt?.id === prompt.id;
                    return (
                      <Tooltip key={prompt.id}>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              onClick={() => handleSelectPrompt(prompt)}
                              className={cn(
                                "group flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isSelected
                                  ? "translate-x-[1px] translate-y-[1px] bg-primary text-primary-foreground shadow-hard"
                                  : "bg-card text-foreground shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-muted hover:shadow-hard active:translate-x-[2px] active:translate-y-[2px]",
                              )}
                            />
                          }
                        >
                          <div
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-md border border-border shadow-[1px_1px_0px_0px_var(--border)] transition-colors",
                              isSelected
                                ? "bg-card text-foreground"
                                : "bg-primary text-primary-foreground group-hover:bg-primary",
                            )}
                          >
                            <Icon className="size-3.5 stroke-[2.5]" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-0.5 flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "text-[10px] font-black tracking-wider uppercase",
                                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground",
                                )}
                              >
                                {prompt.category}
                              </span>
                            </div>
                            <p className="text-xs leading-snug font-bold sm:text-sm">{prompt.text}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span>Tính năng AI đang hoàn thiện</span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            {/* Simulated Interactive Dialog when a prompt is clicked */}
            {selectedPrompt && (
              <div className="animate-in space-y-4 pt-2 fade-in-50 slide-in-from-bottom-2">
                {/* User query bubble */}
                <div className="flex justify-end">
                  <div className="max-w-md rounded-2xl rounded-tr-sm border-2 border-border bg-primary p-3.5 text-xs font-bold text-primary-foreground shadow-hard sm:text-sm">
                    {selectedPrompt.text}
                  </div>
                </div>

                {/* AI response preview bubble */}
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-primary font-black text-primary-foreground shadow-hard-sm">
                    <Bot className="size-4 stroke-[2.5]" />
                  </div>

                  <div className="w-full max-w-xl space-y-3 rounded-2xl rounded-tl-sm border-2 border-border bg-muted p-4 shadow-hard-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Trợ lý AI Cà phê An Thượng</span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex cursor-pointer items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="size-3 stroke-[2.5]" />
                        Đặt lại
                      </button>
                    </div>

                    <p className="text-xs leading-relaxed font-medium text-foreground sm:text-sm">{demoNotice}</p>

                    <div className="rounded-md border border-border bg-card p-2.5 text-[11px] font-semibold text-muted-foreground">
                      📌 <strong>Lộ trình RAG</strong>: Dữ liệu câu hỏi này sẽ được truy xuất tự động từ hệ thống
                      Medallion (bảng Silver `shop_facility` và View Gold `v_typical_price_v2`) khi ra mắt.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chatbox Input Footer */}
          <div className="rounded-lg border-2 border-border bg-card p-3 shadow-hard-sm">
            <div className="relative flex items-center gap-2">
              <Input
                type="text"
                disabled
                value={selectedPrompt ? selectedPrompt.text : ""}
                placeholder="Hỏi bất kỳ điều gì về quán cafe An Thượng..."
                className="h-11 bg-background pr-24 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-75 sm:text-sm"
              />

              <div className="absolute right-14 hidden sm:block">
                <Badge variant="outline" className="text-[10px] font-bold">
                  SẮP RA MẮT
                </Badge>
              </div>

              <Button
                type="button"
                disabled
                variant="default"
                size="icon"
                className="size-11 shrink-0 cursor-not-allowed opacity-60"
                aria-label="Gửi câu hỏi (đang phát triển)"
              >
                <Send className="size-4 stroke-[2.5]" />
              </Button>
            </div>

            <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
              Tính năng AI & Chatbot RAG đang được phát triển cho bản cập nhật tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
