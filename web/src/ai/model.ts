import "server-only";

import { createOpenAI } from "@ai-sdk/openai";

import { aiConfig, assertAIEnabled } from "./config";

/**
 * Khởi tạo LLM Provider tập trung.
 * Groq hỗ trợ chuẩn OpenAI-compatible tại https://api.groq.com/openai/v1/chat/completions
 */
export function getModel() {
  assertAIEnabled();

  switch (aiConfig.provider) {
    case "groq": {
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: aiConfig.apiKey,
      });
      // Dùng endpoint .chat() thay vì .responses() để tương thích chuẩn OpenAI Chat Completions của Groq
      return groq.chat(aiConfig.model || "qwen/qwen3.8-27b");
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: aiConfig.apiKey,
      });
      return openai.chat(aiConfig.model || "gpt-4o-mini");
    }
    default:
      throw new Error(`AI provider chưa được hỗ trợ: ${aiConfig.provider}`);
  }
}
