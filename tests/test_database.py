import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_database_contains_all_kurals():
    database = ROOT / "database" / "thirukkural.db"
    if not database.exists():
        raise AssertionError("Run python database/import_kurals.py first")
    with sqlite3.connect(database) as connection:
        count, unique_count, minimum, maximum = connection.execute(
            "SELECT COUNT(*), COUNT(DISTINCT kural_number), MIN(kural_number), MAX(kural_number) FROM kurals"
        ).fetchone()
    assert (count, unique_count, minimum, maximum) == (1330, 1330, 1, 1330)
