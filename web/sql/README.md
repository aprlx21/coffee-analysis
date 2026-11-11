# web/sql

SQL cho Gold layer. Chỉ `CREATE OR REPLACE VIEW`, không sửa bảng; chạy lại bao nhiêu lần cũng được.

## Áp dụng `001_v_cafe_directory.sql`

- Supabase SQL Editor: dán nội dung file rồi Run; hoặc
- `psql "$SUPABASE_DB_URL" -f web/sql/001_v_cafe_directory.sql`

Danh sách cột nằm ở comment đầu file.

## Kiểm tra

```sql
select count(*) from v_cafe_directory;                              -- 115
select count(*) filter (where has_wifi) from v_cafe_directory;      -- 43
select count(*) filter (where laptop_friendly) from v_cafe_directory; -- 41
select count(*) filter (where drink_price_min is not null) from v_cafe_directory; -- 76
```

Lưu ý: con số "Wi-Fi 84" trong issue là số *dòng option* (mỗi quán xuất hiện ~2 lần trong `about`), số quán thật có Wi-Fi là 43. Tương tự Credit cards 96 dòng = 58 quán.

`has_ac` / `has_outlets` là suy luận từ review (xem `ac_source`, `outlets_source`) — UI nên gắn nhãn "suy luận từ review".
