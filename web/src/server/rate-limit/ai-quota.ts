import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";

import { env } from "@/lib/env";
import { getSql } from "@/server/db/client";

/** Số lượt hỏi AI miễn phí mỗi client trong 24h (issue #12). */
export const AI_DAILY_QUOTA = 3;

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

const inMemoryQuota = new Map<string, { used: number; reset_at: string }>();

/**
 * Kiểm tra và tăng lượt hỏi (Atomic) trực tiếp từ stored procedure trên Supabase.
 * Tự động fallback sang in-memory rate-limit nếu database chưa cấu hình hàm.
 */
export async function checkAndConsumeAiQuota(
  identifier: string,
  maxLimit: number = AI_DAILY_QUOTA,
): Promise<QuotaResult> {
  try {
    const sql = getSql();
    const rows = await sql<{ quota: QuotaResult }[]>`
      SELECT check_and_consume_ai_quota(${identifier}, ${maxLimit}) as quota
    `;
    if (rows?.[0]?.quota) return rows[0].quota;
  } catch (err) {
    console.warn("DB rate-limit unavailable, using in-memory fallback:", err);
  }

  const now = new Date();
  const reset = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const current = inMemoryQuota.get(identifier) || { used: 0, reset_at: reset };
  if (current.used < maxLimit) {
    current.used += 1;
    inMemoryQuota.set(identifier, current);
    return {
      allowed: true,
      remaining: maxLimit - current.used,
      used: current.used,
      max: maxLimit,
      reset_at: current.reset_at,
    };
  }
  return {
    allowed: false,
    remaining: 0,
    used: current.used,
    max: maxLimit,
    reset_at: current.reset_at,
  };
}

/**
 * Hoàn lại 1 lượt khi AI lỗi trước khi trả lời được. Không bao giờ throw — hoàn lượt là best-effort.
 */
export async function refundAiQuota(identifier: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`SELECT refund_ai_quota(${identifier})`;
    return;
  } catch (err) {
    console.warn("DB refund unavailable, using in-memory fallback:", err);
  }
  const current = inMemoryQuota.get(identifier);
  if (current && current.used > 0) current.used -= 1;
}

/**
 * Lấy trạng thái quota hiện tại của client mà không làm tăng lượt hỏi.
 */
export async function getAiQuotaStatus(identifier: string, maxLimit: number = AI_DAILY_QUOTA): Promise<QuotaResult> {
  try {
    const sql = getSql();
    const rows = await sql<{ quota: QuotaResult }[]>`
      SELECT get_ai_quota_status(${identifier}, ${maxLimit}) as quota
    `;
    if (rows?.[0]?.quota) return rows[0].quota;
  } catch (err) {
    console.warn("DB rate-limit unavailable, using in-memory fallback:", err);
  }

  const now = new Date();
  const reset = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const current = inMemoryQuota.get(identifier) || { used: 0, reset_at: reset };
  return {
    allowed: current.used < maxLimit,
    remaining: Math.max(0, maxLimit - current.used),
    used: current.used,
    max: maxLimit,
    reset_at: current.reset_at,
  };
}
