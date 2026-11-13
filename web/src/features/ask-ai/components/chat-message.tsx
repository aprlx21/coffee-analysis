"use client";

import { Bot, CircleAlert, LoaderCircle } from "lucide-react";

import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

import type { ChatMessage } from "../hooks/use-ask-ai";

const TOOL_LABELS: Record<string, string> = {
  searchCafes: "Đang tìm quán phù hợp",
  getCafeDetail: "Đang xem chi tiết quán",
  getCafeMenu: "Đang đọc thực đơn",
  compareItemPrices: "Đang so sánh giá",
  getMarketInsights: "Đang tra báo cáo thị trường",
  searchKnowledge: "Đang tra cứu đánh giá & hồ sơ quán",
};

const TOOL_DONE_LABELS: Record<string, string> = {
  searchCafes: "Danh sách quán",
  getCafeDetail: "Chi tiết quán",
  getCafeMenu: "Thực đơn",
  compareItemPrices: "Bảng giá",
  getMarketInsights: "Báo cáo thị trường",
  searchKnowledge: "Tri thức quán",
};

export function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-primary text-primary-foreground shadow-glass-sm">
      <Bot className="size-4 stroke-[2.5]" />
    </div>
  );
}

export function MessageBubble({
  message,
  isStreaming,
  compact = false,
}: {
  message: ChatMessage;
  isStreaming: boolean;
  compact?: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[85%] rounded-xl rounded-tr-sm border border-border bg-primary px-3.5 py-2.5 text-sm font-bold break-words whitespace-pre-wrap text-primary-foreground shadow-glass-sm",
            compact ? "max-w-[90%]" : "sm:max-w-[75%]",
          )}
        >
          {message.text}
        </div>
      </div>
    );
  }

  const waiting = isStreaming && !message.text && !message.error;
  const finishedTools = message.tools.filter((tool) => tool !== message.activeTool);

  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar />
      <div className="min-w-0 flex-1 space-y-2">
        {(finishedTools.length > 0 || message.activeTool) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {finishedTools.map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
              >
                ✓ {TOOL_DONE_LABELS[tool] ?? "Dữ liệu"}
              </span>
            ))}
            {message.activeTool && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                <LoaderCircle className="size-3 animate-spin stroke-[2.5]" />
                {TOOL_LABELS[message.activeTool] ?? "Đang tra dữ liệu"}…
              </span>
            )}
          </div>
        )}

        {waiting && !message.activeTool && (
          <div
            className="inline-flex items-center gap-1.5 rounded-xl rounded-tl-sm glass px-3.5 py-3 shadow-glass-sm"
            role="status"
            aria-label="Trợ lý đang soạn câu trả lời"
          >
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-2 animate-bounce rounded-full bg-foreground"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        )}

        {message.text && (
          <div className="rounded-xl rounded-tl-sm glass px-3.5 py-3 shadow-glass-sm sm:px-4">
            <Markdown content={message.text} size="compact" />
          </div>
        )}

        {message.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-border bg-destructive/15 px-3 py-2.5 text-xs font-bold text-foreground sm:text-sm"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 stroke-[2.5]" />
            <span>{message.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
