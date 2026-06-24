"""Lightweight, idempotent schema sync for environments without Alembic.

``Base.metadata.create_all`` creates missing *tables* but never alters an
existing table, so newly-added model columns are invisible to a database that
predates them (e.g. the managed Postgres on Railway). This module adds any
columns that exist on the SQLAlchemy models but are missing from the live
database via ``ALTER TABLE ... ADD COLUMN``.

It is intentionally minimal: it only *adds* columns (never drops/retypes), so
it is safe to run on every startup. For anything more involved (renames, type
changes, constraints) introduce Alembic migrations.
"""

from __future__ import annotations

import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.schema import CreateColumn

logger = logging.getLogger("uvicorn.error")


def sync_missing_columns(engine: Engine) -> list[str]:
    """Add columns defined on the models but absent from the database.

    Returns the list of ``"table.column"`` identifiers that were added.
    """
    from ..db.base import Base

    # Make sure all models are imported/registered on the metadata.
    from .. import models  # noqa: F401

    added: list[str] = []
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        compiler = engine.dialect.ddl_compiler(engine.dialect, None)

        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                # Brand-new table — create_all handles this elsewhere.
                continue

            db_columns = {col["name"] for col in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in db_columns:
                    continue

                # Render the column definition for the active dialect, then
                # strip any NOT NULL: existing rows have no value yet, so the
                # column must be added nullable (models keep their own default
                # for new rows going forward).
                col_sql = compiler.process(CreateColumn(column))
                col_sql = col_sql.replace(" NOT NULL", "")

                ddl = f'ALTER TABLE "{table.name}" ADD COLUMN {col_sql}'
                try:
                    conn.execute(text(ddl))
                    added.append(f"{table.name}.{column.name}")
                except Exception as exc:  # noqa: BLE001 - log and continue
                    logger.warning(
                        "Could not add column %s.%s: %s",
                        table.name,
                        column.name,
                        exc,
                    )

    if added:
        logger.info("Schema sync added columns: %s", ", ".join(added))
    return added
