-- =====================================================================
-- 002_fix_typical_price_outliers.sql (Issue #16)
-- Sửa lỗi giá bất thường (outliers) trong view v_typical_price_v2:
--
-- 1. Bối cảnh & Nguyên nhân:
--    - Một số món phụ/topping/upsize/extra shot (vd: 'Extra espresso shot +10',
--      'Change to espresso +10k', 'PHIN COFFEE 10', 'Coconut flake 10')
--      bị OCR gộp hoặc map nhầm vào món đồ uống chính.
--    - Fuzzy matching sai món có giá rẻ (vd: 'Nuác Suői 10k' bị map thành 'bac_xiu').
--    - Dẫn đến v_typical_price_v2 và câu trả lời AI báo giá cà phê bất thường
--      như Bạc xỉu 10.000đ, Espresso 10.000đ tại các quán cà phê An Thượng.
--
-- 2. Quy tắc lọc:
--    - Loại bỏ các dòng add-on / upsize / extra shot / topping:
--      (extra.*shot, change to, extra, upsize, up size, 1 shot, topping, flake).
--    - Ngưỡng sàn giá (Floor Price) cho nhóm Cà phê:
--      Các món cà phê truyền thống và pha máy (ca_phe_den, ca_phe_sua,
--      ca_phe_sua_tuoi, bac_xiu, ca_phe_muoi, ca_phe_dua, ca_phe_trung,
--      americano, espresso, latte, cappuccino, flat_white, mocha,
--      caramel_macchiato, cold_brew) không thể có giá < 15.000đ.
--    - Ngưỡng sàn giá đồ uống chung: tối thiểu 10.000đ.
--
-- 3. Idempotent: chạy lại nhiều lần an toàn, không ảnh hưởng schema.
-- =====================================================================

CREATE OR REPLACE VIEW v_typical_price_v2 AS
SELECT 
    s.place_id,
    s.name AS shop_name,
    COALESCE(i.reviewed_canonical_id, i.canonical_id) AS canonical_id,
    c.display_name,
    min(p.amount) AS price_min,
    max(p.amount) AS price_max,
    max((COALESCE(i.review_reasons, ''::text) ~~ '%match_low%'::text)::integer) AS match_uncertain
FROM menu_item i
JOIN item_price p ON p.item_id = i.item_id AND p.currency = 'VND'::text
JOIN shop s ON s.place_id = i.place_id
JOIN canonical_item c ON c.canonical_id = COALESCE(i.reviewed_canonical_id, i.canonical_id)
WHERE i.reviewed_by_human = 1 
   OR (
      COALESCE(i.review_reasons, ''::text) !~~ '%ocr_low%'::text 
      AND COALESCE(i.review_reasons, ''::text) !~~ '%price_outlier%'::text 
      AND COALESCE(i.review_reasons, ''::text) !~~ '%usd%'::text
      -- Loại bỏ add-on, extra shot, upsize, topping
      AND i.name_norm !~* '(extra.*shot|change to|\bextra\b|up size|upsize|\b1 shot\b|\btopping\b|\bflake\b)'
      -- Ngưỡng sàn giá: Cà phê (truyền thống & máy) >= 15.000đ
      AND NOT (
          COALESCE(i.reviewed_canonical_id, i.canonical_id) IN (
              'ca_phe_den', 'ca_phe_sua', 'ca_phe_sua_tuoi', 'bac_xiu', 'ca_phe_muoi',
              'ca_phe_dua', 'ca_phe_trung', 'americano', 'espresso', 'latte',
              'cappuccino', 'flat_white', 'mocha', 'caramel_macchiato', 'cold_brew'
          )
          AND p.amount < 15000
      )
      -- Ngưỡng sàn chung cho đồ uống nói chung: tối thiểu 10.000đ
      AND p.amount >= 10000
   )
GROUP BY s.place_id, s.name, COALESCE(i.reviewed_canonical_id, i.canonical_id), c.display_name;
