from graphviz import Digraph
from IPython.display import display

from sqlalchemy import inspect

from html import escape


# ============================================================
# INSPECT POSTGRESQL
# ============================================================

insp = inspect(
    db_engine
)


tables = insp.get_table_names(
    schema="public"
)


# ============================================================
# GRAPH
# ============================================================

g = Digraph(
    "ERD",
    format="png"
)


g.attr(
    rankdir="LR",
    fontname="Helvetica"
)


g.attr(
    "node",
    shape="plaintext",
    fontname="Helvetica"
)


# ============================================================
# TABLE NODES
# ============================================================

for table in tables:

    columns = insp.get_columns(
        table,
        schema="public"
    )


    pk_info = (
        insp.get_pk_constraint(
            table,
            schema="public"
        )
    )


    pk_columns = set(
        pk_info.get(
            "constrained_columns"
        )
        or []
    )


    foreign_keys = (
        insp.get_foreign_keys(
            table,
            schema="public"
        )
    )


    fk_columns = set()


    for fk in foreign_keys:

        for column in (
            fk.get(
                "constrained_columns"
            )
            or []
        ):

            fk_columns.add(
                column
            )


    rows = ""


    for col in columns:

        name = col["name"]

        typ = str(
            col["type"]
        )


        if name in pk_columns:

            tag = "PK "

        elif name in fk_columns:

            tag = "FK "

        else:

            tag = "   "


        rows += (

            '<TR>'

            '<TD ALIGN="LEFT">'
            f'{escape(tag + name)}'
            '</TD>'

            '<TD ALIGN="LEFT">'
            f'{escape(typ)}'
            '</TD>'

            '</TR>'

        )


    label = (

        '<<TABLE '
        'BORDER="1" '
        'CELLBORDER="0" '
        'CELLSPACING="0">'

        '<TR>'

        '<TD '
        'COLSPAN="2" '
        'BGCOLOR="#cfe2ff">'

        f'<B>{escape(table)}</B>'

        '</TD>'

        '</TR>'

        f'{rows}'

        '</TABLE>>'

    )


    g.node(
        table,
        label
    )


# ============================================================
# FOREIGN KEY EDGES
# ============================================================

for table in tables:

    foreign_keys = (
        insp.get_foreign_keys(
            table,
            schema="public"
        )
    )


    for fk in foreign_keys:

        parent_table = (
            fk.get(
                "referred_table"
            )
        )


        child_columns = (
            fk.get(
                "constrained_columns"
            )
            or []
        )


        parent_columns = (
            fk.get(
                "referred_columns"
            )
            or []
        )


        for child_col, parent_col in zip(
            child_columns,
            parent_columns
        ):

            g.edge(
                table,
                parent_table,

                label=(
                    f"{child_col}"
                    f" → "
                    f"{parent_col}"
                )
            )


# ============================================================
# RENDER
# ============================================================

g.render(
    "/content/erd_postgres",
    cleanup=True
)


display(
    g
)