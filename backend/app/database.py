<<<<<<< HEAD
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATABASE_PATH = ROOT / "database" / "thirukkural.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection
=======
"""SQLite database connection and query functions for Thiruvalluvar AI.

Supports the comprehensive kurals schema:
- Tables: sections, chapter_groups, chapters, kurals, kurals_fts (FTS5)
- Full-text search across Tamil verses, commentaries, and English translations.
- Topic exploration and deterministic Kural of the day.
"""

import os
import sqlite3
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BACKEND_DIR / "database" / "kurals.db"


def get_db_path() -> Path:
    """Resolve database path from environment variable or default location."""
    env_path = os.getenv("DATABASE_PATH")
    if env_path:
        p = Path(env_path)
        if not p.is_absolute():
            p = BACKEND_DIR / p
        return p
    return DEFAULT_DB_PATH


def get_db_connection() -> sqlite3.Connection:
    """Create a SQLite database connection with row factory enabled."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path), timeout=15.0)
    conn.row_factory = sqlite3.Row
    return conn


def _map_row_to_kural_dict(row: sqlite3.Row, col_names: set) -> Dict[str, Any]:
    """Map database row to standard Kural schema with support for all variations."""
    d = dict(row)

    # Number
    number = d.get("number") or d.get("kural_no") or d.get("id") or 1

    # Lines / Couplet
    line1 = d.get("line1") or ""
    line2 = d.get("line2") or ""
    couplet = d.get("verse_tamil") or d.get("couplet") or f"{line1}\n{line2}"

    if (not line1 or not line2) and couplet:
        parts = couplet.strip().split("\n")
        if len(parts) >= 2:
            line1 = line1 or parts[0].strip()
            line2 = line2 or parts[1].strip()

    # Translation & Explanations
    translation = d.get("translation_en") or d.get("translation") or d.get("couplet_en") or ""
    exp_tam = d.get("meaning_ta_mv") or d.get("meaning_ta") or d.get("explanation_tam") or ""
    exp_eng = d.get("explanation_en") or d.get("explanation_eng") or translation

    mv_exp = d.get("meaning_ta_mv") or d.get("mv_explanation") or exp_tam
    sp_exp = d.get("meaning_ta_sp") or d.get("sp_explanation") or ""
    mk_exp = d.get("meaning_ta_mk") or d.get("mk_explanation") or ""

    # Chapters and sections
    chapter_num = d.get("chapter_id") or d.get("chapter_number") or ((int(number) - 1) // 10 + 1)
    chapter_tam = d.get("chapter_tamil") or d.get("chapter_name") or d.get("athigaram") or "அதிகாரம்"
    chapter_eng = d.get("chapter_english") or d.get("chapter_eng") or "Chapter"

    section_tam = d.get("section_tamil") or d.get("paal_tamil") or d.get("section") or "அறத்துப்பால்"
    section_eng = d.get("section_english") or d.get("paal_english") or "Virtue"

    group_tam = d.get("chapter_group_tamil") or d.get("group_tamil") or d.get("iyal_tamil")
    group_eng = d.get("chapter_group_english") or d.get("group_english") or d.get("iyal_english")

    transliteration = d.get("transliteration") or d.get("transliteration1") or ""

    return {
        "number": int(number),
        "line1": line1,
        "line2": line2,
        "translation": translation,
        "explanation_tam": exp_tam,
        "explanation_eng": exp_eng,
        "chapter_number": int(chapter_num),
        "chapter_tamil": chapter_tam,
        "chapter_english": chapter_eng,
        "section_tamil": section_tam,
        "section_english": section_eng,
        "group_tamil": group_tam,
        "group_english": group_eng,
        "couplet": couplet,
        "transliteration": transliteration,
        "mv_explanation": mv_exp,
        "sp_explanation": sp_exp,
        "mk_explanation": mk_exp,
        "keywords": d.get("keywords") or "",
    }


def init_db():
    """Verify database and tables exist."""
    db_path = get_db_path()
    if not db_path.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='kurals'")
        table_exists = cursor.fetchone() is not None

        if not table_exists:
            # Fallback initialization if database is not present yet
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS kurals (
                number INTEGER PRIMARY KEY,
                line1 TEXT NOT NULL,
                line2 TEXT NOT NULL,
                verse_tamil TEXT,
                translation_en TEXT,
                couplet_en TEXT,
                explanation_en TEXT,
                meaning_ta TEXT,
                meaning_ta_mv TEXT,
                meaning_ta_sp TEXT,
                meaning_ta_mk TEXT,
                transliteration TEXT,
                chapter_id INTEGER,
                chapter_tamil TEXT,
                chapter_english TEXT,
                chapter_group_tamil TEXT,
                chapter_group_english TEXT,
                section_tamil TEXT,
                section_english TEXT,
                keywords TEXT
            );
            """)
            conn.commit()


def get_total_kural_count() -> int:
    """Return total count of Kurals in the database."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM kurals")
            row = cursor.fetchone()
            return row[0] if row else 0
    except Exception:
        return 0


def get_kural_by_number(number: int) -> Optional[Dict[str, Any]]:
    """Fetch a single Kural by its number (1 to 1330)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(kurals)")
        columns = {col[1] for col in cursor.fetchall()}

        cursor.execute("SELECT * FROM kurals WHERE number = ?", (number,))
        row = cursor.fetchone()
        if not row:
            return None
        return _map_row_to_kural_dict(row, columns)


def get_kurals(
    page: int = 1,
    limit: int = 10,
    section: Optional[str] = None,
    chapter_number: Optional[int] = None
) -> Tuple[List[Dict[str, Any]], int]:
    """Fetch paginated list of Kurals with optional filtering."""
    offset = (page - 1) * limit
    params: List[Any] = []
    where_clauses: List[str] = []

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(kurals)")
        columns = {col[1] for col in cursor.fetchall()}

        if section:
            sec_col = "section_tamil" if "section_tamil" in columns else "section"
            where_clauses.append(f"({sec_col} LIKE ? OR section_english LIKE ?)")
            params.extend([f"%{section}%", f"%{section}%"])

        if chapter_number:
            chap_col = "chapter_id" if "chapter_id" in columns else "chapter_number"
            where_clauses.append(f"{chap_col} = ?")
            params.append(chapter_number)

        where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        # Total count
        count_sql = f"SELECT COUNT(*) FROM kurals{where_sql}"
        cursor.execute(count_sql, params)
        total = cursor.fetchone()[0]

        # Results
        query_sql = f"SELECT * FROM kurals{where_sql} ORDER BY number ASC LIMIT ? OFFSET ?"
        query_params = params + [limit, offset]
        cursor.execute(query_sql, query_params)
        rows = cursor.fetchall()

        results = [_map_row_to_kural_dict(r, columns) for r in rows]
        return results, total


STOP_WORDS = {
    "what", "is", "the", "a", "an", "does", "tell", "me", "about", "us", "in",
    "on", "of", "for", "to", "and", "or", "say", "teach", "how", "why", "who",
    "can", "you", "give", "show", "meaning", "explain", "valluvar", "thiruvalluvar",
    "kural", "thirukkural", "enna", "sollu", "solla", "paththi", "patri"
}


def search_kurals_fts(query: str, limit: int = 20, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
    """Perform high-performance full text search using SQLite FTS5 table if available,
    falling back to LIKE matching.
    """
    clean_q = query.strip()
    if not clean_q:
        return [], 0

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(kurals)")
        columns = {col[1] for col in cursor.fetchall()}

        # 1. Check if numeric
        if clean_q.isdigit():
            k = get_kural_by_number(int(clean_q))
            if k:
                return [k], 1
            return [], 0

        # 2. Check if kurals_fts table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='kurals_fts'")
        has_fts = cursor.fetchone() is not None

        if has_fts:
            try:
                # Sanitize query for FTS5
                fts_query = "".join([c if c.isalnum() or c.isspace() else " " for c in clean_q]).strip()
                words = [w.lower() for w in fts_query.split() if w]
                # Filter out stopwords for multi-word queries
                meaningful = [w for w in words if w not in STOP_WORDS]
                target_words = meaningful if meaningful else words

                if target_words:
                    tokens = [f'"{w}"*' for w in target_words[:6]]
                    match_expr = " OR ".join(tokens)

                    count_sql = "SELECT COUNT(*) FROM kurals_fts WHERE kurals_fts MATCH ?"
                    cursor.execute(count_sql, (match_expr,))
                    total = cursor.fetchone()[0]

                    fts_sql = """
                    SELECT k.* FROM kurals k
                    JOIN kurals_fts fts ON k.number = fts.rowid
                    WHERE kurals_fts MATCH ?
                    ORDER BY rank
                    LIMIT ? OFFSET ?
                    """
                    cursor.execute(fts_sql, (match_expr, limit, offset))
                    rows = cursor.fetchall()

                    if rows:
                        return [_map_row_to_kural_dict(r, columns) for r in rows], total
            except Exception:
                pass

        # 3. Fallback LIKE search
        pat = f"%{clean_q}%"
        like_sql = """
        SELECT * FROM kurals
        WHERE line1 LIKE ? OR line2 LIKE ? OR verse_tamil LIKE ?
           OR translation_en LIKE ? OR explanation_en LIKE ?
           OR meaning_ta_mv LIKE ? OR meaning_ta LIKE ?
           OR chapter_tamil LIKE ? OR chapter_english LIKE ?
           OR keywords LIKE ?
        ORDER BY number ASC
        LIMIT ? OFFSET ?
        """
        params = [pat] * 10 + [limit, offset]
        cursor.execute(like_sql, params)
        rows = cursor.fetchall()

        count_sql = """
        SELECT COUNT(*) FROM kurals
        WHERE line1 LIKE ? OR line2 LIKE ? OR verse_tamil LIKE ?
           OR translation_en LIKE ? OR explanation_en LIKE ?
           OR meaning_ta_mv LIKE ? OR meaning_ta LIKE ?
           OR chapter_tamil LIKE ? OR chapter_english LIKE ?
           OR keywords LIKE ?
        """
        cursor.execute(count_sql, [pat] * 10)
        total = cursor.fetchone()[0]

        return [_map_row_to_kural_dict(r, columns) for r in rows], total


def get_random_kural(section: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve a random Kural, optionally filtered by section."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(kurals)")
        columns = {col[1] for col in cursor.fetchall()}

        if section:
            sec_col = "section_tamil" if "section_tamil" in columns else "section"
            cursor.execute(
                f"SELECT * FROM kurals WHERE {sec_col} LIKE ? OR section_english LIKE ? ORDER BY RANDOM() LIMIT 1",
                (f"%{section}%", f"%{section}%")
            )
        else:
            cursor.execute("SELECT * FROM kurals ORDER BY RANDOM() LIMIT 1")

        row = cursor.fetchone()
        if not row:
            return None
        return _map_row_to_kural_dict(row, columns)


def get_daily_kural(date_str: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve a deterministic Kural of the Day for any calendar date."""
    if not date_str:
        date_str = datetime.now().strftime("%Y-%m-%d")

    total = get_total_kural_count()
    if total == 0:
        return None

    hash_val = int(hashlib.sha256(date_str.encode("utf-8")).hexdigest(), 16)
    target_number = (hash_val % total) + 1

    k = get_kural_by_number(target_number)
    return k or get_kural_by_number(1)


def get_chapters(section: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve all 133 chapters with their sections and Kural ranges."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='chapters'")
        has_chap_tbl = cursor.fetchone() is not None

        if has_chap_tbl:
            cursor.execute("PRAGMA table_info(chapters)")
            chap_cols = {col[1] for col in cursor.fetchall()}

            num_col = "number" if "number" in chap_cols else ("id" if "id" in chap_cols else "chapter_id")
            name_tam_col = "name_tamil" if "name_tamil" in chap_cols else "chapter_tamil"
            name_eng_col = "name_english" if "name_english" in chap_cols else "chapter_english"
            sec_tam_col = "section_tamil" if "section_tamil" in chap_cols else "section"
            sec_eng_col = "section_english" if "section_english" in chap_cols else "section"

            sql = f"SELECT * FROM chapters"
            params: List[Any] = []
            if section:
                sql += f" WHERE {sec_tam_col} LIKE ? OR {sec_eng_col} LIKE ?"
                params.extend([f"%{section}%", f"%{section}%"])
            sql += f" ORDER BY {num_col} ASC"

            cursor.execute(sql, params)
            rows = cursor.fetchall()
            chapters = []
            for r in rows:
                d = dict(r)
                c_num = d.get(num_col) or 1
                chapters.append({
                    "number": int(c_num),
                    "name_tamil": d.get(name_tam_col) or d.get("name_tamil") or "",
                    "name_english": d.get(name_eng_col) or d.get("name_english") or "",
                    "section_tamil": d.get(sec_tam_col) or d.get("section_tamil") or "அறத்துப்பால்",
                    "section_english": d.get(sec_eng_col) or d.get("section_english") or "Virtue",
                    "group_tamil": d.get("group_tamil") or d.get("chapter_group_tamil"),
                    "group_english": d.get("group_english") or d.get("chapter_group_english"),
                    "start_kural": d.get("start_kural") or ((int(c_num) - 1) * 10 + 1),
                    "end_kural": d.get("end_kural") or (int(c_num) * 10),
                })
            return chapters

        # Fallback: synthesize from kurals table distinct chapters
        cursor.execute("""
        SELECT DISTINCT chapter_id, chapter_tamil, chapter_english, section_tamil, section_english
        FROM kurals ORDER BY chapter_id ASC
        """)
        rows = cursor.fetchall()
        return [
            {
                "number": r["chapter_id"],
                "name_tamil": r["chapter_tamil"],
                "name_english": r["chapter_english"],
                "section_tamil": r["section_tamil"],
                "section_english": r["section_english"],
                "group_tamil": None,
                "group_english": None,
                "start_kural": (r["chapter_id"] - 1) * 10 + 1,
                "end_kural": r["chapter_id"] * 10,
            }
            for r in rows
        ]


def get_chapter_by_number(number: int) -> Optional[Dict[str, Any]]:
    """Retrieve specific chapter and its 10 Kurals."""
    chapters = get_chapters()
    target = next((c for c in chapters if c["number"] == number), None)

    if not target:
        # Fallback from first kural of that chapter
        first_num = (number - 1) * 10 + 1
        k_first = get_kural_by_number(first_num)
        if not k_first:
            return None
        target = {
            "number": number,
            "name_tamil": k_first["chapter_tamil"],
            "name_english": k_first["chapter_english"],
            "section_tamil": k_first["section_tamil"],
            "section_english": k_first["section_english"],
            "group_tamil": k_first.get("group_tamil"),
            "group_english": k_first.get("group_english"),
            "start_kural": first_num,
            "end_kural": number * 10,
        }

    kurals, _ = get_kurals(page=1, limit=10, chapter_number=number)
    target["kurals"] = kurals
    return target


# Curated topics catalog
TOPICS_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "education",
        "title_english": "Education & Wisdom (கல்வி)",
        "title_tamil": "கல்வி மற்றும் அறிவுடைமை",
        "description_english": "The timeless power of true learning, humility before knowledge, and discernment.",
        "description_tamil": "கற்க கசடறக் கற்றவை கற்றபின் நிற்க அதற்குத் தக - அறிவின் சிறப்பும் பயன்பாடும்.",
        "icon": "book-open",
        "sample_kural_numbers": [391, 392, 393, 396, 397, 400],
        "keywords": ["education", "learning", "wisdom", "study", "knowledge", "கல்வி", "கற்றல்", "அறிவு", "பள்ளிக்கூடம்"]
    },
    {
        "id": "friendship",
        "title_english": "True Friendship (நட்பு)",
        "title_tamil": "நட்பு மற்றும் நட்டல்",
        "description_english": "Steadfast loyalty, lifting a friend in despair, and choosing noble companions.",
        "description_tamil": "உடுக்கை இழந்தவன் கைபோல ஆங்கே இடுக்கண் களைவதாம் நட்பு - உண்மையான தோழமை.",
        "icon": "users",
        "sample_kural_numbers": [781, 782, 785, 788, 790],
        "keywords": ["friendship", "friend", "companion", "loyalty", "trust", "நட்பு", "நண்பன்", "தோழன்", "தோழி", "பாசம்"]
    },
    {
        "id": "gratitude",
        "title_english": "Gratitude & Memory (செய்ந்நன்றி அறிதல்)",
        "title_tamil": "செய்ந்நன்றி அறிதல்",
        "description_english": "Never forgetting a kindness received, however small, across time and adversity.",
        "description_tamil": "செய்யாமல் செய்த உதவிக்கு வையகமும் வானகமும் ஆற்றல் அரிது - நன்றியுணர்வு.",
        "icon": "heart-handshake",
        "sample_kural_numbers": [101, 102, 103, 104, 108, 110],
        "keywords": ["gratitude", "thankfulness", "kindness", "help", "thanks", "நன்றி", "செய்ந்நன்றி", "உதவி", "கைம்மாறு"]
    },
    {
        "id": "love",
        "title_english": "Universal Love (அன்புடைமை)",
        "title_tamil": "அன்புடைமை",
        "description_english": "The foundation of all virtue; the inner warmth that binds all living beings together.",
        "description_tamil": "அன்பிலார் எல்லாம் தமக்குரியர் அன்புடையார் என்பும் உரியர் பிறர்க்கு - அன்பின் வலிமை.",
        "icon": "heart",
        "sample_kural_numbers": [71, 72, 73, 76, 78, 80],
        "keywords": ["love", "compassion", "affection", "kindness", "care", "அன்பு", "அன்புடைமை", "பாசம்", "கருணை"]
    },
    {
        "id": "hardwork",
        "title_english": "Perseverance & Effort (முயற்சி / ஆள்வினையுடைமை)",
        "title_tamil": "ஆள்வினையுடைமை மற்றும் முயற்சி",
        "description_english": "Tireless diligence that overcomes even fate and brings destined rewards.",
        "description_tamil": "தெய்வத்தான் ஆகா தெனினும் முயற்சிதன் மெய்வருத்தக் கூலி தரும் - உழைப்பின் உயர்வு.",
        "icon": "hammer",
        "sample_kural_numbers": [611, 616, 619, 620, 591, 595],
        "keywords": ["effort", "hardwork", "perseverance", "diligence", "grit", "success", "முயற்சி", "உழைப்பு", "விடாமுயற்சி"]
    },
    {
        "id": "truth",
        "title_english": "Truthfulness (வாய்மை)",
        "title_tamil": "வாய்மை",
        "description_english": "Speaking that which produces untainted good, purifying the soul beyond ritual water.",
        "description_tamil": "வாய்மை எனப்படுவது யாதெனின் யாதொன்றும் தீமை இலாத சொலல் - உண்மையின் மாண்பு.",
        "icon": "shield-check",
        "sample_kural_numbers": [291, 292, 293, 298, 300],
        "keywords": ["truth", "honesty", "integrity", "sincerity", "வாய்மை", "உண்மை", "நேர்மை", "மெய்"]
    },
    {
        "id": "patience",
        "title_english": "Forbearance & Restraint (பொறையுடைமை / அடக்கமுடைமை)",
        "title_tamil": "பொறையுடைமை மற்றும் அடக்கமுடைமை",
        "description_english": "Bearing insults with graceful dignity, like the patient earth bearing those who dig it.",
        "description_tamil": "அகழ்வாரைத் தாங்கும் நிலம்போலத் தம்மை இகழ்வார்ப் பொறுத்தல் தலை - பொறுமை காத்தல்.",
        "icon": "mountain",
        "sample_kural_numbers": [151, 152, 155, 122, 127, 130],
        "keywords": ["patience", "forbearance", "tolerance", "restraint", "calm", "பொறுமை", "பொறை", "அடக்கம்", "சாந்தம்"]
    },
    {
        "id": "sweet_speech",
        "title_english": "Sweet Words (இனியவை கூறல்)",
        "title_tamil": "இனியவை கூறல்",
        "description_english": "Speaking gentle words with a sunny heart; avoiding harsh speech like picking bitter unripe fruit.",
        "description_tamil": "இனிய உளவாக இன்னாத கூறல் கனிஇருப்பக் காய்கவர்ந் தற்று - இனிமையான சொற்கள்.",
        "icon": "sparkles",
        "sample_kural_numbers": [91, 92, 95, 99, 100],
        "keywords": ["speech", "sweet words", "kindness", "gentle", "politeness", "இன்சொல்", "இனியவை கூறல்", "பேச்சு"]
    },
    {
        "id": "leadership",
        "title_english": "Leadership & Governance (இறைமாட்சி)",
        "title_tamil": "இறைமாட்சி மற்றும் செங்கோன்மை",
        "description_english": "Qualities of a vision-driven leader: fearlessness, generosity, justice, and guardianship.",
        "description_tamil": "படைகுடி கூழ்அமைச்சு நட்பரண் ஆறும் உடையான் அரசருள் ஏறு - சிறந்த தலைவனின் இலக்கணம்.",
        "icon": "crown",
        "sample_kural_numbers": [381, 382, 385, 388, 390],
        "keywords": ["leadership", "ruler", "king", "governance", "justice", "தலைமை", "அரசு", "இறைமாட்சி", "நீதி"]
    },
    {
        "id": "family",
        "title_english": "Children & Domestic Life (புதல்வரைப் பெறுதல் / இல்வாழ்க்கை)",
        "title_tamil": "புதல்வரைப் பெறுதல் மற்றும் இல்வாழ்க்கை",
        "description_english": "The joy of children's prattle, good parenting, and the beauty of home life.",
        "description_tamil": "குழலினிது யாழினிது என்பதம் மக்கள் மழலைச்சொல் கேளாதவர் - குடும்பம் மற்றும் பிள்ளைகள்.",
        "icon": "smile",
        "sample_kural_numbers": [61, 64, 65, 66, 68, 69],
        "keywords": ["family", "children", "parents", "son", "daughter", "mother", "father", "பிள்ளைகள்", "தாய்", "தந்தை", "குடும்பம்"]
    }
]


def get_topics_list() -> List[Dict[str, Any]]:
    """Return all curated topics with summary statistics."""
    return [
        {
            "id": t["id"],
            "title_english": t["title_english"],
            "title_tamil": t["title_tamil"],
            "description_english": t["description_english"],
            "description_tamil": t["description_tamil"],
            "icon": t["icon"],
            "sample_kural_numbers": t["sample_kural_numbers"],
            "total_kurals": len(t["sample_kural_numbers"]),
        }
        for t in TOPICS_CATALOG
    ]


def get_kurals_by_topic(topic_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch Kurals matching a specific topic ID."""
    topic = next((t for t in TOPICS_CATALOG if t["id"] == topic_id), None)
    if not topic:
        return []

    kurals = []
    for num in topic["sample_kural_numbers"][:limit]:
        k = get_kural_by_number(num)
        if k:
            kurals.append(k)
    return kurals
>>>>>>> 071a39a990d8d851a677928900ec91f75fab24b3
