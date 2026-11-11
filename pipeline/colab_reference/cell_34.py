import re
import numpy as np

from sklearn.feature_extraction.text import (
    TfidfVectorizer
)

from sklearn.cluster import (
    AgglomerativeClustering
)


# ============================================================
# 1. MỌI MÓN CÓ GIÁ HỢP LỆ
# ============================================================

d = pd.read_sql(
    """
    SELECT

        i.item_id,

        i.place_id,

        s.name
            AS quan,

        i.name_norm,

        i.canonical_id,

        i.match_score,

        MIN(
            p.amount
        )
            AS gia


    FROM menu_item i


    JOIN shop s

        ON s.place_id =
           i.place_id


    JOIN item_price p

        ON p.item_id =
           i.item_id

       AND p.currency =
           'VND'


    WHERE

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


    GROUP BY

        i.item_id,

        i.place_id,

        s.name,

        i.name_norm,

        i.canonical_id,

        i.match_score
    """,
    db_engine
)


# ============================================================
# 2. CHUẨN HOÁ NHẸ
# ============================================================

MOD = (
    r"\b("
    r"da|nong|hot|iced|ice|"
    r"size|s|m|l|xl|ly|"
    r"special|dac|biet|new|"
    r"best|seller|combo"
    r")\b"
)


def key(s):

    s = re.sub(
        r"\b(cf|cafe|caphe)\b",
        "ca phe",
        s
    )

    s = re.sub(
        MOD,
        " ",
        s
    )

    s = re.sub(
        r"\b\d+\b",
        " ",
        s
    )

    return re.sub(
        r"\s+",
        " ",
        s
    ).strip()


d["key"] = (
    d.name_norm
    .map(key)
)


d = d[
    d.key.str.len() >= 3
].copy()


# ============================================================
# 2B. PHÂN LOẠI DRINK / FOOD
# ============================================================

d["loai"] = [

    loai(
        n,
        c,
        s
    )

    for n, c, s in zip(
        d.name_norm,
        d.canonical_id,
        d.match_score
    )

]


# lưu classification lên PostgreSQL
d[
    [
        "item_id",
        "loai"
    ]
].to_sql(
    "item_loai",

    db_engine,

    if_exists="replace",

    index=False
)


print(
    d.loai.value_counts()
)


for t in [
    "food",
    "unknown"
]:

    print(
        f"\nTop '{t}' "
        f"theo số quán:"
    )


    display(

        d[
            d.loai == t
        ]

        .groupby(
            "key"
        )

        .agg(
            so_quan=(
                "place_id",
                "nunique"
            ),

            n=(
                "item_id",
                "size"
            )
        )

        .sort_values(
            [
                "so_quan",
                "n"
            ],

            ascending=False
        )

        .head(40)

    )


# ============================================================
# GIỮ / BỎ UNKNOWN
# ============================================================

GIU_UNKNOWN = False


d = d[
    d.loai.isin(
        (
            [
                "drink",
                "unknown"
            ]

            if GIU_UNKNOWN

            else [
                "drink"
            ]
        )
    )
].copy()


# ============================================================
# 3. CLUSTER TÊN MÓN
# ============================================================

u = (

    d.groupby(
        "key"
    )

    .agg(
        n=(
            "item_id",
            "size"
        ),

        so_quan=(
            "place_id",
            "nunique"
        )
    )

    .reset_index()

)


X = TfidfVectorizer(

    analyzer="char_wb",

    ngram_range=(
        2,
        4
    )

).fit_transform(
    u.key
)


dist = np.clip(

    1 - (
        X
        @ X.T
    ).toarray(),

    0,

    None
)


np.fill_diagonal(
    dist,
    0
)


THRESH = 0.35


u["cluster"] = (

    AgglomerativeClustering(

        n_clusters=None,

        metric="precomputed",

        linkage="average",

        distance_threshold=THRESH

    )

    .fit_predict(
        dist
    )

)


# ============================================================
# 4. LABEL = TÊN XUẤT HIỆN NHIỀU QUÁN NHẤT
# ============================================================

lab = (

    u

    .sort_values(
        [
            "so_quan",
            "n"
        ],

        ascending=False
    )

    .groupby(
        "cluster"
    )

    .first()[
        "key"
    ]

    .rename(
        "label"
    )

)


u = u.join(
    lab,
    on="cluster"
)


d = d.merge(

    u[
        [
            "key",
            "cluster",
            "label"
        ]
    ],

    on="key"

)


# ============================================================
# 5. NHÓM CÓ CANONICAL
#    → ƯU TIÊN TÊN CHUẨN
# ============================================================

canon = (

    pd.read_sql(

        """
        SELECT
            canonical_id,
            display_name

        FROM canonical_item
        """,

        db_engine

    )

    .set_index(
        "canonical_id"
    )

    .display_name

)


m = (

    d

    .dropna(
        subset=[
            "canonical_id"
        ]
    )

    .groupby(
        [
            "cluster",
            "canonical_id"
        ]
    )

    .size()

    .reset_index(
        name="c"
    )

    .sort_values(
        "c",
        ascending=False
    )

    .drop_duplicates(
        "cluster"
    )

)


m["label2"] = (
    m.canonical_id
    .map(canon)
)


d = d.merge(

    m[
        [
            "cluster",
            "label2"
        ]
    ],

    on="cluster",

    how="left"
)


d["label"] = (
    d.label2
    .fillna(
        d.label
    )
)


# ============================================================
# 6. TỔNG HỢP CLUSTER
# ============================================================

cs = (

    d.groupby(
        "label"
    )

    .agg(

        so_quan=(
            "place_id",
            "nunique"
        ),

        so_ten=(
            "key",
            "nunique"
        ),

        gia_min=(
            "gia",
            "min"
        ),

        gia_max=(
            "gia",
            "max"
        ),

        vi_du=(
            "key",

            lambda x:
                ", ".join(
                    list(
                        dict.fromkeys(x)
                    )[:6]
                )
        )
    )

)


display(

    cs.sort_values(
        "so_quan",
        ascending=False
    )

    .head(60)

)


# ============================================================
# 7. BẢNG SO SÁNH
# ============================================================

top = (

    cs[
        cs.so_quan >= 3
    ]

    .sort_values(
        "so_quan",
        ascending=False
    )

    .head(40)

    .index

)


pivot2 = (

    d[
        d.label.isin(
            top
        )
    ]

    .pivot_table(

        index="quan",

        columns="label",

        values="gia",

        aggfunc="min"

    )

)


display(
    pivot2
)


pivot2.to_csv(

    "typical_prices_cluster.csv",

    encoding="utf-8-sig"

)


# ============================================================
# LƯU CLUSTER LÊN POSTGRESQL
# ============================================================

d[
    [
        "item_id",
        "key",
        "cluster",
        "label"
    ]
].to_sql(

    "item_cluster",

    db_engine,

    if_exists="replace",

    index=False
)


print(
    "✓ item_loai và "
    "item_cluster đã lưu "
    "lên cloud database."
)