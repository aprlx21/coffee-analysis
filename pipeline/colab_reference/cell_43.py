print(
    "Database hiện được lưu "
    "trực tiếp trên PostgreSQL cloud."
)


summary = pd.read_sql(
    """
    SELECT

        (
            SELECT COUNT(*)
            FROM shop
        )
            AS shops,

        (
            SELECT COUNT(*)
            FROM menu_image
        )
            AS images,

        (
            SELECT COUNT(*)
            FROM menu_item
        )
            AS items,

        (
            SELECT COUNT(*)
            FROM item_price
        )
            AS prices
    """,
    db_engine
)


display(
    summary
)