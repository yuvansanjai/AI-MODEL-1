#!/usr/bin/env python3
"""
Thiruvalluvar AI - Thirukkural Database Validation Script
Verifies integrity, completeness, and structure of backend/database/kurals.db.

Validation Checks:
1. Database connectivity and table existence
2. Exactly 1,330 unique Kurals numbered sequentially 1 to 1330 (no duplicates, no gaps)
3. Three standard sections with exact kural ranges and counts:
   - அறத்துப்பால் (Virtue): Chapters 1-38, Kurals 1-380 (380 kurals)
   - பொருட்பால் (Wealth): Chapters 39-108, Kurals 381-1080 (700 kurals)
   - காமத்துப்பால் (Love): Chapters 109-133, Kurals 1081-1330 (250 kurals)
4. Exactly 133 chapters, each containing exactly 10 kurals
5. Data integrity for all required fields (verse, lines, translations, meanings, keywords)
6. Authentic Tamil text validation (proper Tamil Unicode characters)
7. Full-text search (FTS5) operational check in both Tamil and English
"""

import os
import sys
import sqlite3

# Ensure UTF-8 output encoding for console
sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "kurals.db")


class DatabaseValidator:
    def __init__(self, db_path):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self.passed_tests = 0
        self.failed_tests = 0
        self.errors = []

    def log_success(self, title, detail=""):
        self.passed_tests += 1
        msg = f"[PASS] {title}"
        if detail:
            msg += f" -> {detail}"
        print(msg)

    def log_failure(self, title, error_msg):
        self.failed_tests += 1
        self.errors.append((title, error_msg))
        print(f"[FAIL] {title}: {error_msg}")

    def connect(self):
        if not os.path.exists(self.db_path):
            self.log_failure("Database File", f"Database not found at {self.db_path}")
            return False
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.cursor = self.conn.cursor()
            size_mb = os.path.getsize(self.db_path) / (1024 * 1024)
            self.log_success("Database Connection", f"Connected to {self.db_path} ({size_mb:.2f} MB)")
            return True
        except Exception as e:
            self.log_failure("Database Connection", str(e))
            return False

    def test_tables_exist(self):
        expected_tables = ["sections", "chapter_groups", "chapters", "kurals", "kurals_fts"]
        self.cursor.execute("SELECT name FROM sqlite_master WHERE type IN ('table', 'view')")
        tables = [row[0] for row in self.cursor.fetchall()]
        missing = [t for t in expected_tables if t not in tables]
        if missing:
            self.log_failure("Table Existence", f"Missing tables: {missing}")
        else:
            self.log_success("Table Existence", f"All expected tables present: {', '.join(expected_tables)}")

    def test_total_kural_count(self):
        self.cursor.execute("SELECT COUNT(*) FROM kurals")
        count = self.cursor.fetchone()[0]
        if count == 1330:
            self.log_success("Total Kurals Count", f"Exactly {count} kurals present")
        else:
            self.log_failure("Total Kurals Count", f"Expected 1,330 kurals, found {count}")

    def test_numbering_continuity_and_uniqueness(self):
        self.cursor.execute("SELECT number FROM kurals ORDER BY number ASC")
        numbers = [row[0] for row in self.cursor.fetchall()]
        
        # Check uniqueness
        if len(numbers) != len(set(numbers)):
            self.log_failure("Number Uniqueness", "Duplicate kural numbers detected!")
            return

        # Check range 1 to 1330
        expected_numbers = list(range(1, 1331))
        if numbers == expected_numbers:
            self.log_success("Numbering Continuity", "Numbers are 100% continuous from 1 to 1330 with zero gaps")
        else:
            missing = set(expected_numbers) - set(numbers)
            extra = set(numbers) - set(expected_numbers)
            self.log_failure("Numbering Continuity", f"Gaps detected! Missing: {len(missing)}, Extra: {len(extra)}")

    def test_sections_structure(self):
        # Section specifications
        specs = [
            (1, "அறத்துப்பால்", "Virtue", 1, 380, 380, 1, 38),
            (2, "பொருட்பால்", "Wealth", 381, 1080, 700, 39, 108),
            (3, "காமத்துப்பால்", "Love", 1081, 1330, 250, 109, 133)
        ]

        all_passed = True
        for sec_id, name_ta, name_en, min_k, max_k, exp_count, ch_start, ch_end in specs:
            self.cursor.execute(
                "SELECT COUNT(*), MIN(number), MAX(number) FROM kurals WHERE section_id = ?",
                (sec_id,)
            )
            count, min_num, max_num = self.cursor.fetchone()
            if count != exp_count or min_num != min_k or max_num != max_k:
                self.log_failure(
                    f"Section {sec_id} ({name_ta} / {name_en})",
                    f"Expected count={exp_count}, range=[{min_k}-{max_k}]. Found count={count}, range=[{min_num}-{max_num}]"
                )
                all_passed = False
            else:
                self.log_success(
                    f"Section {sec_id} ({name_ta} / {name_en})",
                    f"{count} kurals (Kurals {min_num}-{max_num}, Chapters {ch_start}-{ch_end})"
                )

        if all_passed:
            self.log_success("Section Integrity", "All 3 sections match canonical Thirukkural divisions")

    def test_chapters_structure(self):
        self.cursor.execute("SELECT COUNT(*) FROM chapters")
        ch_count = self.cursor.fetchone()[0]
        if ch_count != 133:
            self.log_failure("Chapter Count", f"Expected 133 chapters, found {ch_count}")
            return

        self.cursor.execute("""
            SELECT chapter_id, COUNT(*) as kural_count, MIN(number), MAX(number)
            FROM kurals
            GROUP BY chapter_id
            ORDER BY chapter_id ASC
        """)
        grouped = self.cursor.fetchall()

        if len(grouped) != 133:
            self.log_failure("Chapter Distribution", f"Found kurals across {len(grouped)} chapters, expected 133")
            return

        flawed_chapters = []
        for ch_id, count, min_num, max_num in grouped:
            expected_min = (ch_id - 1) * 10 + 1
            expected_max = ch_id * 10
            if count != 10 or min_num != expected_min or max_num != expected_max:
                flawed_chapters.append((ch_id, count, min_num, max_num))

        if flawed_chapters:
            self.log_failure("Chapter Kurals Distribution", f"{len(flawed_chapters)} chapters have invalid kural counts or ranges!")
        else:
            self.log_success("Chapter Integrity", "All 133 chapters contain exactly 10 kurals each with exact sequential ranges")

    def test_required_fields_and_authenticity(self):
        # Check for any NULL or empty required fields
        self.cursor.execute("""
            SELECT number, line1, line2, verse_tamil, translation_en, explanation_en,
                   meaning_ta, chapter_tamil, chapter_english, section, keywords
            FROM kurals
        """)
        rows = self.cursor.fetchall()

        empty_counts = {
            "line1": 0, "line2": 0, "verse_tamil": 0, "translation_en": 0,
            "explanation_en": 0, "meaning_ta": 0, "chapter_tamil": 0,
            "chapter_english": 0, "section": 0, "keywords": 0
        }

        non_tamil_verses = 0

        for r in rows:
            num, l1, l2, verse, trans, expl, meaning, ch_ta, ch_en, sec, kw = r

            if not l1 or not l1.strip(): empty_counts["line1"] += 1
            if not l2 or not l2.strip(): empty_counts["line2"] += 1
            if not verse or not verse.strip(): empty_counts["verse_tamil"] += 1
            if not trans or not trans.strip(): empty_counts["translation_en"] += 1
            if not expl or not expl.strip(): empty_counts["explanation_en"] += 1
            if not meaning or not meaning.strip(): empty_counts["meaning_ta"] += 1
            if not ch_ta or not ch_ta.strip(): empty_counts["chapter_tamil"] += 1
            if not ch_en or not ch_en.strip(): empty_counts["chapter_english"] += 1
            if not sec or not sec.strip(): empty_counts["section"] += 1
            if not kw or not kw.strip(): empty_counts["keywords"] += 1

            # Check for Tamil Unicode range (U+0B80 to U+0BFF)
            has_tamil = any(0x0B80 <= ord(c) <= 0x0BFF for c in verse)
            if not has_tamil:
                non_tamil_verses += 1

        total_empty = sum(empty_counts.values())
        if total_empty > 0:
            self.log_failure("Required Fields", f"Found empty values: {empty_counts}")
        else:
            self.log_success("Required Fields", "All 1,330 kurals have non-empty verse, lines, translations, meanings, and keywords")

        if non_tamil_verses > 0:
            self.log_failure("Tamil Authenticity", f"{non_tamil_verses} verses lack Tamil Unicode characters")
        else:
            self.log_success("Tamil Authenticity", "All 1,330 kurals contain authentic Tamil script")

    def test_fts5_search(self):
        try:
            # Test English search
            self.cursor.execute("SELECT COUNT(*) FROM kurals_fts WHERE kurals_fts MATCH 'rain'")
            en_hits = self.cursor.fetchone()[0]

            # Test Tamil search
            self.cursor.execute("SELECT COUNT(*) FROM kurals_fts WHERE kurals_fts MATCH 'அறம்'")
            ta_hits = self.cursor.fetchone()[0]

            # Test keyword search
            self.cursor.execute("SELECT COUNT(*) FROM kurals_fts WHERE kurals_fts MATCH 'friendship'")
            kw_hits = self.cursor.fetchone()[0]

            if en_hits > 0 and ta_hits > 0 and kw_hits > 0:
                self.log_success(
                    "FTS5 Search Index",
                    f"Search queries verified: English ('rain': {en_hits}), Tamil ('அறம்': {ta_hits}), Keyword ('friendship': {kw_hits})"
                )
            else:
                self.log_failure("FTS5 Search Index", f"Zero results in FTS: en={en_hits}, ta={ta_hits}, kw={kw_hits}")
        except Exception as e:
            self.log_failure("FTS5 Search Index", f"Error during FTS query: {e}")

    def run_all(self):
        print("=" * 70)
        print("THIRUVALLUVAR AI - THIRUKKURAL DATABASE VALIDATION")
        print("=" * 70)

        if not self.connect():
            return False

        try:
            self.test_tables_exist()
            self.test_total_kural_count()
            self.test_numbering_continuity_and_uniqueness()
            self.test_sections_structure()
            self.test_chapters_structure()
            self.test_required_fields_and_authenticity()
            self.test_fts5_search()
        finally:
            if self.conn:
                self.conn.close()

        print("=" * 70)
        print(f"VALIDATION SUMMARY: {self.passed_tests} PASSED, {self.failed_tests} FAILED")
        if self.failed_tests == 0:
            print("STATUS: ALL TESTS PASSED! Database is 100% verified and production-ready.")
            print("=" * 70)
            return True
        else:
            print(f"STATUS: VALIDATION FAILED with {self.failed_tests} errors.")
            for title, err in self.errors:
                print(f"  - {title}: {err}")
            print("=" * 70)
            return False


if __name__ == "__main__":
    validator = DatabaseValidator(DB_PATH)
    success = validator.run_all()
    sys.exit(0 if success else 1)
