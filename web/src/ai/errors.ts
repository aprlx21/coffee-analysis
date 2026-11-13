import "server-only";

import { APICallError } from "ai";

/**
 * Lỗi do phía provider (quá tải, 429, 5xx, timeout, mạng) — đáng thử model dự phòng và đáng hoàn lượt.
 * Lỗi 4xx khác (400 request sai, 401/403 key sai…) là do request/cấu hình, không phải lỗi tạm thời:
 * không fallback (tránh nhân đôi lượt gọi) và không hoàn lượt (tránh lạm dụng).
 */
export function isProviderSideError(err: unknown): boolean {
  if (!APICallError.isInstance(err)) return true;
  const status = err.statusCode;
  return status === undefined || status === 408 || status === 429 || status >= 500;
}
