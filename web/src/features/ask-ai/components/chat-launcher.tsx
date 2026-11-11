"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

// Chỉ tải panel (và useAskAi → fetch quota) khi mở lần đầu.
const ChatPopupPanel = dynamic(() => import("./chat-popup-panel"), { ssr: false });

const TEASER_KEY = "ask-ai-teaser-done";
const TEASER_DELAY_MS = 4000;

function readTeaserDone(): boolean {
  try {
    return window.localStorage.getItem(TEASER_KEY) === "1";
  } catch {
    return false;
  }
}

function writeTeaserDone() {
  try {
    window.localStorage.setItem(TEASER_KEY, "1");
  } catch {
    /* không có localStorage: bỏ qua */
  }
}

export function ChatLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [unread, setUnread] = React.useState(false);
  const [teaser, setTeaser] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hidden = pathname === "/hoi-ai";

  React.useEffect(() => {
    if (hidden || mounted || readTeaserDone()) return;
    const timer = window.setTimeout(() => setTeaser(true), TEASER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hidden, mounted]);

  const dismissTeaser = React.useCallback(() => {
    setTeaser(false);
    writeTeaserDone();
  }, []);

  const openPanel = React.useCallback(() => {
    setMounted(true);
    setOpen(true);
    setUnread(false);
    setTeaser(false);
    writeTeaserDone();
  }, []);

  const closePanel = React.useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  const handleReply = React.useCallback(() => {
    if (!open) setUnread(true);
  }, [open]);

  // Trang /hoi-ai đã có khung chat đầy đủ.
  if (hidden) return null;

  return (
    <>
      {mounted && (
        <ChatPopupPanel open={open} pathname={pathname} onClose={closePanel} onAssistantReply={handleReply} />
      )}
      <div
        className={cn(
          "fixed right-4 bottom-20 z-[45] flex max-w-[calc(100vw-2rem)] items-end gap-2 md:right-6 md:bottom-6",
          open && "max-md:hidden",
        )}
      >
        {teaser && !open && (
          <div className="relative mb-1 flex max-w-[15rem] animate-in items-start gap-1 rounded-xl rounded-br-sm glass-strong py-2 pr-1.5 pl-3 shadow-glass fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
            <button
              type="button"
              onClick={openPanel}
              className="cursor-pointer text-left text-xs leading-snug font-bold text-foreground outline-none focus-visible:underline"
            >
              Hỏi nhanh: quán nào có wifi mạnh gần biển? ☕
            </button>
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label="Ẩn gợi ý"
              className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
        <button
          ref={buttonRef}
          type="button"
          onClick={open ? closePanel : openPanel}
          aria-label="Mở trợ lý AI"
          aria-expanded={open}
          className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-glass-lg transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 motion-reduce:transition-none"
        >
          <MessageCircle className="size-5 stroke-[2.5]" />
          {unread && (
            <span
              className="absolute top-0 right-0 size-3 rounded-full border-2 border-background bg-destructive"
              aria-label="Có câu trả lời mới"
            />
          )}
        </button>
      </div>
    </>
  );
}
