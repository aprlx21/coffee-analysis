-- =====================================================================
-- 001_v_cafe_directory.sql  (issue #1)
-- Gold view phẳng cho web: 1 dòng / quán (115 dòng). Idempotent.
-- Chỉ ĐỌC: shop, v_typical_price_v2, menu_item. Không sửa bảng nào.
--
-- DANH SÁCH CỘT (thứ tự cố định):
--   place_id text, name text, main_category text, categories text[],
--   address text, short_address text, lat float8, lng float8,
--   rating real, reviews int, price_range text, phone text, website text,
--   maps_link text, description text, featured_image text,
--   hours jsonb          -- [{day,times[]}] | null
--   closed_on text, reviews_per_rating jsonb   -- {"1":n,...,"5":n}
--   review_keywords jsonb  -- [{keyword,count}]
--   featured_reviews jsonb -- tối đa 5: [{name,rating,review_text,published_at}]
--   -- cờ boolean từ about (false nếu không có):
--   has_wifi, laptop_friendly, outdoor_seating, quiet, cozy, pet_friendly,
--   has_parking, accepts_card, accepts_nfc, cash_only, accepts_reservations,
--   vegan_options, vegetarian_options, rooftop, live_music, good_for_kids
--   -- suy luận từ review:
--   has_ac bool, ac_source text, has_outlets bool, outlets_source text
--      (source = 'review_keywords' | 'review_text' | null)
--   work_score int       -- 0..100
--   menu_item_count int, drink_price_min numeric, drink_price_median numeric,
--   drink_price_max numeric, has_menu bool   -- giá VND đầy đủ (vd 35000)
--
-- work_score = wifi 25 + laptop_friendly 30 + quiet 15 + outlets 15 + ac 15
--
-- Ghi chú: các trường lồng trong raw_json bị double-encode (là chuỗi JSON)
-- nên được giải mã bằng: CASE WHEN jsonb_typeof(x)='string'
--                        THEN (x#>>'{}')::jsonb ELSE x END
-- =====================================================================
CREATE OR REPLACE VIEW v_cafe_directory AS
WITH parsed AS (
  SELECT s.*, s.raw_json::jsonb AS r FROM shop s
), dec AS (
  SELECT p.*,
    CASE WHEN jsonb_typeof(r->'about')='string' THEN (r->>'about')::jsonb ELSE r->'about' END AS about,
    CASE WHEN jsonb_typeof(r->'hours')='string' THEN (r->>'hours')::jsonb ELSE r->'hours' END AS hours_j,
    CASE WHEN jsonb_typeof(r->'categories')='string' THEN (r->>'categories')::jsonb ELSE r->'categories' END AS cats,
    CASE WHEN jsonb_typeof(r->'reviews_per_rating')='string' THEN (r->>'reviews_per_rating')::jsonb ELSE r->'reviews_per_rating' END AS rpr,
    CASE WHEN jsonb_typeof(r->'review_keywords')='string' THEN (r->>'review_keywords')::jsonb ELSE r->'review_keywords' END AS kw,
    CASE WHEN jsonb_typeof(r->'featured_reviews')='string' THEN (r->>'featured_reviews')::jsonb ELSE r->'featured_reviews' END AS fr
  FROM parsed p
), f AS (
  SELECT d.*,
    COALESCE((SELECT array_agg(lower(o->>'name'))
              FROM jsonb_array_elements(CASE WHEN jsonb_typeof(d.about)='array' THEN d.about ELSE '[]'::jsonb END) g,
                   jsonb_array_elements(CASE WHEN jsonb_typeof(g->'options')='array' THEN g->'options' ELSE '[]'::jsonb END) o
              WHERE o->>'enabled'='true'), ARRAY[]::text[]) AS opts,
    EXISTS (SELECT 1
              FROM jsonb_array_elements(CASE WHEN jsonb_typeof(d.about)='array' THEN d.about ELSE '[]'::jsonb END) g,
                   jsonb_array_elements(CASE WHEN jsonb_typeof(g->'options')='array' THEN g->'options' ELSE '[]'::jsonb END) o
              WHERE g->>'id'='parking' AND o->>'enabled'='true') AS parking_any,
    EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(d.kw)='array' THEN d.kw ELSE '[]'::jsonb END) k
              WHERE k->>'keyword' ILIKE '%air-condition%' OR k->>'keyword' ILIKE '%air condition%') AS ac_kw,
    EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(d.kw)='array' THEN d.kw ELSE '[]'::jsonb END) k
              WHERE k->>'keyword' ~* '(outlet|socket|plug|charging)') AS out_kw,
    EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(d.fr)='array' THEN d.fr ELSE '[]'::jsonb END) v
              WHERE v->>'review_text' ~* 'air.?con|máy lạnh|điều hòa') AS ac_txt,
    EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(d.fr)='array' THEN d.fr ELSE '[]'::jsonb END) v
              WHERE v->>'review_text' ~* 'outlet|socket|plug|ổ cắm|ổ điện') AS out_txt
  FROM dec d
), price AS (
  SELECT place_id,
         min(price_min) AS pmin,
         percentile_cont(0.5) WITHIN GROUP (ORDER BY (price_min + price_max) / 2.0) AS pmed,
         max(price_max) AS pmax
  FROM v_typical_price_v2 GROUP BY place_id
), mi AS (
  SELECT place_id, count(*) AS n FROM menu_item GROUP BY place_id
), flags AS (
  SELECT f.*,
    ('wi-fi' = ANY(opts) OR 'free wi-fi' = ANY(opts)) AS c_wifi,
    ('good for working on laptop' = ANY(opts)) AS c_laptop,
    ('quiet' = ANY(opts)) AS c_quiet,
    (ac_kw OR ac_txt) AS c_ac,
    (out_kw OR out_txt) AS c_out
  FROM f
)
SELECT
  fl.place_id, fl.name, fl.main_category,
  CASE WHEN jsonb_typeof(fl.cats)='array' THEN ARRAY(SELECT jsonb_array_elements_text(fl.cats)) END AS categories,
  fl.address,
  regexp_replace(fl.address, '\s*,\s*Ng\S+\s+H\S+\s+S\S+.*$', '') AS short_address,
  fl.lat, fl.lng, fl.rating, fl.reviews, fl.price_range, fl.phone, fl.website, fl.maps_link,
  fl.r->>'description' AS description,
  fl.r->>'featured_image' AS featured_image,
  CASE WHEN jsonb_typeof(fl.hours_j)='array' THEN fl.hours_j END AS hours,
  fl.r->>'closed_on' AS closed_on,
  CASE WHEN jsonb_typeof(fl.rpr)='object' THEN fl.rpr END AS reviews_per_rating,
  CASE WHEN jsonb_typeof(fl.kw)='array' THEN fl.kw END AS review_keywords,
  CASE WHEN jsonb_typeof(fl.fr)='array' THEN
    (SELECT COALESCE(jsonb_agg(jsonb_build_object('name', v->'name', 'rating', v->'rating',
            'review_text', v->'review_text', 'published_at', v->'published_at') ORDER BY ord), '[]'::jsonb)
     FROM jsonb_array_elements(fl.fr) WITH ORDINALITY t(v, ord) WHERE ord <= 5)
  END AS featured_reviews,
  fl.c_wifi AS has_wifi,
  fl.c_laptop AS laptop_friendly,
  ('outdoor seating' = ANY(fl.opts)) AS outdoor_seating,
  fl.c_quiet AS quiet,
  ('cozy' = ANY(fl.opts)) AS cozy,
  EXISTS (SELECT 1 FROM unnest(fl.opts) n WHERE n LIKE 'dogs allowed%') AS pet_friendly,
  fl.parking_any AS has_parking,
  ('credit cards' = ANY(fl.opts) OR 'debit cards' = ANY(fl.opts)) AS accepts_card,
  ('nfc mobile payments' = ANY(fl.opts)) AS accepts_nfc,
  ('cash-only' = ANY(fl.opts)) AS cash_only,
  ('accepts reservations' = ANY(fl.opts)) AS accepts_reservations,
  ('vegan options' = ANY(fl.opts)) AS vegan_options,
  ('vegetarian options' = ANY(fl.opts)) AS vegetarian_options,
  ('rooftop seating' = ANY(fl.opts)) AS rooftop,
  ('live music' = ANY(fl.opts)) AS live_music,
  ('good for kids' = ANY(fl.opts)) AS good_for_kids,
  fl.c_ac AS has_ac,
  CASE WHEN fl.ac_kw THEN 'review_keywords' WHEN fl.ac_txt THEN 'review_text' END AS ac_source,
  fl.c_out AS has_outlets,
  CASE WHEN fl.out_kw THEN 'review_keywords' WHEN fl.out_txt THEN 'review_text' END AS outlets_source,
  ( (fl.c_wifi::int * 25) + (fl.c_laptop::int * 30) + (fl.c_quiet::int * 15)
    + (fl.c_out::int * 15) + (fl.c_ac::int * 15) ) AS work_score,
  COALESCE(mi.n, 0)::int AS menu_item_count,
  pr.pmin AS drink_price_min,
  round(pr.pmed::numeric) AS drink_price_median,
  pr.pmax AS drink_price_max,
  (COALESCE(mi.n, 0) > 0) AS has_menu
FROM flags fl
LEFT JOIN price pr ON pr.place_id = fl.place_id
LEFT JOIN mi ON mi.place_id = fl.place_id;
