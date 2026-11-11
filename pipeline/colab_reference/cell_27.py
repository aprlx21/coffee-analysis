import json
import numpy as np
import pandas as pd
import psycopg

from tqdm.auto import tqdm
from menu_db import *


# ============================================================
# CSV INPUT
# ============================================================

CSV_PATH = "file.csv"


# ============================================================
# CLOSE OLD CONNECTION
# ============================================================

try:

    con.close()

except Exception:

    pass


# ============================================================
# CONNECT CLOUD DATABASE
# ============================================================

con = connect(
    DB_URL
)


# ============================================================
# READ CSV
# ============================================================

df = pd.read_csv(
    CSV_PATH,
    encoding="utf-8-sig"
)


# ============================================================
# VALIDATE REQUIRED COLUMNS
# ============================================================

required = {
    "place_id",
    "name"
}

missing = (
    required
    - set(df.columns)
)


if missing:

    raise ValueError(
        f"CSV thiếu cột bắt buộc: "
        f"{sorted(missing)}"
    )


# ============================================================
# CLEAN place_id
# ============================================================

df = (
    df
    .dropna(
        subset=["place_id"]
    )
    .copy()
)


df["place_id"] = (
    df["place_id"]
    .astype(str)
    .str.strip()
)


if (
    df["place_id"] == ""
).any():

    raise ValueError(
        "CSV có place_id rỗng."
    )


# ============================================================
# CHECK SHOP NAME
# ============================================================

if df["name"].isna().any():

    bad = df[
        df["name"].isna()
    ][
        [
            "place_id",
            "name"
        ]
    ]

    display(
        bad
    )

    raise ValueError(
        "CSV có shop thiếu name."
    )


# ============================================================
# DUPLICATE CHECK 1
#
# Duplicate ngay trong CSV
# ============================================================

dup_in_file = df[
    df["place_id"]
    .duplicated(
        keep=False
    )
].sort_values(
    "place_id"
)


if not dup_in_file.empty:

    display(
        dup_in_file[
            [
                "place_id",
                "name"
            ]
        ]
    )

    raise ValueError(

        f"CSV có "
        f"{dup_in_file['place_id'].nunique()} "
        f"place_id bị duplicate. "

        "Chưa ghi gì vào database."
    )


print(
    "✓ Không có duplicate "
    "place_id bên trong CSV."
)


# ============================================================
# DUPLICATE CHECK 2
#
# CSV vs DATABASE
# ============================================================

incoming_ids = (
    df["place_id"]
    .tolist()
)


existing = []


if incoming_ids:

    existing = con.execute(
        """
        SELECT
            place_id,
            name

        FROM shop

        WHERE place_id =
              ANY(%s::text[])

        ORDER BY place_id
        """,
        (
            incoming_ids,
        )
    ).fetchall()


if existing:

    # kết thúc transaction SELECT
    con.rollback()

    existing_df = pd.DataFrame(
        existing,
        columns=[
            "place_id",
            "name"
        ]
    )

    print(
        "❌ Các shop sau đã tồn tại "
        "trong database:"
    )

    display(
        existing_df
    )

    raise ValueError(

        f"Phát hiện "
        f"{len(existing_df)} "
        f"place_id đã tồn tại "
        f"trong cloud database. "

        "Toàn bộ CSV bị dừng "
        "trước khi insert/OCR."
    )


print(
    "✓ Không có place_id nào "
    "trùng cloud database."
)


# ============================================================
# HELPER:
# pandas/numpy value -> Python/Postgres value
# ============================================================

def _db_value(v):

    if v is None:

        return None


    try:

        if pd.isna(v):

            return None

    except (
        TypeError,
        ValueError
    ):

        pass


    if isinstance(
        v,
        np.generic
    ):

        return v.item()


    return v


# ============================================================
# HELPER:
# parse coordinates
# ============================================================

def _coords(v):

    if isinstance(
        v,
        dict
    ):

        return v


    if (
        isinstance(v, str)
        and v.strip()
    ):

        try:

            obj = json.loads(
                v
            )

            if isinstance(
                obj,
                dict
            ):

                return obj


        except json.JSONDecodeError:

            pass


    return {}


# ============================================================
# INSERT ONE SHOP
# ============================================================

def ensure_shop(
    con,
    r
):

    coords = _coords(
        r.get(
            "coordinates"
        )
    )


    # raw row CSV
    raw = {

        k: _db_value(v)

        for k, v
        in r.items()

    }


    insert_shop(
        con,

        dict(

            place_id=str(
                r["place_id"]
            ).strip(),

            name=str(
                r["name"]
            ),

            main_category=
                _db_value(
                    r.get(
                        "main_category"
                    )
                ),

            address=
                _db_value(
                    r.get(
                        "address"
                    )
                ),

            lat=
                _db_value(
                    coords.get(
                        "latitude"
                    )
                ),

            lng=
                _db_value(
                    coords.get(
                        "longitude"
                    )
                ),

            rating=
                _db_value(
                    r.get(
                        "rating"
                    )
                ),

            reviews=
                _db_value(
                    r.get(
                        "reviews"
                    )
                ),

            price_range=
                _db_value(
                    r.get(
                        "price_range"
                    )
                ),

            website=
                _db_value(
                    r.get(
                        "website"
                    )
                ),

            phone=
                _db_value(
                    r.get(
                        "phone"
                    )
                ),

            maps_link=
                _db_value(
                    r.get(
                        "link"
                    )
                ),

            raw_json=
                json.dumps(
                    raw,
                    ensure_ascii=False,
                    default=str
                )

        )
    )


# ============================================================
# INSERT SHOP BATCH
#
# Tất cả shop được insert trước OCR.
#
# Nếu PostgreSQL phát hiện duplicate:
# rollback toàn bộ batch shop.
# ============================================================

try:

    for _, row in tqdm(
        df.iterrows(),
        total=len(df),
        desc="Insert shops"
    ):

        ensure_shop(
            con,
            row.to_dict()
        )


    con.commit()


except psycopg.errors.UniqueViolation as e:

    con.rollback()

    raise ValueError(

        "PostgreSQL phát hiện "
        "duplicate place_id "
        "trong lúc insert. "

        "Không shop nào của batch "
        "insert này được commit."

    ) from e


except Exception:

    con.rollback()

    raise


print(
    f"✓ Đã thêm {len(df)} "
    f"shop mới."
)


# ============================================================
# OCR
# ============================================================

print(
    "Bắt đầu OCR..."
)


for _, row in tqdm(
    df.iterrows(),
    total=len(df),
    desc="OCR menu"
):

    process_shop(
        row.to_dict(),
        con
    )


con.commit()


# ============================================================
# STATUS
# ============================================================

print(
    "\nTrạng thái ảnh:"
)


display(
    pd.read_sql(
        """
        SELECT
            status,
            COUNT(*) AS n

        FROM menu_image

        GROUP BY status

        ORDER BY status
        """,
        db_engine
    )
)


print(
    "Tổng số shop "
    "trong cloud DB:"
)


display(
    pd.read_sql(
        """
        SELECT
            COUNT(*) AS total_shops

        FROM shop
        """,
        db_engine
    )
)