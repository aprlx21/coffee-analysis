# features/pricing

## Mục đích

- Gợi ý giá đồ uống cho chủ quán mới đang chọn vị trí mặt bằng trong khu An Thượng.
- Mô hình OLS 3 biến tiền nghiệm: khoảng cách ra biển (khoảng cách ngắn nhất tới polyline theo tim đường Võ Nguyên Giáp từ OpenStreetMap), có thanh toán thẻ/NFC, định vị quán làm việc (work-friendly).
- Trục biển (`BEACH_AXIS`): polyline gồm 13 đỉnh Nam → Bắc theo tim đường Võ Nguyên Giáp thực tế.
- Khoảng cách có dấu (`signedDistM`): dương khi ở phía đất liền (Tây trục biển), âm khi ở phía biển (Đông trục biển).
- Dự đoán cho 3 món đại diện: `bac_xiu`, `ca_phe_muoi`, `cappuccino`.
- Khoảng giá gợi ý = dự đoán ± LOO RMSE, cận dưới không thấp hơn sàn 15.000đ.

## Phụ thuộc

- Dùng: chỉ `lib/regression.ts` (TypeScript thuần, không import, chạy được cả server lẫn client).
- Dữ liệu huấn luyện: đọc từ Supabase (tầng Gold/Silver) qua `src/server/db/queries/pricing.ts`.

## Lưu ý

- Mô hình fit lại từ dữ liệu Supabase mỗi lần snapshot làm mới, không cache tham số giữa các lần build.
- Dưới 15 dòng huấn luyện hoặc ma trận suy biến thì `fitOls` trả `null` — UI phải xử lý trường hợp chưa đủ dữ liệu.
- Không bao giờ throw từ lớp tính toán; mọi hàm đều trả giá trị hoặc `null`.
- Biến `competitor_count` trong notebook Colab gốc đã bị loại: nó thực chất là độ dài chuỗi JSON (bug), không phải số đối thủ.
- Logic giá chỉ tính ở server; client chỉ hiển thị kết quả đã tính.
