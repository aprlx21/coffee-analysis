import "server-only";

/**
 * Public API của lớp AI. Feature chỉ import từ "@/ai", không import file con.
 * Khi tích hợp SDK (xem .agents/skills/ai-integration), export thêm các hàm
 * như `generateReply()` ở đây.
 */
export { aiConfig, assertAIEnabled } from "./config";
export { systemPrompt } from "./prompts/system";
