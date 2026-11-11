con.execute(
    """
    DROP VIEW IF EXISTS
    v_typical_price_v2
    """
)


con.execute(
    """
    CREATE VIEW
    v_typical_price_v2
    AS

    SELECT
        s.place_id,

        s.name
            AS shop_name,

        COALESCE(
            i.reviewed_canonical_id,
            i.canonical_id
        )
            AS canonical_id,

        c.display_name,

        MIN(
            p.amount
        )
            AS price_min,

        MAX(
            p.amount
        )
            AS price_max,

        MAX(
            (
                COALESCE(
                    i.review_reasons,
                    ''
                )
                LIKE '%match_low%'
            )::int
        )
            AS match_uncertain


    FROM menu_item i


    JOIN item_price p

        ON p.item_id =
           i.item_id

       AND p.currency =
           'VND'


    JOIN shop s

        ON s.place_id =
           i.place_id


    JOIN canonical_item c

        ON c.canonical_id =
           COALESCE(
               i.reviewed_canonical_id,
               i.canonical_id
           )


    WHERE

        i.reviewed_by_human = 1

        OR (

            COALESCE(
                i.review_reasons,
                ''
            )
            NOT LIKE '%ocr_low%'

            AND

            COALESCE(
                i.review_reasons,
                ''
            )
            NOT LIKE '%price_outlier%'

            AND

            COALESCE(
                i.review_reasons,
                ''
            )
            NOT LIKE '%usd%'

        )


    GROUP BY

        s.place_id,

        s.name,

        COALESCE(
            i.reviewed_canonical_id,
            i.canonical_id
        ),

        c.display_name
    """
)


con.commit()


# ============================================================
# COUNTS
# ============================================================

def n(q):

    return con.execute(
        q
    ).fetchone()[0]


print(
    "Quán có món         :",
    n(
        """
        SELECT COUNT(
            DISTINCT place_id
        )
        FROM menu_item
        """
    )
)


print(
    "Bảng so sánh (chặt) :",
    n(
        """
        SELECT COUNT(
            DISTINCT place_id
        )
        FROM v_typical_price_v2
        WHERE match_uncertain = 0
        """
    )
)


print(
    "Bảng so sánh (lỏng) :",
    n(
        """
        SELECT COUNT(
            DISTINCT place_id
        )
        FROM v_typical_price_v2
        """
    )
)


# ============================================================
# PIVOT
# ============================================================

typ = pd.read_sql(
    """
    SELECT *
    FROM v_typical_price_v2
    """,
    db_engine
)


pivot = typ.pivot_table(
    index="shop_name",
    columns="display_name",
    values="price_min",
    aggfunc="min"
)


display(
    pivot
)


pivot.to_csv(
    "typical_prices.csv",
    encoding="utf-8-sig"
)


# ============================================================
# MATCH LOW REPORT
# ============================================================

pd.set_option(
    "display.max_rows",
    200,

    "display.max_colwidth",
    60
)


display(
    pd.read_sql(
        """
        SELECT

            name_norm,

            canonical_id,

            match_how,

            ROUND(
                AVG(match_score)
            ) AS diem,

            COUNT(*) AS n,

            COUNT(
                DISTINCT place_id
            ) AS so_quan

        FROM menu_item

        WHERE
            canonical_id IS NOT NULL

            AND COALESCE(
                review_reasons,
                ''
            )
            LIKE '%match_low%'

        GROUP BY
            name_norm,
            canonical_id,
            match_how

        ORDER BY
            n DESC

        LIMIT 80
        """,
        db_engine
    )
)