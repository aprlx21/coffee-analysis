# BÁO CÁO THỊ TRƯỜNG & CHIẾN LƯỢC KINH DOANH F&B KHU PHỐ TÂY AN THƯỢNG (ĐÀ NẴNG)
*Data Understanding and Data Visualization Report: Exploratory Analysis of the Beverage and F&B Market in An Thượng, Đà Nẵng*
*Nguồn dữ liệu: Khảo sát thực địa & Google Maps Ingestion (115 cơ sở F&B), OCR bóc tách 6.107 dòng giá menu, 764 quan sát giá chuẩn hóa (v_typical_price_v2), 9.406 bản ghi Google Maps Popular Times (73 quán) và hơn 15.000 đánh giá khách hàng.*

---

## 1. Tổng Quan Thị Trường & Bối Cảnh Dự Án (Project Background)

### 1.1. Bối cảnh & Mục tiêu nghiên cứu
- **Khu phố Tây An Thượng (Mỹ An, Ngũ Hành Sơn, Đà Nẵng)**: Là điểm nóng du lịch biển tập trung dày đặc quán cà phê, nhà hàng, quán bar và cộng đồng khách quốc tế kết hợp Digital Nomads làm việc từ xa.
- **Vấn đề dữ liệu**: Dữ liệu giá cả và năng lực phục vụ của các quán thường ở dạng phi cấu trúc (ảnh chụp thực đơn tải lên Google Maps, đánh giá phân tán). Dự án này số hóa toàn diện thông qua pipeline OCR (Optical Character Recognition) kết hợp cơ sở dữ liệu phân tầng PostgreSQL (Supabase) để phục vụ bài toán:
  1. Thấu hiểu cấu trúc thị trường và mặt bằng giá cạnh tranh.
  2. Xây dựng mô hình định giá đề xuất cho cơ sở F&B mới thâm nhập thị trường.
  3. Phục vụ hệ thống hỏi đáp AI RAG tự động trả lời người dùng và nhà đầu tư.

### 1.2. Quy mô tập dữ liệu (Dataset Scope & Records)
- **Tổng số cơ sở F&B khảo sát (`shop`)**: 115 quán trong bán kính ~1.5 km².
- **Dòng thực đơn bóc tách thô (`menu_item`)**: 5.807 món.
- **Dữ liệu giá chi tiết (`item_price`)**: 6.107 mức giá ghi nhận.
- **Tập quan sát giá chuẩn hóa (`v_typical_price_v2`)**: 764 quan sát đại diện đã qua kiểm duyệt lọc nhiễu OCR.
- **Dữ liệu thời gian hoạt động & độ đông đúc (`Popular Times`)**: 9.406 bản ghi giờ hoạt động theo ngày/tuần trích xuất từ 73 quán.

---

## 2. Phân Tích Phân Tầng Giá Đồ Uống (Beverage Price Distribution Analysis)

Nghiên cứu phân tích 15 loại đồ uống phổ biến nhất và chuẩn hóa giá bán bằng Z-score ($Z_i = \frac{P_i - \bar{P}}{s_P}$) để so sánh 4 nhóm sản phẩm chính:

### 2.1. Cà phê Truyền thống Việt Nam (Traditional Vietnamese Coffee)
- **Đại diện**: Cà phê đen, Cà phê sữa, Bạc xỉu.
- **Đặc tính**: Chiếm vị trí thấp nhất trên thang Z-score. Biên độ giá hẹp và đồng nhất cao:
  - Cà phê đen: **18.000đ – 25.000đ** (trung vị ~20.000đ).
  - Cà phê sữa: **22.000đ – 30.000đ** (ngưỡng tâm lý phổ biến: 25.000đ – 30.000đ).
  - Bạc xỉu: **25.000đ – 35.000đ**.
- **Vai trò kinh doanh**: **Món kéo khách (Traffic Driver)** — biên lợi nhuận mỏng nhưng là thước đo so sánh giá trực quan nhất đối với khách nội địa và người lao động địa phương.

### 2.2. Đồ uống Phong cách Phương Tây (Western-Style Coffee)
- **Đại diện**: Espresso, Americano, Latte, Cappuccino, Flat White, Cold Brew.
- **Đặc tính**: Xuất hiện ở phân vùng giá cao hơn rõ rệt:
  - Americano / Espresso: **35.000đ – 50.000đ**.
  - Latte / Cappuccino: **45.000đ – 70.000đ**.
  - Cold Brew: **40.000đ – 65.000đ**.
- **Vai trò kinh doanh**: Biên độ giá biến thiên lớn tùy thuộc vào vị trí quán (gần biển hay nội khu) và chất lượng hạt Specialty Coffee.

### 2.3. Đồ uống Xu hướng & Hiện đại (Trend-Oriented Beverages)
- **Đại diện**: Matcha Latte, Cà phê Muối, Cà phê Dừa, Sinh tố bơ, Kombucha.
- **Đặc tính**: Nằm ở phân vùng giá cao nhưng có độ phân tán lớn (High Variance):
  - Cà phê Muối & Cà phê Dừa: **35.000đ – 55.000đ**.
  - Matcha Latte: **45.000đ – 75.000đ**.
- **Vai trò kinh doanh**: **Món sinh lời cao (Margin Builder)** — tỷ suất lợi nhuận gộp thường vượt trên 65-75%, khách hàng sẵn sàng chi trả mức giá cao hơn cho trải nghiệm và khẩu vị mới lạ.

### 2.4. Trà & Đồ uống Trái cây (Tea & Fruit-based Drinks)
- **Đại diện**: Trà đào, Trà vải, Trà sen vàng, Nước ép cam/chanh dây.
- **Đặc tính**: Phổ giá trải rộng từ **30.000đ đến 60.000đ**, phản ánh sự khác biệt sâu sắc giữa quán bình dân dùng siro công nghiệp và quán cao cấp dùng trà ủ lạnh + trái cây tươi.

---

## 3. Cơ Cấu Menu Theo Mức Độ Nổi Tiếng Của Quán (Menu Composition & Review Counts)

Phân tích cơ cấu danh mục đồ uống giữa các nhóm quán phân tầng theo số lượng Google Reviews (High-Review: top 33%, Middle-Review, Low-Review):

| Phân loại thực đơn | Nhóm Review Cao (> 500 reviews) | Nhóm Review Trung bình | Nhóm Review Thấp (< 100 reviews) |
|---|---|---|---|
| **Western-style (Espresso, Latte...)** | **11%** | 12% | 9% |
| **Traditional Coffee (Cà phê đen/sữa...)** | **15%** | 18% | **29%** |
| **Món khác (Trà, sinh tố, đồ ăn nhẹ...)** | **74%** | 70% | 61% |

### Nhận định then chốt:
1. **Các quán mới/ít review phụ thuộc lớn vào Cà phê Truyền thống (29%)**: Các quán nhỏ có xu hướng sử dụng menu cơ bản, cạnh tranh về giá để tồn tại ban đầu.
2. **Các quán nổi tiếng mở rộng tối đa "Món khác" (74%)**: Quán có thương hiệu mạnh chuyển dịch sang mô hình all-day dining / brunch cafe, kết hợp đồ uống healthy, nước ép thanh lọc, bánh ngọt và đồ ăn nhẹ để tối ưu hóa giá trị vòng đời khách hàng (AOV - Average Order Value).

---

## 4. Phân Bổ Không Gian Địa Lý & Định Vị Giá (Geographical Distribution & Pricing)

### 4.1. Phân khúc giá theo trục không gian
- **Nhóm Tiết kiệm (Budget - dưới 35.000đ)**: Tập trung sâu trong các hẻm nhỏ hoặc các trục đường phía Tây cách xa bãi biển (Lê Quang Đạo, Ngũ Hành Sơn).
- **Nhóm Tầm trung (Mid-range - 35.000đ – 50.000đ)**: Chiếm đa số tại các trục đường ngang khu An Thượng (An Thượng 1, 2, 3, 4, Ngô Thì Sĩ).
- **Nhóm Cao cấp (Higher-priced - trên 50.000đ)**: Tập trung đậm đặc dọc trục ven biển (Trần Bạch Đằng, Hoàng Kế Viêm) và các cơ sở Specialty Roaster mặt tiền lớn.

### 4.2. Mối quan hệ với khoảng cách ra biển (Proximity to Beach)
- Các quán càng gần bãi biển Mỹ Khê/An Thượng có xu hướng định giá cao hơn **25% - 40%** cho cùng một dung tích đồ uống, bù đắp cho chi phí thuê mặt bằng đắt đỏ và tận dụng đối tượng khách du lịch quốc tế đi bộ.

---

## 5. Nhịp Độ Hoạt Động Theo Giờ & Ngày (Temporal Activity Analysis - Popular Times)

Phân tích từ 9.406 điểm dữ liệu Google Maps Popular Times trên 73 quán:

```
[00:00 - 06:00]  Đáy hoạt động (Chỉ một số ít quán pub/bar/lounge đêm mở cửa)
[07:00 - 08:30]  Tăng trưởng nhanh (Khách ăn sáng, uống cà phê truyền thống đầu ngày)
[10:00 - 18:00]  ĐỈNH HOẠT ĐỘNG KÉO DÀI (Mức đông đúc duy trì 52% - 54% liên tục)
[18:30 - 21:30]  Đỉnh thứ hai (Khách dạo phố đêm, gặp gỡ sau bữa tối)
[22:00 - 24:00]  Hạ nhiệt dần (Phần lớn quán thuần cafe đóng cửa lúc 22:00 - 22:30)
```

### Điểm đặc thù của Khu phố Tây An Thượng:
- Khác với các khu dân cư nội đô Đà Nẵng (thường chỉ đông vào 7h-9h sáng và 19h-21h tối), An Thượng duy trì **mức độ hoạt động cao liên tục từ 10:00 sáng đến 18:00 chiều**.
- Điều này phản ánh rõ nét thói quen sinh hoạt của **khách du lịch nghỉ dưỡng** và **cộng đồng Digital Nomads** làm việc trực tiếp tại quán cafe suốt cả ngày.

---

## 6. Khoảng Trống Hạ Tầng & Cơ Hội Đầu Tư F&B (Market Gaps & Opportunities)

### 6.1. Nghịch lý Không gian Làm việc (The Workspace Paradox)
- **35.7% quán (41/115 cơ sở)** tự nhận hoặc được gắn nhãn phù hợp làm việc (`laptop_friendly`).
- Tuy nhiên, chỉ có **8.7% cơ sở (10/115 quán)** thực sự có trang bị ổ cắm điện dồi dào (`has_outlets = true`).
- *Cơ hội*: Nhu cầu tìm quán ngồi làm việc bền bỉ 4-8 tiếng của khách nước ngoài tại An Thượng là cực kỳ lớn. Quán nào giải quyết được bài toán: **Bàn cao đạt chuẩn + Ổ cắm tại từng chân bàn + Điều hòa mát sâu + Ghế có tựa lưng** sẽ dễ dàng chiếm lĩnh tệp khách trung thành này.

### 6.2. Phương thức thanh toán không tiền mặt
- **83.5% cơ sở** chấp nhận thẻ tín dụng (`accepts_card`).
- **49.6% cơ sở** hỗ trợ thanh toán chạm NFC / Apple Pay / Google Wallet (`accepts_nfc`).
- *Cảnh báo*: Các cơ sở chỉ nhận tiền mặt (`cash_only`) đối mặt với tỷ lệ thất thoát khách quốc tế lên tới 15-20%.

### 6.3. Thị trường đồ uống thuần chay (Vegan Options)
- Mới chỉ có **18.2% quán** cung cấp lựa chọn thuần chay (`vegan_options`) hoặc các loại sữa hạt thay thế (oat milk, almond milk, soy milk). Đây là khoảng trống giá trị gia tăng rất lớn khi khách Tây sẵn sàng trả thêm 10.000đ - 15.000đ cho mỗi phần sữa hạt.

---

## 7. Giới Hạn Của Dữ Liệu Cần Lưu Ý (Methodological Limitations)
1. **Sai số OCR & Chuẩn hóa thực đơn**: Một số tên món đặc thù hoặc ảnh menu mờ có thể bị phân loại vào nhóm "Khác" (Other items).
2. **Quy chuẩn dung tích (Serving Size)**: Giá niêm yết chưa phản ánh được dung tích thực tế (ly 250ml vs 400ml).
3. **Chỉ số tương quan (Not Causal)**: Số lượng reviews và Popular Times phản ánh mức độ quan tâm trực tuyến, không đo lường trực tiếp 100% doanh thu kế toán hay dòng tiền của quán.
