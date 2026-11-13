import "server-only";

import { APICallError } from "ai";

/**
 * Lỗi KHÔNG do nội dung request của người dùng gây ra (quá tải, 429, 5xx, mạng, model bị gỡ/sai tên 404, key 401/403).
 * Dùng cho cả hai quyết định: thử model dự phòng và hoàn lượt hỏi. Người dùng không thể chủ ý gây ra các lỗi này
 * nên không có đường lạm dụng. Lỗi do chính request (400/413/422) thì không (trừ 413 do hạn mức token/phút của provider): model khác cũng sẽ lỗi và có thể bị lạm dụng.
 */
export function isProviderSideError(err: unknown): boolean {
  if (!APICallError.isInstance(err)) return true;
  const status = err.statusCode;
  // Groq trả 413 "Request too large ... tokens per minute" khi MỘT request vượt hạn mức token/phút của gói:
  // đây là giới hạn của provider (model dự phòng có hạn mức khác vẫn trả lời được), không phải request sai.
  if (status === 413 && isTokenRateLimit(err)) return true;
  return status === undefined || ![400, 413, 422].includes(status);
}

function isTokenRateLimit(err: APICallError): boolean {
  const text = `${err.message} ${err.responseBody ?? ""}`;
  return /rate_limit_exceeded|tokens per minute/i.test(text);
}
