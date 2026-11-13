import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { suggestDrinkPricesService } from "@/server/pricing";

export const suggestDrinkPriceTool = tool({
  description:
    "Gợi ý mức giá bán đồ uống (Bạc xỉu, Cà phê muối, Cappuccino) cho một mặt bằng dự kiến mở quán cafe tại khu phố Tây An Thượng bằng mô hình hồi quy OLS từ dữ liệu thực tế. Nhận vào địa chỉ hoặc tên quán, có thể kèm giả định về tiện ích thẻ và không gian laptop.",
  inputSchema: z.object({
    address: z
      .string()
      .optional()
      .describe("Địa chỉ mặt bằng dự kiến mở quán (ví dụ: '25 An Thượng 4', 'Trần Bạch Đằng', 'Hoàng Kế Viêm')."),
    placeName: z
      .string()
      .optional()
      .describe("Tên quán hoặc địa danh lân cận để lấy tọa độ (ví dụ: 'CAPHE COMMUNE', '43 Factory')."),
    lat: z.number().optional().describe("Vĩ độ chính xác của mặt bằng (nếu đã có)."),
    lng: z.number().optional().describe("Kinh độ chính xác của mặt bằng (nếu đã có)."),
    hasCardPayment: z
      .boolean()
      .default(false)
      .describe("Giả định quán có thanh toán thẻ / NFC / Apple Pay hay không (mặc định false)."),
    hasWork: z
      .boolean()
      .default(false)
      .describe(
        "Giả định quán có định vị làm việc laptop (yên tĩnh, bàn cao, nhiều ổ cắm) hay không (mặc định false).",
      ),
    drinks: z
      .array(z.enum(["bac_xiu", "ca_phe_muoi", "cappuccino"]))
      .default(["bac_xiu", "ca_phe_muoi", "cappuccino"])
      .describe("Danh sách thức uống muốn nhận mức giá gợi ý (mặc định cả 3 món)."),
  }),
  execute: async (input) => {
    return await suggestDrinkPricesService(input);
  },
});
