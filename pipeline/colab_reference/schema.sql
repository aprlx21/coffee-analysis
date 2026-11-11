
-- ============================================================
-- PostgreSQL schema for Menu OCR pipeline
-- ============================================================

-- 1. SHOP
-- place_id là khóa chính.
-- Nếu insert place_id đã tồn tại, PostgreSQL sẽ raise duplicate error.
CREATE TABLE IF NOT EXISTS shop (
    place_id       TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    main_category  TEXT,
    address        TEXT,

    lat            REAL,
    lng            REAL,

    rating         REAL,
    reviews        INTEGER,

    price_range    TEXT,
    website        TEXT,
    phone          TEXT,
    maps_link      TEXT,

    raw_json       TEXT
);


-- 2. MENU IMAGE
CREATE TABLE IF NOT EXISTS menu_image (
    image_id       BIGSERIAL PRIMARY KEY,

    place_id       TEXT NOT NULL
                   REFERENCES shop(place_id)
                   ON DELETE CASCADE,

    url            TEXT NOT NULL,
    url_sha1       TEXT NOT NULL,

    label          TEXT,
    photo_date     TEXT,

    status         TEXT NOT NULL DEFAULT 'pending',

    is_menu        INTEGER,

    n_boxes        INTEGER,
    n_items        INTEGER,

    seconds        REAL,

    pipeline_ver   TEXT,
    processed_at   TEXT,

    UNIQUE(place_id, url_sha1)
);

CREATE INDEX IF NOT EXISTS ix_img_status
ON menu_image(status);


-- 3. CANONICAL ITEMS
CREATE TABLE IF NOT EXISTS canonical_item (
    canonical_id   TEXT PRIMARY KEY,
    display_name   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS canonical_alias (
    alias_norm     TEXT PRIMARY KEY,

    canonical_id   TEXT NOT NULL
                   REFERENCES canonical_item(canonical_id)
);


-- 4. MENU ITEM
CREATE TABLE IF NOT EXISTS menu_item (
    item_id        BIGSERIAL PRIMARY KEY,

    image_id       BIGINT NOT NULL
                   REFERENCES menu_image(image_id)
                   ON DELETE CASCADE,

    place_id       TEXT NOT NULL
                   REFERENCES shop(place_id)
                   ON DELETE CASCADE,

    name_raw       TEXT NOT NULL,
    name_norm      TEXT NOT NULL,

    canonical_id   TEXT
                   REFERENCES canonical_item(canonical_id),

    match_score    REAL,
    match_how      TEXT,

    ocr_conf       REAL,

    bbox           TEXT,
    line_text      TEXT,

    needs_review   INTEGER NOT NULL DEFAULT 0,

    review_reasons TEXT,

    reviewed_by_human INTEGER NOT NULL DEFAULT 0,

    reviewed_canonical_id TEXT
        REFERENCES canonical_item(canonical_id)
);

CREATE INDEX IF NOT EXISTS ix_item_place
ON menu_item(place_id);

CREATE INDEX IF NOT EXISTS ix_item_canon
ON menu_item(canonical_id);


-- 5. ITEM PRICE
CREATE TABLE IF NOT EXISTS item_price (
    price_id       BIGSERIAL PRIMARY KEY,

    item_id        BIGINT NOT NULL
                   REFERENCES menu_item(item_id)
                   ON DELETE CASCADE,

    variant        TEXT,

    amount         REAL NOT NULL,

    currency       TEXT NOT NULL DEFAULT 'VND',

    raw_text       TEXT,

    inferred_k     INTEGER NOT NULL DEFAULT 0,
    plus_plus      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_price_item
ON item_price(item_id);


-- 6. VIEW GIÁ ĐIỂN HÌNH
CREATE OR REPLACE VIEW v_typical_price AS

SELECT
    s.place_id,
    s.name AS shop_name,

    COALESCE(
        i.reviewed_canonical_id,
        i.canonical_id
    ) AS canonical_id,

    c.display_name,

    MIN(p.amount) AS price_min,
    MAX(p.amount) AS price_max,

    MAX(img.photo_date) AS photo_date,

    MAX(i.needs_review) AS needs_review

FROM menu_item i

JOIN item_price p
    ON p.item_id = i.item_id
   AND p.currency = 'VND'

JOIN menu_image img
    ON img.image_id = i.image_id

JOIN shop s
    ON s.place_id = i.place_id

JOIN canonical_item c
    ON c.canonical_id =
       COALESCE(
           i.reviewed_canonical_id,
           i.canonical_id
       )

WHERE
    i.needs_review = 0
    OR i.reviewed_by_human = 1

GROUP BY
    s.place_id,
    s.name,
    COALESCE(
        i.reviewed_canonical_id,
        i.canonical_id
    ),
    c.display_name;