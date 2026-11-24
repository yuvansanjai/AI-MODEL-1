import csv
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "database" / "kural_data.csv"
DB_PATH = ROOT / "database" / "thirukkural.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS kurals (
 kural_number INTEGER PRIMARY KEY,
 tamil_line1 TEXT NOT NULL,
 tamil_line2 TEXT NOT NULL,
 division_ta TEXT,
 division_en TEXT,
 chapter_ta TEXT,
 chapter_en TEXT,
 tamil_meaning_mv TEXT,
 tamil_meaning_sp TEXT,
 english_translation TEXT,
 english_explanation TEXT
);
"""


def import_csv():
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(SCHEMA)
        connection.execute("DELETE FROM kurals")
        with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as source:
            reader = csv.DictReader(source)
            required = {"kural_number", "tamil_line1", "tamil_line2"}
            if not required.issubset(reader.fieldnames or []):
                raise RuntimeError("Required Kural columns are missing")
            rows = [
                (
                    int(row["kural_number"]), row["tamil_line1"], row["tamil_line2"],
                    row["division_ta"], row["division_en"], row["chapter_ta"], row["chapter_en"],
                    row["tamil_meaning_mv"], row["tamil_meaning_sp"],
                    row["english_translation"], row["english_explanation"],
                )
                for row in reader
            ]
        connection.executemany(
            "INSERT INTO kurals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", rows
        )
    print(f"Imported {len(rows)} Kurals into {DB_PATH}")


if __name__ == "__main__":
    import_csv()
