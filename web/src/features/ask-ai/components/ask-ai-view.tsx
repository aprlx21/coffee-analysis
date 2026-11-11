"use client";

import * as React from "react";
import {
  Bot,
  CircleAlert,
  Coffee,
  Dog,
  Laptop,
  LoaderCircle,
  Receipt,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  TrendingUp,
} from "lucide-react";

import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useAskAi, type AiQuota, type ChatMessage } from "../hooks/use-ask-ai";

interface SuggestedPrompt {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  category: string;
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "work-space",
    icon: Laptop,
    text: "Tìm quán yên tĩnh có máy lạnh và ổ cắm để làm việc chiều nay",
    category: "Làm việc",
  },
  {
    id: "compare-price",
    icon: Receipt,
    text: "So sánh giá bạc xỉu các quán tại An Thượng",
    category: "Giá menu",
  },
  {
    id: "salt-coffee",
    icon: Coffee,
    text: "Quán nào có cà phê muối dưới 40.000đ?",
    category: "Món ngon",
  },
  {
    id: "pet-friendly",
    icon: Dog,
    text: "Quán nào cho mang thú cưng và có chỗ ngồi ngoài trời?",
    category: "Tiện ích",
  },
  {
    id: "market",
    icon: TrendingUp,
    text: "Có nên mở quán cafe làm việc ở An Thượng không?",
    category: "Thị trường",
  },
];

const TOOL_LABELS: Record<string, string> = {
  searchCafes: "Đang tìm quán phù hợp",
  getCafeDetail: "Đang xem chi tiết quán",
  getCafeMenu: "Đang đọc thực đơn",
  compareItemPrices: "Đang so sánh giá",
  getMarketInsights: "Đang tra báo cáo thị trường",
};

const TOOL_DONE_LABELS: Record<string, string> = {
  searchCafes: "Danh sách quán",
  getCafeDetail: "Chi tiết quán",
  getCafeMenu: "Thực đơn",
  compareItemPrices: "Bảng giá",
  getMarketInsights: "Báo cáo thị trường",
};

const MAX_INPUT_CHARS = 500;

function formatResetTime(resetAt: string | null): string | null {
  if (!resetAt) return null;
  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

function QuotaMeter({ quota }: { quota: AiQuota | null }) {
  if (!quota) {
    return <span className="h-7 w-28 animate-pulse rounded-full border-2 border-border bg-muted" aria-hidden="true" />;
  }
  return (
    <div
      className="flex items-center gap-2 rounded-full border-2 border-border bg-card px-2.5 py-1 shadow-hard-sm"
      aria-label={`Còn ${quota.remaining} trên ${quota.max} lượt hỏi hôm nay`}
    >
      <div className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: quota.max }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-2.5 rounded-full border-2 border-border",
              index < quota.remaining ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] font-bold whitespace-nowrap text-foreground">
        {quota.remaining}/{quota.max} lượt
      </span>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-primary text-primary-foreground shadow-hard-sm">
      <Bot className="size-4 stroke-[2.5]" />
    </div>
  );
}

function MessageBubble({ message, isStreaming }: { message: ChatMessage; isStreaming: boolean }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl rounded-tr-sm border-2 border-border bg-primary px-3.5 py-2.5 text-sm font-bold break-words whitespace-pre-wrap text-primary-foreground shadow-hard-sm sm:max-w-[75%]">
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
                className="rounded-full border-2 border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
              >
                ✓ {TOOL_DONE_LABELS[tool] ?? "Dữ liệu"}
              </span>
            ))}
            {message.activeTool && (
              <span className="flex items-center gap-1 rounded-full border-2 border-border bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                <LoaderCircle className="size-3 animate-spin stroke-[2.5]" />
                {TOOL_LABELS[message.activeTool] ?? "Đang tra dữ liệu"}…
              </span>
            )}
          </div>
        )}

        {waiting && !message.activeTool && (
          <div
            className="inline-flex items-center gap-1.5 rounded-xl rounded-tl-sm border-2 border-border bg-card px-3.5 py-3 shadow-hard-sm"
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
          <div className="rounded-xl rounded-tl-sm border-2 border-border bg-card px-3.5 py-3 shadow-hard-sm sm:px-4">
            <Markdown content={message.text} />
          </div>
        )}

        {message.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border-2 border-border bg-destructive/15 px-3 py-2.5 text-xs font-bold text-foreground sm:text-sm"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 stroke-[2.5]" />
            <span>{message.error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ disabled, onPick }: { disabled: boolean; onPick: (text: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2.5">
        <AssistantAvatar />
        <div className="max-w-xl rounded-xl rounded-tl-sm border-2 border-border bg-card px-3.5 py-3 text-sm leading-relaxed font-medium text-foreground shadow-hard-sm sm:px-4">
          Chào bạn! Mình tra cứu trực tiếp dữ liệu <strong className="font-extrabold">115 quán cafe An Thượng</strong>:
          tiện ích làm việc, giá đồ uống từ thực đơn và báo cáo thị trường. Hỏi mình bất cứ điều gì, hoặc chọn một gợi ý
          bên dưới.
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-foreground uppercase">
          <Sparkles className="size-3.5 stroke-[2.5]" />
          Gợi ý câu hỏi
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((prompt) => {
            const Icon = prompt.icon;
            return (
              <button
                key={prompt.id}
                type="button"
                disabled={disabled}
                onClick={() => onPick(prompt.text)}
                className="group flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-card p-3 text-left shadow-hard-sm transition-all outline-none hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard focus-visible:ring-2 focus-visible:ring-ring active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border-2 border-border bg-primary text-primary-foreground">
                  <Icon className="size-4 stroke-[2.5]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                    {prompt.category}
                  </span>
                  <span className="block text-sm leading-snug font-bold text-foreground">{prompt.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AskAiView() {
  const { messages, status, quota, send, stop, reset } = useAskAi();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const stickToBottomRef = React.useRef(true);

  const busy = status !== "idle";
  const outOfQuota = quota !== null && quota.remaining <= 0;
  const resetTime = formatResetTime(quota?.resetAt ?? null);
  const lastMessageId = messages[messages.length - 1]?.id;

  // Tự cuộn xuống cuối khi có nội dung mới, trừ khi người dùng đang cuộn lên đọc lại.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const submit = (text: string) => {
    if (busy || outOfQuota || !text.trim()) return;
    stickToBottomRef.current = true;
    setInput("");
    void send(text);
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-[30rem] max-w-4xl flex-col px-4 pt-4 md:h-[calc(100dvh-2rem)] md:pt-6">
      {/* Tiêu đề trang */}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Hỏi AI</h1>
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            Trợ lý trả lời từ dữ liệu thật của 115 quán cafe An Thượng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuotaMeter quota={quota} />
          {messages.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="stroke-[2.5]" />
              Chat mới
            </Button>
          )}
        </div>
      </div>

      {/* Khung chat */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border-2 border-border bg-background shadow-hard-card">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-muted/40 p-3 sm:p-5"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <EmptyState disabled={busy || outOfQuota} onPick={submit} />
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} isStreaming={busy && message.id === lastMessageId} />
            ))
          )}
        </div>

        {/* Ô nhập */}
        <div className="border-t-2 border-border bg-card p-3">
          {outOfQuota ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border-2 border-border bg-primary/30 px-3 py-2.5 text-xs font-bold text-foreground sm:text-sm"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0 stroke-[2.5]" />
              <span>
                Bạn đã dùng hết {quota.max} lượt hỏi miễn phí hôm nay
                {resetTime ? ` — lượt mới mở lại lúc ${resetTime}` : ""}. Trong lúc chờ, bạn có thể dùng bộ lọc ở trang
                Khám phá.
              </span>
            </div>
          ) : (
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submit(input);
              }}
            >
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={MAX_INPUT_CHARS}
                enterKeyHint="send"
                autoComplete="off"
                aria-label="Câu hỏi cho trợ lý AI"
                placeholder="Hỏi về quán, giá đồ uống, tiện ích…"
                className="h-11 flex-1 bg-background text-sm font-medium"
              />
              {busy ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  onClick={stop}
                  aria-label="Dừng trả lời"
                  className="shrink-0"
                >
                  <Square className="size-4 fill-current stroke-[2.5]" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon-lg"
                  disabled={!input.trim()}
                  aria-label="Gửi câu hỏi"
                  className="shrink-0"
                >
                  <Send className="size-4 stroke-[2.5]" />
                </Button>
              )}
            </form>
          )}
          <p className="mt-2 text-center text-[11px] font-medium text-muted-foreground">
            AI có thể trả lời sai — hãy mở trang quán để kiểm tra lại. Máy lạnh và ổ cắm là thông tin suy luận từ
            review.
          </p>
        </div>
      </div>
    </div>
  );
}
