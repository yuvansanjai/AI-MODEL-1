<<<<<<< HEAD
import re
from .database import get_connection

TOPIC_TERMS = {
    "knowledge": ["knowledge", "learning", "education", "wisdom", "அறிவு", "கல்வி"],
    "friendship": ["friendship", "friend", "நட்பு", "நண்பர்"],
    "work": ["work", "effort", "career", "உழைப்பு", "தொழில்"],
    "love": ["love", "affection", "காதல்", "அன்பு"],
    "leadership": ["leader", "leadership", "king", "government", "அரசு", "அரசன்"],
    "virtue": ["virtue", "good conduct", "அறம்", "ஒழுக்கம்"],
}


def get_kural(number):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM kurals WHERE kural_number = ?", (number,)
        ).fetchone()
        return dict(row) if row else None


def search_kurals(query, limit=5):
    text = (query or "").strip()
    if not text:
        return []

    number_match = re.search(r"\b(\d{1,4})\b", text)
    if number_match:
        number = int(number_match.group(1))
        if 1 <= number <= 1330:
            row = get_kural(number)
            return [row] if row else []

    topic = None
    lower = text.lower()
    for name, terms in TOPIC_TERMS.items():
        if any(term.lower() in lower for term in terms):
            topic = name
            break

    haystack_terms = text.replace("/", " ").replace(",", " ").split()
    sql = """
        SELECT * FROM kurals
        WHERE lower(COALESCE(tamil_line1,'') || ' ' ||
                     COALESCE(tamil_line2,'') || ' ' ||
                     COALESCE(tamil_meaning_mv,'') || ' ' ||
                     COALESCE(english_translation,'') || ' ' ||
                     COALESCE(english_explanation,'') || ' ' ||
                     COALESCE(chapter_en,'') || ' ' ||
                     COALESCE(chapter_ta,'')) LIKE ?
        LIMIT ?
    """
    pattern = "%" + "%".join(haystack_terms) + "%" if haystack_terms else "%"
    with get_connection() as connection:
        rows = connection.execute(sql, (pattern.lower(), limit)).fetchall()
        if rows:
            return [dict(row) for row in rows]

    # Topic terms that are not literal database text receive no unrelated fallback.
    return []
=======
"""Search engine for Thirukkural.

Provides a 3-Stage deterministic + semantic search pipeline:
- Stage 1: Exact Kural Number Extraction (1 to 1330) from queries like "kural 150", "150 kural", "150th kural", "150வது குறள்".
- Stage 2: Starting Words / Prefix Search (first 1-2 words) e.g. "starting kural from அகர முதல", "kural starting with கற்க கசடற", "அகர முதல என தொடங்கும் குறள்".
- Stage 3: Topic & Keyword Search across keywords, chapter_tamil, meaning_ta, and explanation_en in SQLite.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from app.database import (
    get_kural_by_number,
    search_kurals_fts,
    TOPICS_CATALOG,
    get_db_connection,
    _map_row_to_kural_dict,
)
from app.models import Kural, SearchResultItem, SearchResponse


STOP_WORDS = {
    "what", "is", "the", "a", "an", "does", "tell", "me", "about", "us", "in",
    "on", "of", "for", "to", "and", "or", "say", "teach", "how", "why", "who",
    "can", "you", "give", "show", "meaning", "explain", "valluvar", "thiruvalluvar",
    "kural", "thirukkural", "enna", "sollu", "solla", "paththi", "patri", "please"
}


def extract_kural_number(query: str) -> Optional[int]:
    """Extract a Kural number if explicitly requested in text.
    Handles '150', 'kural 150', '#150', '150வது குறள்', '150-வது', '150th kural', '150 kural', 'tell the 20 kural'.
    """
    clean = query.strip()

    # 1. Match numbers with Tamil ordinals or suffixes: '20வது', '150வது', '150-வது', '150 ஆவது', '20-ஆம்'
    m_tamil = re.search(r"(?:^|[^\d])([1-9]\d{0,3})\s*[-_]?(?:வது|ஆவது|ஆம்)", clean)
    if m_tamil:
        val = int(m_tamil.group(1))
        if 1 <= val <= 1330:
            return val

    # 2. Match numbers with English ordinals: '150th', '1st', '2nd', '3rd', '20th'
    m_eng = re.search(r"(?:^|[^\d])([1-9]\d{0,3})\s*(?:st|nd|rd|th)\b", clean, re.IGNORECASE)
    if m_eng:
        val = int(m_eng.group(1))
        if 1 <= val <= 1330:
            return val

    # 3. Match 'kural 20', '20 kural', 'the 20 kural', 'no. 20', '#20'
    m_prefix = re.search(r"(?:kural|குறள்|no\.?|number|#)\s*([1-9]\d{0,3})\b", clean, re.IGNORECASE)
    if m_prefix:
        val = int(m_prefix.group(1))
        if 1 <= val <= 1330:
            return val

    m_suffix = re.search(r"(?:^|[^\d])([1-9]\d{0,3})\s*(?:kural|குறள்)", clean, re.IGNORECASE)
    if m_suffix:
        val = int(m_suffix.group(1))
        if 1 <= val <= 1330:
            return val

    # 4. Pure single number query e.g. "150", "20"
    m_pure = re.match(r"^\s*([1-9]\d{0,3})\s*$", clean)
    if m_pure:
        val = int(m_pure.group(1))
        if 1 <= val <= 1330:
            return val

    # 5. Queries with action verbs followed by a number: "tell 150", "show 20"
    m_any = re.search(r"(?:tell|give|show|what|explain|பார்க்க|சொல்லு|படிக்க)\s+(?:me\s+)?(?:the\s+)?([1-9]\d{0,3})\b", clean, re.IGNORECASE)
    if m_any:
        val = int(m_any.group(1))
        if 1 <= val <= 1330:
            return val

    return None


def extract_starting_word(query: str) -> Optional[str]:
    """Detect queries asking for Kurals starting with words or a phrase.
    Supports 1 or 2 words (e.g. 'அகர முதல', 'கற்க கசடற').
    """
    clean = query.strip()

    # 1. Direct Tamil word extraction if trigger phrases are present
    trigger_words = [
        "starting", "starts", "start", "from", "begin", "begins", "beginning",
        "before", "words", "word", "first", "தொடங்கும்", "தொடக்கம்", "என்ற"
    ]
    has_trigger = any(tw in clean.lower() for tw in trigger_words)
    tamil_words_match = re.search(r"[\u0B80-\u0BFF]+(?:\s+[\u0B80-\u0BFF]+)?", clean)

    if has_trigger and tamil_words_match:
        target = tamil_words_match.group(0).strip()
        # Exclude pure grammar words if single word
        if target not in ["தொடங்கும்", "குறள்", "என்று", "என", "எனும்"]:
            return target

    # 2. English / Transliteration patterns like:
    # "starting kural from agar mudhala", "kural starting with karka kasadara", "starts with agara"
    patterns_en = [
        r"(?:kural|verse)?\s*(?:starts?|starting|start\s*from|begin(?:s|ning)?(?:\s*with)?)\s*(?:with|from)?\s*(?:the\s*words?\s*)?[\"']?([^\s\"'\?,\.!]+(?:\s+[^\s\"'\?,\.!]+)?)[\"']?",
        r"(?:what\s+is\s+the\s+kural\s+starting\s+with)\s*[\"']?([^\s\"'\?,\.!]+(?:\s+[^\s\"'\?,\.!]+)?)[\"']?",
        r"(?:before\s+two\s+words?|first\s+two\s+words?)\s*[\"']?([^\s\"'\?,\.!]+(?:\s+[^\s\"'\?,\.!]+)?)[\"']?",
    ]
    for pat in patterns_en:
        m = re.search(pat, clean, re.IGNORECASE)
        if m:
            phrase = m.group(1).strip()
            tokens = [t for t in phrase.split() if t.lower() not in STOP_WORDS]
            if tokens:
                return " ".join(tokens[:2])

    # 3. Tamil phrases like:
    # "அகர முதல என தொடங்கும் குறள்", "கற்க கசடற என்று தொடங்கும் குறள்", "தொடங்கும் குறள் அகர முதல"
    patterns_ta = [
        r"[\"']?([^\s\"']+?(?:\s+[^\s\"']+?)?)[\"']?\s*(?:என்று|என|எனும்)?\s*தொடங்கும்\s*குறள்",
        r"தொடங்கும்\s*குறள்\s*[\"']?([^\s\"']+?(?:\s+[^\s\"']+?)?)[\"']?",
        r"[\"']?([^\s\"']+?(?:\s+[^\s\"']+?)?)[\"']?\s*என்ற\s*(?:வார்த்தையில்|சொல்லில்)\s*தொடங்கும்",
    ]
    for pat in patterns_ta:
        m = re.search(pat, clean)
        if m:
            phrase = m.group(1).strip()
            if phrase and len(phrase) >= 2:
                return phrase

    return None


def search_kurals_by_prefix(prefix: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Query SQLite for Kurals starting with the given words or prefix."""
    clean_prefix = re.sub(r"[\s\t\n]+", " ", prefix.strip())
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(kurals)")
        columns = {col[1] for col in cursor.fetchall()}

        # Match using normalized verse_tamil (replacing newlines with spaces) or line1 or transliteration
        sql = """
            SELECT * FROM kurals 
            WHERE REPLACE(verse_tamil, char(10), ' ') LIKE ? || '%'
               OR trim(line1) LIKE ? || '%'
               OR trim(transliteration) LIKE ? || '%'
               OR REPLACE(verse_tamil, char(10), ' ') LIKE '%' || ? || '%'
            ORDER BY 
               CASE 
                 WHEN REPLACE(verse_tamil, char(10), ' ') LIKE ? || '%' THEN 1
                 WHEN trim(line1) LIKE ? || '%' THEN 2
                 ELSE 3
               END,
               number ASC
            LIMIT ?
        """
        cursor.execute(sql, (clean_prefix, clean_prefix, clean_prefix, clean_prefix, clean_prefix, clean_prefix, limit))
        rows = cursor.fetchall()
        return [_map_row_to_kural_dict(r, columns) for r in rows]


def calculate_relevance(kural: Dict[str, Any], raw_terms: List[str], full_query: str) -> Tuple[float, str]:
    """Calculate relevance score (0 - 100) and identify the primary matched field."""
    score = 0.0
    matched_field = "general"

    filtered = [t for t in raw_terms if t not in STOP_WORDS]
    query_terms = filtered if filtered else raw_terms

    line1 = kural.get("line1", "").lower()
    line2 = kural.get("line2", "").lower()
    couplet = f"{line1} {line2}"
    trans = kural.get("translation", "").lower()
    ch_tam = kural.get("chapter_tamil", "").lower()
    ch_eng = kural.get("chapter_english", "").lower()
    exp_tam = (kural.get("explanation_tam") or kural.get("meaning_ta") or "").lower()
    exp_eng = (kural.get("explanation_eng") or "").lower()
    keywords = (kural.get("keywords") or "").lower()
    translit = (kural.get("transliteration") or "").lower()

    clean_full = full_query.lower().strip()

    # 1. Exact phrase match in couplet or translation
    if clean_full and clean_full in couplet:
        return 96.0, "verse_tamil"
    if clean_full and clean_full in trans:
        return 92.0, "translation_english"
    if clean_full and (clean_full in ch_tam or clean_full in ch_eng):
        return 88.0, "chapter_title"
    if clean_full and clean_full in keywords:
        return 84.0, "keywords"

    # 2. Term-by-term scoring
    term_count = len(query_terms)
    if term_count == 0:
        return 0.0, "none"

    tam_matches = sum(1 for t in query_terms if t in couplet or t in translit)
    trans_matches = sum(1 for t in query_terms if t in trans)
    chap_matches = sum(1 for t in query_terms if t in ch_tam or t in ch_eng)
    kw_matches = sum(1 for t in query_terms if t in keywords)
    exp_matches = sum(1 for t in query_terms if t in exp_tam or t in exp_eng)

    if tam_matches > 0:
        match_ratio = tam_matches / term_count
        score = max(score, 72.0 + (match_ratio * 20.0))
        matched_field = "verse_tamil"

    if trans_matches > 0:
        match_ratio = trans_matches / term_count
        calc_score = 68.0 + (match_ratio * 20.0)
        if calc_score > score:
            score = calc_score
            matched_field = "translation_english"

    if kw_matches > 0:
        match_ratio = kw_matches / term_count
        calc_score = 65.0 + (match_ratio * 20.0)
        if calc_score > score:
            score = calc_score
            matched_field = "keywords"

    if chap_matches > 0:
        match_ratio = chap_matches / term_count
        calc_score = 62.0 + (match_ratio * 20.0)
        if calc_score > score:
            score = calc_score
            matched_field = "chapter_title"

    if exp_matches > 0:
        match_ratio = exp_matches / term_count
        calc_score = 48.0 + (match_ratio * 20.0)
        if calc_score > score:
            score = calc_score
            matched_field = "commentary"

    return round(score, 2), matched_field


def search_kurals(
    query: str,
    topic: Optional[str] = None,
    section: Optional[str] = None,
    chapter_number: Optional[int] = None,
    limit: int = 20,
    offset: int = 0
) -> SearchResponse:
    """Perform smart 3-stage search over Kurals."""
    query_clean = query.strip()
    results: List[SearchResultItem] = []

    # STAGE 1: Check for explicit Kural number query
    kural_no = extract_kural_number(query_clean)
    if kural_no is not None and not topic:
        k = get_kural_by_number(kural_no)
        if k:
            results.append(
                SearchResultItem(
                    kural=Kural(**k),
                    score=100.0,
                    matched_field="kural_number"
                )
            )
            return SearchResponse(query=query, total_matches=1, results=results)

    # STAGE 2: Starting-Word / Prefix Lookup
    start_word = extract_starting_word(query_clean)
    if start_word:
        prefix_matches = search_kurals_by_prefix(start_word, limit=limit)
        if prefix_matches:
            for k_dict in prefix_matches:
                results.append(
                    SearchResultItem(
                        kural=Kural(**k_dict),
                        score=98.0,
                        matched_field="prefix_match"
                    )
                )
            return SearchResponse(query=query, total_matches=len(results), results=results)

    # STAGE 3: Topic & Keyword Multi-field Search
    topic_matched_kurals: Dict[int, float] = {}
    if topic:
        target_topic = next((t for t in TOPICS_CATALOG if t["id"] == topic), None)
        if target_topic:
            for num in target_topic["sample_kural_numbers"]:
                topic_matched_kurals[num] = 78.0

    query_lower = query_clean.lower()
    for t in TOPICS_CATALOG:
        for kw in t.get("keywords", []):
            if kw in query_lower or query_lower in kw:
                for num in t["sample_kural_numbers"]:
                    topic_matched_kurals[num] = max(topic_matched_kurals.get(num, 0.0), 68.0)

    query_terms = [t for t in re.split(r"[\s,\.\?!;]+", query_clean.lower()) if len(t) > 1]

    candidates: List[Dict[str, Any]] = []
    if query_clean:
        fts_candidates, _ = search_kurals_fts(query_clean, limit=100, offset=0)
        candidates.extend(fts_candidates)

    fetched_nums = {c["number"] for c in candidates}
    for t_num in topic_matched_kurals:
        if t_num not in fetched_nums:
            k = get_kural_by_number(t_num)
            if k:
                candidates.append(k)

    # Fallback to direct DB query across keywords, chapter, meaning_ta, explanation_en
    if not candidates and query_clean:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA table_info(kurals)")
            columns = {col[1] for col in cursor.fetchall()}

            sql = """
                SELECT * FROM kurals 
                WHERE keywords LIKE ? 
                   OR chapter_tamil LIKE ? 
                   OR meaning_ta LIKE ? 
                   OR explanation_en LIKE ?
                ORDER BY number ASC LIMIT 50
            """
            pat = f"%{query_clean}%"
            cursor.execute(sql, (pat, pat, pat, pat))
            rows = cursor.fetchall()
            candidates = [_map_row_to_kural_dict(r, columns) for r in rows]

    scored_items: List[Tuple[float, str, Dict[str, Any]]] = []
    seen_numbers = set()

    for k_dict in candidates:
        num = k_dict["number"]
        if num in seen_numbers:
            continue
        seen_numbers.add(num)

        if section and (section.lower() not in k_dict.get("section_tamil", "").lower() and section.lower() not in k_dict.get("section_english", "").lower()):
            continue
        if chapter_number and k_dict.get("chapter_number") != chapter_number:
            continue

        score, field = calculate_relevance(k_dict, query_terms, query_clean)

        if num in topic_matched_kurals:
            if score < topic_matched_kurals[num]:
                score = topic_matched_kurals[num]
                field = "curated_topic"
            else:
                score += 10.0

        if score > 0 or not query_clean:
            scored_items.append((score, field, k_dict))

    scored_items.sort(key=lambda x: (-x[0], x[2]["number"]))

    total_matches = len(scored_items)
    paginated = scored_items[offset : offset + limit]

    for score, field, k_dict in paginated:
        results.append(
            SearchResultItem(
                kural=Kural(**k_dict),
                score=score,
                matched_field=field
            )
        )

    return SearchResponse(
        query=query,
        total_matches=total_matches,
        results=results
    )
>>>>>>> 071a39a990d8d851a677928900ec91f75fab24b3
