# -*- coding: utf-8 -*-

import psycopg
import json
import hashlib
import datetime as dt

from menu_core import CANON, norm


PIPELINE_VER = "v0.2-postgres"


# ============================================================
# INTERNAL: chạy schema.sql
# ============================================================

def _run_schema(con, schema_path):
    sql = open(
        schema_path,
        encoding="utf-8"
    ).read()

    # schema hiện tại đơn giản nên có thể split theo ;
    with con.cursor() as cur:

        for stmt in sql.split(";"):

            stmt = stmt.strip()

            if stmt:
                cur.execute(stmt)


# ============================================================
# CONNECT POSTGRESQL
# ============================================================

def connect(db_url, schema="schema.sql"):

    con = psycopg.connect(
        db_url,
        sslmode="require"
    )

    try:

        # -----------------------------
        # Tạo tables / indexes / views
        # -----------------------------

        _run_schema(
            con,
            schema
        )


        # -----------------------------
        # Đồng bộ CANON
        # -----------------------------

        with con.cursor() as cur:

            for cid, (disp, syns) in CANON.items():

                cur.execute(
                    """
                    INSERT INTO canonical_item(
                        canonical_id,
                        display_name
                    )
                    VALUES (%s, %s)

                    ON CONFLICT (canonical_id)
                    DO UPDATE SET
                        display_name =
                            EXCLUDED.display_name
                    """,
                    (
                        cid,
                        disp
                    )
                )


                for s in syns:

                    cur.execute(
                        """
                        INSERT INTO canonical_alias(
                            alias_norm,
                            canonical_id
                        )
                        VALUES (%s, %s)

                        ON CONFLICT (alias_norm)
                        DO UPDATE SET
                            canonical_id =
                                EXCLUDED.canonical_id
                        """,
                        (
                            norm(s),
                            cid
                        )
                    )


        con.commit()

        return con


    except Exception:

        con.rollback()
        con.close()

        raise


# ============================================================
# SHA1 URL
# ============================================================

def sha1(url):

    return hashlib.sha1(
        url.encode()
    ).hexdigest()


# ============================================================
# INSERT SHOP
#
# QUAN TRỌNG:
# không dùng ON CONFLICT.
#
# Nếu place_id duplicate:
# PostgreSQL sẽ raise UniqueViolation.
# ============================================================

def insert_shop(con, row):

    con.execute(
        """
        INSERT INTO shop(
            place_id,
            name,
            main_category,
            address,
            lat,
            lng,
            rating,
            reviews,
            price_range,
            website,
            phone,
            maps_link,
            raw_json
        )

        VALUES (
            %(place_id)s,
            %(name)s,
            %(main_category)s,
            %(address)s,
            %(lat)s,
            %(lng)s,
            %(rating)s,
            %(reviews)s,
            %(price_range)s,
            %(website)s,
            %(phone)s,
            %(maps_link)s,
            %(raw_json)s
        )
        """,
        row
    )


# ============================================================
# REGISTER IMAGE
#
# Ảnh trùng KHÔNG raise error.
#
# Lý do:
# cùng một shop có thể được chạy OCR lại.
# UNIQUE(place_id, url_sha1) giúp tránh nhân đôi ảnh.
# ============================================================

def register_image(
    con,
    place_id,
    url,
    label=None,
    photo_date=None
):

    h = sha1(url)

    with con.cursor() as cur:

        cur.execute(
            """
            INSERT INTO menu_image(
                place_id,
                url,
                url_sha1,
                label,
                photo_date
            )

            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s
            )

            ON CONFLICT (
                place_id,
                url_sha1
            )
            DO NOTHING
            """,
            (
                place_id,
                url,
                h,
                label,
                photo_date
            )
        )


        cur.execute(
            """
            SELECT
                image_id,
                status

            FROM menu_image

            WHERE place_id = %s
              AND url_sha1 = %s
            """,
            (
                place_id,
                h
            )
        )


        return cur.fetchone()


# ============================================================
# SAVE OCR RESULT
# ============================================================

def save_image_result(
    con,
    image_id,
    place_id,
    status,
    boxes=0,
    items=(),
    seconds=None,
    is_menu=None
):

    try:

        with con.cursor() as cur:

            # chạy lại ảnh:
            # xoá item cũ
            # item_price tự CASCADE
            cur.execute(
                """
                DELETE FROM menu_item
                WHERE image_id = %s
                """,
                (
                    image_id,
                )
            )


            # ---------------------------
            # Update menu_image
            # ---------------------------

            cur.execute(
                """
                UPDATE menu_image

                SET
                    status=%s,
                    is_menu=%s,
                    n_boxes=%s,
                    n_items=%s,
                    seconds=%s,
                    pipeline_ver=%s,
                    processed_at=%s

                WHERE image_id=%s
                """,
                (
                    status,
                    is_menu,
                    boxes,
                    len(items),
                    seconds,
                    PIPELINE_VER,

                    dt.datetime.now(
                        dt.timezone.utc
                    ).isoformat(
                        timespec="seconds"
                    ),

                    image_id
                )
            )


            # ---------------------------
            # Insert menu items
            # ---------------------------

            for it in items:

                cur.execute(
                    """
                    INSERT INTO menu_item(
                        image_id,
                        place_id,
                        name_raw,
                        name_norm,
                        canonical_id,
                        match_score,
                        match_how,
                        ocr_conf,
                        bbox,
                        line_text,
                        needs_review,
                        review_reasons
                    )

                    VALUES (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s
                    )

                    RETURNING item_id
                    """,
                    (
                        image_id,
                        place_id,

                        it["name_raw"],
                        it["name_norm"],

                        it["canonical_id"],
                        it["match_score"],
                        it["match_how"],

                        it["ocr_conf"],

                        json.dumps(
                            it["bbox"],
                            ensure_ascii=False
                        ),

                        it["line_text"],

                        int(
                            it["needs_review"]
                        ),

                        json.dumps(
                            it["review_reasons"],
                            ensure_ascii=False
                        )
                    )
                )


                item_id = cur.fetchone()[0]


                # -----------------------
                # Prices
                # -----------------------

                for k, v in enumerate(
                    it["prices"]
                ):

                    cur.execute(
                        """
                        INSERT INTO item_price(
                            item_id,
                            variant,
                            amount,
                            currency,
                            raw_text,
                            inferred_k,
                            plus_plus
                        )

                        VALUES (
                            %s,
                            %s,
                            %s,
                            %s,
                            %s,
                            %s,
                            %s
                        )
                        """,
                        (
                            item_id,

                            (
                                f"v{k+1}"
                                if len(it["prices"]) > 1
                                else None
                            ),

                            v,

                            (
                                "USD"
                                if it["currency"] == "usd"
                                else "VND"
                            ),

                            it["price_raw"],

                            int(
                                "inferred_k"
                                in it["flags"]
                            ),

                            int(
                                "plus_plus"
                                in it["flags"]
                            )
                        )
                    )


        con.commit()


    except Exception:

        con.rollback()

        raise