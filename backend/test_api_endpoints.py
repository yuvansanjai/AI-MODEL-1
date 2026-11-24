"""End-to-End API endpoint test suite using FastAPI TestClient."""

import sys
import io
from pathlib import Path

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_endpoints():
    print("\n--- Testing HTTP Endpoints with TestClient ---")

    # 1. Health
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    print("GET /api/health ->", health_data)
    assert health_data["database_connected"] is True
    assert health_data["total_kurals_indexed"] == 1330

    # 2. List Kurals
    r = client.get("/api/kurals?page=1&limit=5")
    assert r.status_code == 200
    kurals_data = r.json()
    assert kurals_data["total"] == 1330
    assert len(kurals_data["kurals"]) == 5
    print(f"GET /api/kurals?page=1&limit=5 -> Returned {len(kurals_data['kurals'])} of {kurals_data['total']} kurals")

    # 3. Specific Kural with Age Adaptation
    r = client.get("/api/kurals/1?age_group=child&language=ta")
    assert r.status_code == 200
    k1 = r.json()
    assert k1["number"] == 1
    assert k1["adapted_explanation"] is not None
    assert k1["adapted_explanation"]["age_group"] == "child"
    print("GET /api/kurals/1?age_group=child&language=ta -> Verified child Tamil adaptation")

    # 4. Search
    r = client.get("/api/kurals/search?q=friendship&limit=5")
    assert r.status_code == 200
    search_data = r.json()
    assert search_data["total_matches"] > 0
    print(f"GET /api/kurals/search?q=friendship -> Found {search_data['total_matches']} matches")

    # 5. Daily Kural
    r = client.get("/api/kurals/daily?age_group=adult&language=en")
    assert r.status_code == 200
    daily = r.json()
    print(f"GET /api/kurals/daily -> Kural #{daily['number']}: {daily['chapter_english']}")

    # 6. Random Kural
    r = client.get("/api/kurals/random")
    assert r.status_code == 200
    rnd = r.json()
    print(f"GET /api/kurals/random -> Kural #{rnd['number']}")

    # 7. List Chapters
    r = client.get("/api/chapters")
    assert r.status_code == 200
    chaps = r.json()
    assert chaps["total"] == 133
    print(f"GET /api/chapters -> {chaps['total']} chapters loaded")

    # 8. Chapter Detail
    r = client.get("/api/chapters/1")
    assert r.status_code == 200
    c1 = r.json()
    assert len(c1["kurals"]) == 10
    print(f"GET /api/chapters/1 -> Chapter '{c1['name_english']}' with {len(c1['kurals'])} Kurals")

    # 9. Voice Analysis
    r = client.post("/api/voice/analyze", json={"pitch": 295.0, "spectral_centroid": 3100.0})
    assert r.status_code == 200
    v_data = r.json()
    assert v_data["estimated_age_group"] == "child"
    print(f"POST /api/voice/analyze -> Classified as {v_data['estimated_age_group']} (confidence: {v_data['confidence']})")

    # 10. Topics
    r = client.get("/api/topics")
    assert r.status_code == 200
    topics = r.json()
    assert len(topics) >= 10
    print(f"GET /api/topics -> {len(topics)} topics retrieved")

    # 11. Voice Settings
    r = client.get("/api/settings/voices")
    assert r.status_code == 200
    voices = r.json()
    assert len(voices["voices"]) >= 6
    print(f"GET /api/settings/voices -> {len(voices['voices'])} voices configured")

    # 12. Conversational Chat
    r = client.post("/api/chat", json={
        "message": "What does Valluvar teach us about true friendship?",
        "age_group": "teenager",
        "language": "en"
    })
    assert r.status_code == 200
    chat_data = r.json()
    assert len(chat_data["reply"]) > 50
    assert len(chat_data["referenced_kurals"]) > 0
    print(f"POST /api/chat -> Reply length {len(chat_data['reply'])} chars, referenced Kural #{chat_data['referenced_kurals'][0]['number']}")

    print("\n ALL HTTP ENDPOINT TESTS PASSED WITH 200 OK! \n")


if __name__ == "__main__":
    test_endpoints()
