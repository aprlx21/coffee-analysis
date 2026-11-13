import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapLanguageModel } from "ai";

import { aiConfig, assertAIEnabled } from "./config";
import { isProviderSideError } from "./errors";

/**
 * Khởi tạo client theo tên model cụ thể.
 * Groq hỗ trợ chuẩn OpenAI-compatible tại https://api.groq.com/openai/v1/chat/completions
 */
function createModel(modelName: string) {
  switch (aiConfig.provider) {
    case "groq": {
      const groq = createOpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: aiConfig.apiKey,
      });
      // Dùng endpoint .chat() thay vì .responses() để tương thích chuẩn OpenAI Chat Completions của Groq
      return groq.chat(modelName);
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: aiConfig.apiKey,
      });
      return openai.chat(modelName);
    }
    default:
      throw new Error(`AI provider chưa được hỗ trợ: ${aiConfig.provider}`);
  }
}

/**
 * LLM Provider tập trung. Nếu cấu hình `AI_FALLBACK_MODEL`, khi model chính lỗi lúc mở stream
 * (429 rate limit, 5xx, model bị gỡ/sai tên 404, key 401…; trừ lỗi request 400/413/422) sẽ tự thử lại bằng model dự phòng — người dùng không thấy lỗi.
 * Lỗi giữa chừng khi đã stream một phần không được thử lại (tránh trộn hai câu trả lời).
 */
export function getModel() {
  assertAIEnabled();

  const primary = createModel(aiConfig.model || "qwen/qwen3.8-27b");
  if (!aiConfig.fallbackModel) return primary;

  const backup = createGoogleGenerativeAI({ apiKey: aiConfig.geminiApiKey })(aiConfig.fallbackModel);
  return wrapLanguageModel({
    model: primary,
    middleware: {
      wrapStream: async ({ doStream, params }) => {
        try {
          return await doStream();
        } catch (err) {
          if (params.abortSignal?.aborted || !isProviderSideError(err)) throw err;
          console.warn(`Model chính lỗi, chuyển sang model dự phòng ${aiConfig.fallbackModel}:`, err);
          return backup.doStream(params);
        }
      },
    },
  });
}
