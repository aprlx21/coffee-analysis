"use client";

import * as React from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Tên các tool server đã gọi trong lượt trả lời này (để hiển thị tiến trình). */
  tools: string[];
  /** Tool đang chạy (chưa có kết quả). */
  activeTool: string | null;
  error?: string;
}

export interface AiQuota {
  remaining: number;
  max: number;
  resetAt: string | null;
}

export type ChatStatus = "idle" | "submitting" | "streaming";

interface StreamChunk {
  type: string;
  delta?: string;
  toolName?: string;
  errorText?: string;
}

const GENERIC_ERROR = "Không kết nối được với trợ lý AI. Bạn kiểm tra mạng rồi thử lại nhé.";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function parseQuota(payload: unknown): AiQuota | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  if (typeof data.remaining !== "number" || typeof data.max !== "number") return null;
  return {
    remaining: data.remaining,
    max: data.max,
    resetAt: typeof data.reset_at === "string" ? data.reset_at : null,
  };
}

/**
 * Hook chat với `/api/ai/chat` (UI message stream dạng SSE của AI SDK).
 * Tự đọc stream thay vì dùng `@ai-sdk/react` để không thêm dependency.
 */
export function useAskAi() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [status, setStatus] = React.useState<ChatStatus>("idle");
  const [quota, setQuota] = React.useState<AiQuota | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const messagesRef = React.useRef<ChatMessage[]>([]);

  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ai/quota", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const parsed = parseQuota(data);
        if (parsed) setQuota(parsed);
      })
      .catch(() => {
        /* không chặn UI nếu không lấy được quota */
      });
    return () => {
      controller.abort();
      abortRef.current?.abort();
    };
  }, []);

  const patchMessage = React.useCallback((id: string, patch: (message: ChatMessage) => ChatMessage) => {
    setMessages((current) => current.map((message) => (message.id === id ? patch(message) : message)));
  }, []);

  const send = React.useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || abortRef.current) return;

      const userMessage: ChatMessage = { id: nextId("u"), role: "user", text, tools: [], activeTool: null };
      const assistantId = nextId("a");
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        tools: [],
        activeTool: null,
      };

      // Chỉ gửi lịch sử có nội dung; bỏ các lượt lỗi.
      const history = [...messagesRef.current.filter((message) => message.text && !message.error), userMessage];
      setMessages((current) => [...current, userMessage, assistantMessage]);
      setStatus("submitting");

      const controller = new AbortController();
      abortRef.current = controller;

      const fail = (error: string) => patchMessage(assistantId, (message) => ({ ...message, activeTool: null, error }));

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.map((message) => ({
              id: message.id,
              role: message.role,
              parts: [{ type: "text", text: message.text.slice(0, 8000) }],
            })),
          }),
        });

        if (!response.ok || !response.body) {
          const payload: unknown = await response.json().catch(() => null);
          const data = (payload ?? {}) as Record<string, unknown>;
          if (response.status === 429) {
            const parsed = parseQuota(data);
            setQuota((current) => parsed ?? (current ? { ...current, remaining: 0 } : current));
          }
          fail(typeof data.message === "string" ? data.message : GENERIC_ERROR);
          return;
        }

        const remainingHeader = response.headers.get("X-AI-Remaining-Quota");
        if (remainingHeader !== null && !Number.isNaN(Number(remainingHeader))) {
          const maxHeader = Number(response.headers.get("X-AI-Quota-Max"));
          setQuota((current) => ({
            remaining: Number(remainingHeader),
            max: maxHeader || current?.max || 3,
            resetAt: current?.resetAt ?? null,
          }));
        }

        setStatus("streaming");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const handleChunk = (chunk: StreamChunk) => {
          switch (chunk.type) {
            case "text-start":
              patchMessage(assistantId, (message) =>
                message.text && !message.text.endsWith("\n\n") ? { ...message, text: `${message.text}\n\n` } : message,
              );
              break;
            case "text-delta":
              if (chunk.delta) {
                const delta = chunk.delta;
                patchMessage(assistantId, (message) => ({ ...message, activeTool: null, text: message.text + delta }));
              }
              break;
            case "tool-input-start":
            case "tool-input-available":
              if (chunk.toolName) {
                const toolName = chunk.toolName;
                patchMessage(assistantId, (message) => ({
                  ...message,
                  activeTool: toolName,
                  tools: message.tools.includes(toolName) ? message.tools : [...message.tools, toolName],
                }));
              }
              break;
            case "tool-output-available":
            case "tool-output-error":
              patchMessage(assistantId, (message) => ({ ...message, activeTool: null }));
              break;
            case "error":
              fail(chunk.errorText || GENERIC_ERROR);
              break;
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            for (const line of event.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                handleChunk(JSON.parse(data) as StreamChunk);
              } catch {
                /* bỏ qua chunk hỏng */
              }
            }
          }
        }

        patchMessage(assistantId, (message) =>
          message.text || message.error
            ? { ...message, activeTool: null }
            : { ...message, activeTool: null, error: "Trợ lý chưa đưa ra được câu trả lời. Bạn thử diễn đạt lại nhé." },
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          patchMessage(assistantId, (message) =>
            message.text
              ? { ...message, activeTool: null }
              : { ...message, activeTool: null, error: "Đã dừng trả lời." },
          );
        } else {
          fail(GENERIC_ERROR);
        }
      } finally {
        abortRef.current = null;
        setStatus("idle");
      }
    },
    [patchMessage],
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
  }, []);

  return { messages, status, quota, send, stop, reset };
}
