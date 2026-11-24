"""Language detection module for Tamil and English.

Uses Unicode codepoint analysis, script ratio metrics, and phonetic transliteration
keyword matching for accurate offline detection of Tamil, English, and Romanized Tamil (Tanglish).
"""

import re
from typing import Dict, Any

# Tamil Unicode code block range: U+0B80 to U+0BFF
TAMIL_UNICODE_START = 0x0B80
TAMIL_UNICODE_END = 0x0BFF

# Common Tanglish (Romanized Tamil) patterns and vocabulary
TANGLISH_KEYWORDS = {
    "vanakkam", "nanri", "kural", "thirukkural", "valluvar", "thiruvalluvar",
    "aram", "porul", "inbam", "natpu", "kalvi", "anbu", "solla", "sollu",
    "sollunga", "enna", "ethu", "eppadi", "ungal", "enakku", "puriyala",
    "vilakkam", "athigaram", "paal", "iyal", "porumai", "kadama", "thappu",
    "nallathu", "theethu", "arivu", "manithan", "ulagam", "tamil", "tamizh",
    "illaram", "thuravaram", "kaamam", "arasu", "kadavul", "valzthu"
}


def contains_tamil(text: str) -> bool:
    """Check if the text contains any Tamil script character."""
    if not text:
        return False
    return any(TAMIL_UNICODE_START <= ord(ch) <= TAMIL_UNICODE_END for ch in text)


def is_tamil(text: str, threshold: float = 0.25) -> bool:
    """Return True if the text is predominantly in Tamil script."""
    result = detect_language(text)
    return result["language"] == "ta"


def detect_language(text: str) -> Dict[str, Any]:
    """Detect whether input text is Tamil, English, or Romanized Tamil (Tanglish).

    Returns a dictionary with language code ('ta' or 'en'), language name,
    confidence score (0.0 to 1.0), and script details.
    """
    if not text or not text.strip():
        return {
            "language": "en",
            "language_name": "English",
            "confidence": 0.5,
            "script": "empty",
            "is_tamil": False,
            "tamil_ratio": 0.0,
            "english_ratio": 0.0,
        }

    tamil_count = 0
    english_count = 0
    total_alpha = 0

    for ch in text:
        code = ord(ch)
        if TAMIL_UNICODE_START <= code <= TAMIL_UNICODE_END:
            tamil_count += 1
            total_alpha += 1
        elif ch.isalpha() and code < 128:
            english_count += 1
            total_alpha += 1

    if total_alpha == 0:
        # Punctuation/numeric only
        return {
            "language": "en",
            "language_name": "English",
            "confidence": 0.5,
            "script": "symbolic",
            "is_tamil": False,
            "tamil_ratio": 0.0,
            "english_ratio": 0.0,
        }

    tamil_ratio = tamil_count / total_alpha
    english_ratio = english_count / total_alpha

    # 1. Native Tamil script dominates or is present in significant quantity
    if tamil_count > 0 and tamil_ratio >= 0.15:
        confidence = min(0.99, 0.6 + (tamil_ratio * 0.4))
        return {
            "language": "ta",
            "language_name": "Tamil",
            "confidence": round(confidence, 2),
            "script": "tamil",
            "is_tamil": True,
            "tamil_ratio": round(tamil_ratio, 3),
            "english_ratio": round(english_ratio, 3),
        }

    # 2. Check for Romanized Tamil (Tanglish)
    words = re.findall(r"\b[a-zA-Z]+\b", text.lower())
    if words:
        tanglish_matches = [w for w in words if w in TANGLISH_KEYWORDS]
        tanglish_ratio = len(tanglish_matches) / len(words)

        if tanglish_matches and (tanglish_ratio >= 0.25 or len(tanglish_matches) >= 2):
            return {
                "language": "ta",
                "language_name": "Tamil (Romanized/Tanglish)",
                "confidence": round(min(0.95, 0.5 + tanglish_ratio * 0.5), 2),
                "script": "tanglish",
                "is_tamil": True,
                "tamil_ratio": round(tamil_ratio, 3),
                "english_ratio": round(english_ratio, 3),
            }

    # 3. Default to English
    confidence = min(0.99, 0.5 + (english_ratio * 0.45))
    return {
        "language": "en",
        "language_name": "English",
        "confidence": round(confidence, 2),
        "script": "latin",
        "is_tamil": False,
        "tamil_ratio": round(tamil_ratio, 3),
        "english_ratio": round(english_ratio, 3),
    }
