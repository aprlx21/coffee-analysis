import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

/**
 * Giao diện embedder trả về từ createEmbedder.
 */
export interface Embedder {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

/**
 * Phân loại lỗi từ Gemini API / AI SDK để quyết định retry hay dừng ngay.
 */
interface ErrorClassification {
  isPermanent: boolean;
  permanentMessage?: string;
  isRetryable: boolean;
  retryAfterMs?: number;
}

function classifyError(error: unknown): ErrorClassification {
  const err = error as Record<string, unknown> | null | undefined;
  const status =
    typeof err?.statusCode === "number" ? err.statusCode : typeof err?.status === "number" ? err.status : undefined;

  const message = String(err?.message ?? error ?? "");

  // Đọc header Retry-After nếu có
  let retryAfterMs: number | undefined;
  const headers = (err?.responseHeaders ?? err?.headers) as Record<string, string> | undefined;
  const retryAfterHeader = headers?.["retry-after"] ?? headers?.["Retry-After"];
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader);
    if (!Number.isNaN(seconds) && seconds > 0) {
      retryAfterMs = seconds * 1000;
    } else {
      const parsedDate = Date.parse(retryAfterHeader);
      if (!Number.isNaN(parsedDate)) {
        const diff = parsedDate - Date.now();
        if (diff > 0) retryAfterMs = diff;
      }
    }
  }

  // Quota = 0 hoặc tài khoản không có hạn mức miễn phí (lỗi vĩnh viễn)
  if (
    /limit[:\s]+0(?:\.0+)?\b/i.test(message) ||
    /quota[:\s]+0\b/i.test(message) ||
    /quota\s*=\s*0/i.test(message) ||
    /free tier.*not available/i.test(message) ||
    /billing.*required/i.test(message)
  ) {
    return {
      isPermanent: true,
      permanentMessage: "quota = 0: bật billing hoặc đổi provider",
      isRetryable: false,
    };
  }

  // 401 / 403: Thiếu hoặc sai API key
  if (
    status === 401 ||
    status === 403 ||
    /api_key_invalid|invalid_api_key|api key not valid|unauthenticated|permission_denied/i.test(message)
  ) {
    return {
      isPermanent: true,
      permanentMessage: "thiếu hoặc sai GEMINI_API_KEY (401/403)",
      isRetryable: false,
    };
  }

  // 400: Yêu cầu không hợp lệ
  if (status === 400 || /bad request|invalid argument/i.test(message)) {
    return {
      isPermanent: true,
      permanentMessage: `yêu cầu embedding không hợp lệ (400): ${message}`,
      isRetryable: false,
    };
  }

  // 404: Model không tồn tại
  if (status === 404 || /not found/i.test(message)) {
    return {
      isPermanent: true,
      permanentMessage: `model embedding không tồn tại (404): ${message}`,
      isRetryable: false,
    };
  }

  // 429 hoặc lỗi quota tạm thời (rate limit)
  if (status === 429 || /rate_limit|rate limit|too many requests|resource_exhausted|quota exceeded/i.test(message)) {
    return {
      isPermanent: false,
      isRetryable: true,
      retryAfterMs,
    };
  }

  // 5xx: Lỗi máy chủ Google
  if (status && status >= 500 && status < 600) {
    return {
      isPermanent: false,
      isRetryable: true,
      retryAfterMs,
    };
  }

  // Lỗi mạng tạm thời
  if (/fetch failed|network|econnreset|etimedout|socket hang up|timeout/i.test(message)) {
    return {
      isPermanent: false,
      isRetryable: true,
      retryAfterMs,
    };
  }

  return {
    isPermanent: false,
    isRetryable: false,
    retryAfterMs,
  };
}

/**
 * Chuẩn hóa vector theo chuẩn Euclidean (L2 norm).
 * Bắt buộc khi dùng outputDimensionality < 3072 trên Gemini embedding.
 * Nếu là vector 0 hoặc norm không hợp lệ, trả về bản sao nguyên bản.
 */
export function normalizeVector(v: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < v.length; i++) {
    const val = v[i] ?? 0;
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0 || !Number.isFinite(norm)) {
    return [...v];
  }
  return v.map((x) => x / norm);
}

/**
 * Khởi tạo client embedder cho Google Gemini embedding models.
 * Dùng được cả trong Next.js server lẫn Node script độc lập.
 */
export function createEmbedder(opts: { apiKey: string; model: string; dimensions: number }): Embedder {
  const { apiKey, model: modelId, dimensions } = opts;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("createEmbedder yêu cầu apiKey hợp lệ");
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const modelInstance = google.embedding(modelId);

  // modelInstance.maxEmbeddingsPerCall thường là 100 trên Gemini
  const batchLimit =
    typeof modelInstance.maxEmbeddingsPerCall === "number" && modelInstance.maxEmbeddingsPerCall > 0
      ? modelInstance.maxEmbeddingsPerCall
      : 100;

  return {
    async embedDocuments(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) {
        return [];
      }

      const allVectors: number[][] = [];

      for (let i = 0; i < texts.length; i += batchLimit) {
        const batch = texts.slice(i, i + batchLimit);
        let batchSuccess = false;
        let lastError: unknown;
        const maxAttempts = 6;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const result = await embedMany({
              model: modelInstance,
              values: batch,
              dimensions,
              maxRetries: 0,
              providerOptions: {
                google: {
                  taskType: "RETRIEVAL_DOCUMENT",
                  outputDimensionality: dimensions,
                },
              },
            });

            if (!result.embeddings || result.embeddings.length !== batch.length) {
              throw new Error(
                `Số lượng vector trả về (${result.embeddings?.length ?? 0}) không khớp số lượng văn bản (${batch.length})`,
              );
            }

            for (let j = 0; j < result.embeddings.length; j++) {
              const rawVec = result.embeddings[j];
              if (!Array.isArray(rawVec) || rawVec.length !== dimensions) {
                throw new Error(
                  `Vector embedding tài liệu không đúng độ dài mong đợi: nhận ${rawVec?.length ?? 0}, mong đợi ${dimensions}`,
                );
              }
              allVectors.push(normalizeVector(rawVec));
            }

            batchSuccess = true;
            break;
          } catch (err) {
            lastError = err;
            const classification = classifyError(err);

            if (classification.isPermanent) {
              throw new Error(classification.permanentMessage);
            }

            if (!classification.isRetryable || attempt === maxAttempts - 1) {
              throw err instanceof Error ? err : new Error(String(err));
            }

            // Backoff mũ: 2s -> 60s có jitter
            const baseDelay = Math.min(60000, 2000 * Math.pow(2, attempt));
            const jitter = Math.random() * 1000;
            let waitMs = Math.min(60000, baseDelay + jitter);

            if (classification.retryAfterMs && classification.retryAfterMs > 0) {
              waitMs = Math.max(waitMs, Math.min(60000, classification.retryAfterMs));
            }

            await new Promise((resolve) => setTimeout(resolve, waitMs));
          }
        }

        if (!batchSuccess) {
          throw lastError instanceof Error ? lastError : new Error(String(lastError));
        }
      }

      return allVectors;
    },

    async embedQuery(text: string): Promise<number[]> {
      const maxAttempts = 2;
      let lastError: unknown;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const result = await embed({
            model: modelInstance,
            value: text,
            dimensions,
            maxRetries: 0,
            providerOptions: {
              google: {
                taskType: "RETRIEVAL_QUERY",
                outputDimensionality: dimensions,
              },
            },
          });

          const rawVec = result.embedding;
          if (!Array.isArray(rawVec) || rawVec.length !== dimensions) {
            throw new Error(
              `Vector query không đúng độ dài mong đợi: nhận ${rawVec?.length ?? 0}, mong đợi ${dimensions}`,
            );
          }

          return normalizeVector(rawVec);
        } catch (err) {
          lastError = err;
          const classification = classifyError(err);

          if (classification.isPermanent) {
            throw new Error(classification.permanentMessage);
          }

          if (!classification.isRetryable || attempt === maxAttempts - 1) {
            throw err instanceof Error ? err : new Error(String(err));
          }

          // Retry ngắn cho request người dùng (500ms - 1000ms có jitter)
          const waitMs =
            classification.retryAfterMs && classification.retryAfterMs > 0
              ? Math.min(5000, classification.retryAfterMs)
              : 500 * (attempt + 1) + Math.random() * 200;

          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }

      throw lastError instanceof Error ? lastError : new Error(String(lastError));
    },
  };
}
