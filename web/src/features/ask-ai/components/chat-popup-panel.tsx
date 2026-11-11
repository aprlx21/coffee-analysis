"use client";

import * as React from "react";
import Link from "next/link";
import { CircleAlert, Coffee, Laptop, Maximize2, Receipt, RotateCcw, Send, Sparkles, Square, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useAskAi } from "../hooks/use-ask-ai";
import { AssistantAvatar, MessageBubble } from "./chat-message";

const MAX_INPUT_CHARS = 500;
const CAFE_PATH_RE = /^\/quan\/([^/?#]+)/;

interface Suggestion {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
}

function buildSuggestions(pathname: string): Suggestion[] {
  const base: Suggestion[] = [
    {
      id: "wifi-work",
      icon: Laptop,
      label: "Quán wifi mạnh, yên tĩnh làm việc",
      text: "Tìm quán yên tĩnh có wifi mạnh và ổ cắm để làm việc",
    },
    { id: "price", icon: Receipt, label: "So sánh giá bạc xỉu", text: "So sánh giá bạc xỉu các quán tại An Thượng" },
    { id: "salt", icon: Coffee, label: "Cà phê muối dưới 40k", text: "Quán nào có cà phê muối dưới 40.000đ?" },
  ];
  const match = CAFE_PATH_RE.exec(pathname);
  if (!match) return base;
  let placeId = match[1];
  try {
    placeId = decodeURIComponent(placeId);
  } catch {
    /* giữ nguyên */
  }
  return [
    {
      id: "this-cafe",
      icon: Sparkles,
      label: "Quán này có ổ cắm và máy lạnh không?",
      // getCafeDetail nhận placeId → đưa vào câu hỏi để AI gọi tool.
      text: `Quán này (placeId: ${placeId}) có ổ cắm và máy lạnh không? Hãy xem chi tiết quán theo placeId đó.`,
    },
    ...base,
  ];
}

interface ChatPopupPanelProps {
  open: boolean;
  pathname: string;
  onClose: () => void;
  onAssistantReply: () => void;
}

export default function ChatPopupPanel({ open, pathname, onClose, onAssistantReply }: ChatPopupPanelProps) {
  const { messages, status, quota, send, stop, reset } = useAskAi();
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const stickRef = React.useRef(true);
  const prevStatusRef = React.useRef(status);

  const busy = status !== "idle";
  const outOfQuota = quota !== null && quota.remaining <= 0;
  const lastMessageId = messages[messages.length - 1]?.id;
  const suggestions = React.useMemo(() => buildSuggestions(pathname), [pathname]);

  const adjustTextareaHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${Math.max(40, nextHeight)}px`;
  }, []);

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  React.useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  // Báo cho launcher khi trợ lý trả lời xong (hiện chấm chưa đọc nếu panel đang đóng).
  React.useEffect(() => {
    if (prevStatusRef.current !== "idle" && status === "idle") {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.text) onAssistantReply();
    }
    prevStatusRef.current = status;
  }, [status, messages, onAssistantReply]);

  const submit = (text: string) => {
    if (busy || outOfQuota || !text.trim()) return;
    stickRef.current = true;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
    void send(text);
  };

  return (
    <div
      role="dialog"
      aria-label="Trợ lý An Thượng"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      className={cn(
        "fixed z-[46] flex flex-col overflow-hidden rounded-xl glass-strong shadow-glass-lg",
        "inset-x-2 bottom-20 h-[min(34rem,calc(100dvh-9rem))]",
        "md:inset-x-auto md:right-6 md:bottom-24 md:h-[min(35rem,70dvh)] md:w-[380px]",
        "origin-bottom-right transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none",
        open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-3 scale-95 opacity-0",
      )}
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <AssistantAvatar />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-sm font-bold text-foreground">Trợ lý An Thượng</h2>
          <p className="text-[11px] font-medium text-muted-foreground">
            {quota ? `Còn ${quota.remaining}/${quota.max} lượt hỏi hôm nay` : "Hỏi nhanh về quán cafe"}
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={reset}
            aria-label="Cuộc trò chuyện mới (Xóa lịch sử)"
            title="Cuộc trò chuyện mới (Xóa lịch sử)"
          >
            <RotateCcw className="stroke-[2.5]" />
          </Button>
        )}
        <Link
          href="/hoi-ai"
          aria-label="Mở trang đầy đủ"
          title="Mở trang đầy đủ"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <Maximize2 className="stroke-[2.5]" />
        </Link>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Đóng trợ lý">
          <X className="stroke-[2.5]" />
        </Button>
      </header>

      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-muted/40 p-3"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <AssistantAvatar />
              <div className="rounded-xl rounded-tl-sm glass px-3 py-2.5 text-sm leading-relaxed font-medium text-foreground shadow-glass-sm">
                Chào bạn! Hỏi mình về quán cafe, giá đồ uống hay tiện ích ở An Thượng nhé.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busy || outOfQuota}
                    onClick={() => submit(item.text)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full glass px-3 py-1.5 text-left text-xs font-bold text-foreground shadow-glass-sm transition-all outline-none hover:-translate-y-0.5 hover:shadow-glass focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Icon className="size-3.5 shrink-0 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              compact
              isStreaming={busy && message.id === lastMessageId}
            />
          ))
        )}
      </div>

      <div className="border-t border-border bg-card p-2.5">
        {outOfQuota ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-border bg-primary/30 px-3 py-2 text-xs font-bold text-foreground"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 stroke-[2.5]" />
            <span>Bạn đã dùng hết lượt hỏi hôm nay. Quay lại sau nhé.</span>
          </div>
        ) : (
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit(input);
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              disabled={busy}
              maxLength={MAX_INPUT_CHARS}
              aria-label="Câu hỏi cho trợ lý AI"
              placeholder="Hỏi về quán, giá, tiện ích…"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  submit(input);
                }
              }}
              className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            />
            {busy ? (
              <Button type="button" variant="outline" size="icon-lg" onClick={stop} aria-label="Dừng trả lời">
                <Square className="size-4 fill-current stroke-[2.5]" />
              </Button>
            ) : (
              <Button type="submit" size="icon-lg" disabled={!input.trim()} aria-label="Gửi câu hỏi">
                <Send className="size-4 stroke-[2.5]" />
              </Button>
            )}
          </form>
        )}
        <p className="mt-1.5 text-center text-[10px] font-medium text-muted-foreground">
          AI có thể trả lời sai — hãy kiểm tra lại trên trang quán.
        </p>
      </div>
    </div>
  );
}
