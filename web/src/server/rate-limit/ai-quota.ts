import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { env } from "@/lib/env";
import { getSql } from "@/server/db/client";

export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  used: number;
  max: number;
  reset_at: string;
}

/**
 * Trích xuất định danh duy nhất của client từ IP + User-Agent kết hợp HMAC Salt.
 * Không lưu trữ địa chỉ IP dạng văn bản thuần nhằm bảo vệ quyền riêng tư.
 */
export async function getClientIdentifier(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const userAgent = headerList.get("user-agent") || "unknown-agent";

  return createHash("sha256").update(`${ip}:${userAgent}:${env.RATE_LIMIT_SALT}`).digest("hex");
}

/**
 * Kiểm tra và tăng lượt hỏi (Atomic) trực tiếp từ stored procedure trên Supabase.
 */
export async function checkAndConsumeAiQuota(identifier: string, maxLimit: number = 3): Promise<QuotaResult> {
  const sql = getSql();
  const rows = await sql<{ quota: QuotaResult }[]>`
    SELECT check_and_consume_ai_quota(${identifier}, ${maxLimit}) as quota
  `;
  return rows[0].quota;
}

/**
 * Lấy trạng thái quota hiện tại của client mà không làm tăng lượt hỏi.
 */
export async function getAiQuotaStatus(identifier: string, maxLimit: number = 3): Promise<QuotaResult> {
  const sql = getSql();
  const rows = await sql<{ quota: QuotaResult }[]>`
    SELECT get_ai_quota_status(${identifier}, ${maxLimit}) as quota
  `;
  return rows[0].quota;
}
