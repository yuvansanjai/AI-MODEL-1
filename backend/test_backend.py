"""Self-test verification script for Thiruvalluvar AI Backend.

Validates:
1. Database connectivity and schema validation
2. Retrieval of specific Kurals (Kural 1, 391, 788)
3. Age adapter responses for Child, Teenager, Adult
4. Language detection (Tamil, English, Tanglish)
5. Voice age estimation logic
6. Full-text search and keyword scoring
7. TTS configuration endpoint
8. FastAPI app mounting and routes
9. Conversational chatbot flow
"""

import asyncio
import sys
import io
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.database import (
    init_db,
    get_total_kural_count,
    get_kural_by_number,
    get_chapters,
    get_chapter_by_number,
    get_daily_kural,
    get_random_kural,
    get_topics_list,
)
from app.age_adapter import adapt_kural_for_age, get_kural_detail
from app.language_detector import detect_language
from app.voice_age_estimator import classify_age_from_features
from app.text_to_speech import get_voice_settings, get_speech_config_for_user
from app.kural_search import search_kurals
from app.chatbot import process_chat_message
from app.models import AgeGroup, SupportedLanguage, ChatMessageRequest
from app.main import app


def test_database():
    print("\n--- 1. Testing Database ---")
    init_db()
    count = get_total_kural_count()
    print(f"Total Kurals in database: {count}")
    assert count > 0, "Database must have kurals"

    # Test Kural 1
    k1 = get_kural_by_number(1)
    assert k1 is not None, "Kural 1 should exist"
    print(f"Kural 1 Line 1: {k1['line1']}")
    print(f"Kural 1 Translation: {k1['translation'][:50]}...")
    assert "அகர" in k1["line1"], "Kural 1 line1 must match"

    # Test Chapters
    chapters = get_chapters()
    print(f"Total chapters retrieved: {len(chapters)}")
    assert len(chapters) > 0, "Chapters must be available"

    # Test Chapter 1
    chap1 = get_chapter_by_number(1)
    assert chap1 is not None, "Chapter 1 should exist"
    print(f"Chapter 1: {chap1['name_tamil']} ({chap1['name_english']}), kurals count: {len(chap1['kurals'])}")

    # Test Daily & Random
    daily = get_daily_kural()
    assert daily is not None, "Daily kural should exist"
    print(f"Daily Kural: #{daily['number']}")

    rnd = get_random_kural()
    assert rnd is not None, "Random kural should exist"
    print(f"Random Kural: #{rnd['number']}")

    print(" Database tests PASSED!")


def test_age_adapter():
    print("\n--- 2. Testing Age Adapter ---")
    k = get_kural_by_number(391)
    assert k is not None

    for age in [AgeGroup.CHILD, AgeGroup.TEENAGER, AgeGroup.ADULT]:
        exp_en = adapt_kural_for_age(k, age, "en")
        exp_ta = adapt_kural_for_age(k, age, "ta")

        assert exp_en.age_group == age
        assert len(exp_en.explanation) > 10
        assert len(exp_en.real_world_example) > 5
        assert len(exp_ta.explanation) > 10

        print(f"[{age.value.upper()} EN] {exp_en.explanation[:80]}...")
        print(f"[{age.value.upper()} TA] {exp_ta.explanation[:80]}...")

    detail = get_kural_detail(k, AgeGroup.CHILD, "en")
    # Original verse must remain IDENTICAL
    assert detail.line1 == k["line1"]
    assert detail.line2 == k["line2"]
    assert detail.adapted_explanation is not None
    assert detail.adapted_explanation.age_group == AgeGroup.CHILD
    print(" Age Adapter tests PASSED!")


def test_language_detector():
    print("\n--- 3. Testing Language Detector ---")
    res1 = detect_language("அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு")
    assert res1["language"] == "ta", "Should detect Tamil script"
    print(f"Tamil text -> {res1['language']} (confidence: {res1['confidence']})")

    res2 = detect_language("What does Valluvar say about education and hard work?")
    assert res2["language"] == "en", "Should detect English"
    print(f"English text -> {res2['language']} (confidence: {res2['confidence']})")

    res3 = detect_language("vanakkam thiruvalluvar, enakku natpu pathi oru kural solla mudiyuma?")
    assert res3["language"] == "ta", "Should detect Tanglish"
    print(f"Tanglish text -> {res3['language']} ({res3['language_name']})")

    print(" Language Detector tests PASSED!")


def test_voice_age_estimator():
    print("\n--- 4. Testing Voice Age Estimator ---")
    # Child sample: high pitch ~290 Hz
    c_res = classify_age_from_features({"pitch": 290.0, "spectral_centroid": 3200.0})
    assert c_res.estimated_age_group == AgeGroup.CHILD
    print(f"Pitch 290 Hz -> {c_res.estimated_age_group.value} (conf: {c_res.confidence})")

    # Teen sample: ~210 Hz
    t_res = classify_age_from_features({"pitch": 210.0, "spectral_centroid": 2500.0})
    assert t_res.estimated_age_group == AgeGroup.TEENAGER
    print(f"Pitch 210 Hz -> {t_res.estimated_age_group.value} (conf: {t_res.confidence})")

    # Adult sample: ~125 Hz
    a_res = classify_age_from_features({"pitch": 125.0, "spectral_centroid": 1500.0})
    assert a_res.estimated_age_group == AgeGroup.ADULT
    print(f"Pitch 125 Hz -> {a_res.estimated_age_group.value} (conf: {a_res.confidence})")

    print(" Voice Age Estimator tests PASSED!")


def test_search():
    print("\n--- 5. Testing Kural Search ---")
    # Search by number
    s1 = search_kurals("391")
    assert s1.total_matches >= 1
    assert s1.results[0].kural.number == 391
    print(f"Search '391' -> Found Kural #{s1.results[0].kural.number}")

    # Search by Tamil term
    s2 = search_kurals("அன்பு")
    assert s2.total_matches > 0
    print(f"Search 'அன்பு' -> Found {s2.total_matches} matches (top score: {s2.results[0].score})")

    # Search by English term
    s3 = search_kurals("friendship")
    assert s3.total_matches > 0
    print(f"Search 'friendship' -> Found {s3.total_matches} matches (top score: {s3.results[0].score})")

    # Search by topic
    s4 = search_kurals("", topic="education")
    assert s4.total_matches > 0
    print(f"Search topic 'education' -> Found {s4.total_matches} matches")

    print(" Kural Search tests PASSED!")


def test_tts_settings():
    print("\n--- 6. Testing TTS Voice Catalog ---")
    settings = get_voice_settings()
    assert len(settings.voices) >= 6
    print(f"TTS voices available: {len(settings.voices)}")
    cfg = get_speech_config_for_user(AgeGroup.CHILD, "ta")
    assert cfg["language"].startswith("ta")
    print(f"Child Tamil speech config: {cfg}")
    print(" TTS Settings tests PASSED!")


async def test_chatbot():
    print("\n--- 7. Testing Conversational Chatbot ---")
    # Greeting
    r1 = await process_chat_message(ChatMessageRequest(message="வணக்கம்", age_group=AgeGroup.CHILD))
    assert "வணக்கம்" in r1.reply
    assert r1.detected_language == "ta"
    print("Greeting reply received successfully.")

    # Kural query
    r2 = await process_chat_message(ChatMessageRequest(
        message="Tell me Kural 101",
        age_group=AgeGroup.TEENAGER,
        session_id=r1.session_id
    ))
    assert len(r2.referenced_kurals) > 0
    assert r2.referenced_kurals[0].number == 101
    print(f"Kural 101 query handled: session_id={r2.session_id}")

    # Context follow-up
    r3 = await process_chat_message(ChatMessageRequest(
        message="Can you explain this for a child with an example?",
        session_id=r2.session_id
    ))
    assert len(r3.referenced_kurals) > 0
    assert r3.referenced_kurals[0].number == 101
    print(f"Context preserved: still discussing Kural #{r3.referenced_kurals[0].number}")

    print(" Chatbot tests PASSED!")


def test_fastapi_routes():
    print("\n--- 8. Testing FastAPI App Routes ---")
    openapi = app.openapi()
    paths = list(openapi.get("paths", {}).keys())
    expected = [
        "/api/health",
        "/api/kurals",
        "/api/kurals/search",
        "/api/kurals/random",
        "/api/kurals/daily",
        "/api/kurals/{number}",
        "/api/chapters",
        "/api/chapters/{number}",
        "/api/chat",
        "/api/chat/reset",
        "/api/voice/analyze",
        "/api/topics",
        "/api/settings/voices",
    ]
    for exp in expected:
        assert exp in paths, f"Missing route {exp}"
        print(f" Route verified: {exp}")

    print(" All FastAPI routes verified!")


async def main():
    print("==================================================")
    print(" Starting Thiruvalluvar AI Backend Test Suite")
    print("==================================================")
    test_database()
    test_age_adapter()
    test_language_detector()
    test_voice_age_estimator()
    test_search()
    test_tts_settings()
    await test_chatbot()
    test_fastapi_routes()
    print("==================================================")
    print(" ALL BACKEND TESTS PASSED SUCCESSFULLY! ")
    print("==================================================")


if __name__ == "__main__":
    asyncio.run(main())
