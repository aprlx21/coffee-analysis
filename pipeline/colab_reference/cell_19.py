from google.colab import userdata

from sqlalchemy import create_engine
from sqlalchemy import text


# ============================================================
# LOAD DATABASE URL
# ============================================================

DB_URL = userdata.get(
    "SUPABASE_DB_URL"
)


if not DB_URL:

    raise ValueError(
        "Không tìm thấy SUPABASE_DB_URL "
        "trong Colab Secrets."
    )


if "[YOUR-PASSWORD]" in DB_URL:

    raise ValueError(
        "Bạn chưa thay [YOUR-PASSWORD] "
        "trong Supabase connection string."
    )


# ============================================================
# SQLALCHEMY URL
#
# psycopg.connect dùng postgresql://
# SQLAlchemy dùng postgresql+psycopg://
# ============================================================

if DB_URL.startswith(
    "postgresql://"
):

    SQLALCHEMY_DB_URL = DB_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )

elif DB_URL.startswith(
    "postgres://"
):

    SQLALCHEMY_DB_URL = DB_URL.replace(
        "postgres://",
        "postgresql+psycopg://",
        1
    )

else:

    raise ValueError(
        "SUPABASE_DB_URL phải bắt đầu bằng "
        "postgresql:// hoặc postgres://"
    )


# ============================================================
# DATABASE ENGINE
#
# QUAN TRỌNG:
# tên là db_engine
#
# KHÔNG đặt = engine
# vì notebook dùng engine cho PaddleOCR.
# ============================================================

db_engine = create_engine(
    SQLALCHEMY_DB_URL,

    pool_pre_ping=True,

    connect_args={
        "sslmode": "require"
    }
)


# ============================================================
# TEST CONNECTION
# ============================================================

with db_engine.connect() as db:

    info = db.execute(
        text(
            """
            SELECT
                current_database(),
                current_user
            """
        )
    ).fetchone()


print(
    "Cloud database connected:"
)

print(
    "database =",
    info[0]
)

print(
    "user     =",
    info[1]
)