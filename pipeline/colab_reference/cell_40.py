# Xem các món cần review

review_df = pd.read_sql(
    """
    SELECT
        item_id,
        name_raw,
        canonical_id,
        match_score,
        review_reasons,
        line_text

    FROM menu_item

    WHERE needs_review = 1

    ORDER BY item_id
    """,
    db_engine
)

display(
    review_df
)


# Ví dụ xác nhận / sửa 1 món

con.execute(
    """
    UPDATE menu_item

    SET
        reviewed_by_human = 1,
        reviewed_canonical_id = 'bac_xiu'

    WHERE item_id = %s
    """,
    (
        123,
    )
)

con.commit()