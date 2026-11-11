n_nhom = (
    pivot2
    .notna()
    .sum(
        axis=1
    )
)


few = (
    n_nhom[
        n_nhom < 5
    ]
    .index
)


info = pd.read_sql(
    """
    SELECT

        s.name
            AS quan,

        SUM(
            CASE

                WHEN
                    i.status = 'ok'
                    AND i.is_menu = 1

                THEN 1

                ELSE 0

            END
        )
            AS trang_menu,


        (
            SELECT
                COUNT(*)

            FROM menu_item m

            WHERE
                m.place_id =
                s.place_id
        )
            AS so_mon,


        (
            SELECT
                COUNT(*)

            FROM menu_item m

            WHERE
                m.place_id =
                s.place_id

                AND COALESCE(
                    m.review_reasons,
                    ''
                )
                LIKE '%ocr_low%'
        )
            AS mon_ocr_low


    FROM shop s


    LEFT JOIN menu_image i

        ON i.place_id =
           s.place_id


    GROUP BY

        s.place_id,

        s.name
    """,
    db_engine
)


chk = (
    info[
        info.quan.isin(
            few
        )
    ]
    .copy()
)


chk["so_nhom"] = (
    chk.quan
    .map(
        n_nhom
    )
)


display(

    chk.sort_values(
        "so_mon"
    )

)