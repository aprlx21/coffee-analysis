import "server-only";

import { connection } from "next/server";
import { NextResponse } from "next/server";
import { getClientIdentifier, getAiQuotaStatus } from "@/server/rate-limit/ai-quota";

export async function GET() {
  await connection();
  try {
    const identifier = await getClientIdentifier();
    const quota = await getAiQuotaStatus(identifier, 3);

    return NextResponse.json(quota);
  } catch (err) {
    console.error("Lỗi khi kiểm tra quota AI:", err);
    return NextResponse.json({ error: "Không thể lấy thông tin lượt hỏi" }, { status: 500 });
  }
}
