import "server-only";

import { connection } from "next/server";
import { NextResponse } from "next/server";
import { AI_DAILY_QUOTA, AI_QUOTA_ENABLED, getAiQuotaStatus, getClientIdentifier } from "@/server/rate-limit/ai-quota";

export async function GET() {
  await connection();
  if (!AI_QUOTA_ENABLED) return NextResponse.json({ unlimited: true });
  try {
    const identifier = await getClientIdentifier();
    const quota = await getAiQuotaStatus(identifier, AI_DAILY_QUOTA);

    return NextResponse.json(quota);
  } catch (err) {
    console.error("Lỗi khi kiểm tra quota AI:", err);
    return NextResponse.json({ error: "Không thể lấy thông tin lượt hỏi" }, { status: 500 });
  }
}
