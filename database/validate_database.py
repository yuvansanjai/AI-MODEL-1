import csv
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "database" / "kural_data.csv"
DB_PATH = ROOT / "database" / "thirukkural.db"


def validate():
    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as source:
        numbers = [int(row["kural_number"]) for row in csv.DictReader(source)]
    if len(numbers) != 1330 or len(set(numbers)) != 1330:
        raise AssertionError("CSV must contain 1,330 unique Kural numbers")
    if set(numbers) != set(range(1, 1331)):
        raise AssertionError("CSV numbering must cover 1 through 1330 exactly")

    with sqlite3.connect(DB_PATH) as connection:
        count, unique_count, minimum, maximum = connection.execute(
            "SELECT COUNT(*), COUNT(DISTINCT kural_number), MIN(kural_number), MAX(kural_number) FROM kurals"
        ).fetchone()
    if (count, unique_count, minimum, maximum) != (1330, 1330, 1, 1330):
        raise AssertionError("SQLite database validation failed")
    print("Validated 1,330 unique Kurals numbered 1 through 1330")


if __name__ == "__main__":
    validate()
