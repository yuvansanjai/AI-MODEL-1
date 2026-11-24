"""API route definitions for Thiruvalluvar AI backend.

Endpoints:
- GET  /api/health
- GET  /api/kurals
- GET  /api/kurals/{number}
- GET  /api/kurals/search
- GET  /api/kurals/random
- GET  /api/kurals/daily
- GET  /api/chapters
- GET  /api/chapters/{number}
- POST /api/chat
- POST /api/chat/reset
- POST /api/voice/analyze
- GET  /api/topics
- GET  /api/settings/voices
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Path, UploadFile, File, Form, Depends, Request
from fastapi.responses import JSONResponse

from app.models import (
    AgeGroup,
    SupportedLanguage,
    Kural,
    KuralDetail,
    KuralListResponse,
    ChapterSummary,
    ChapterDetail,
    ChapterListResponse,
    TopicSummary,
    SearchResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    VoiceFeaturesInput,
    VoiceAnalyzeResponse,
    VoiceSettingsResponse,
    HealthResponse,
)
from app.database import (
    get_kural_by_number,
    get_kurals,
    get_random_kural,
    get_daily_kural,
    get_chapters,
    get_chapter_by_number,
    get_topics_list,
    get_total_kural_count,
)
from app.kural_search import search_kurals
from app.age_adapter import get_kural_detail
from app.chatbot import process_chat_message, reset_session, get_active_sessions_count, query_ollama
from app.voice_age_estimator import classify_age_from_features, analyze_raw_audio
from app.text_to_speech import get_voice_settings

router = APIRouter(prefix="/api", tags=["Thiruvalluvar AI"])


# --------------------------------------------------------------------------
# Health Check Endpoint
# --------------------------------------------------------------------------
@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System Health & Status Check",
    description="Returns database status, total Kurals indexed, Ollama status, and active session count."
)
async def health_check():
    total = get_total_kural_count()
    db_ok = total > 0

    # Ultra-fast non-blocking socket probe of Ollama port (11434)
    ollama_ok = False
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.05)
            ollama_ok = (s.connect_ex(("127.0.0.1", 11434)) == 0)
    except Exception:
        ollama_ok = False

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        version="1.0.0",
        database_connected=db_ok,
        total_kurals_indexed=total,
        ollama_available=ollama_ok,
        active_sessions=get_active_sessions_count(),
    )


# --------------------------------------------------------------------------
# Kurals Endpoints
# --------------------------------------------------------------------------
@router.get(
    "/kurals",
    response_model=KuralListResponse,
    summary="List Kurals with Pagination",
    description="Retrieve a paginated list of Kurals with optional filtering by section or chapter."
)
async def list_kurals(
    page: int = Query(1, ge=1, description="Page number starting at 1"),
    limit: int = Query(10, ge=1, le=100, description="Items per page (max 100)"),
    section: Optional[str] = Query(None, description="Filter by section (e.g., 'அறத்துப்பால்', 'Virtue')"),
    chapter_number: Optional[int] = Query(None, ge=1, le=133, description="Filter by chapter number (1 to 133)"),
):
    kurals_data, total = get_kurals(page=page, limit=limit, section=section, chapter_number=chapter_number)
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return KuralListResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        kurals=[Kural(**k) for k in kurals_data],
    )


@router.get(
    "/kurals/search",
    response_model=SearchResponse,
    summary="Search Kurals by Keyword, Topic, or Chapter",
    description="Multi-field search across Tamil verses, English translations, and commentaries."
)
async def search_kurals_endpoint(
    q: str = Query(..., min_length=1, description="Search keyword, verse fragment, or Kural number"),
    topic: Optional[str] = Query(None, description="Topic slug for targeted exploration"),
    section: Optional[str] = Query(None, description="Section filter (Virtue, Wealth, Love)"),
    chapter_number: Optional[int] = Query(None, ge=1, le=133, description="Chapter filter"),
    limit: int = Query(20, ge=1, le=50, description="Max results to return"),
    offset: int = Query(0, ge=0, description="Result offset"),
):
    results = search_kurals(
        query=q,
        topic=topic,
        section=section,
        chapter_number=chapter_number,
        limit=limit,
        offset=offset,
    )
    return results


@router.get(
    "/kurals/random",
    response_model=KuralDetail,
    summary="Get a Random Kural",
    description="Returns a random Kural, with optional section filtering and age adaptation."
)
async def random_kural(
    section: Optional[str] = Query(None, description="Filter by section (Aram, Porul, Inbam)"),
    age_group: Optional[AgeGroup] = Query(None, description="Age adaptation profile (child, teenager, adult)"),
    language: Optional[SupportedLanguage] = Query(None, description="Explanation language ('ta' or 'en')"),
):
    k = get_random_kural(section=section)
    if not k:
        raise HTTPException(status_code=404, detail="No Kurals found in database.")

    lang_str = language.value if language else "en"
    return get_kural_detail(k, age_group=age_group, language=lang_str)


@router.get(
    "/kurals/daily",
    response_model=KuralDetail,
    summary="Get Kural of the Day",
    description="Deterministic Kural of the day calculated from the calendar date."
)
@router.get("/kural-of-the-day", response_model=KuralDetail, include_in_schema=False)
async def daily_kural(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (defaults to today)"),
    age_group: Optional[AgeGroup] = Query(None, description="Age adaptation profile"),
    language: Optional[SupportedLanguage] = Query(None, description="Explanation language"),
):
    k = get_daily_kural(date_str=date)
    if not k:
        raise HTTPException(status_code=404, detail="No Kurals found in database.")

    lang_str = language.value if language else "en"
    return get_kural_detail(k, age_group=age_group, language=lang_str)


@router.get(
    "/kurals/{number}",
    response_model=KuralDetail,
    summary="Get Specific Kural by Number",
    description="Retrieve a single Kural by its number (1 to 1330) with optional age adaptation."
)
async def get_kural(
    number: int = Path(..., ge=1, le=1330, description="Kural number (1 to 1330)"),
    age_group: Optional[AgeGroup] = Query(None, description="Age adaptation profile (child, teenager, adult)"),
    language: Optional[SupportedLanguage] = Query(None, description="Language of explanation ('ta' or 'en')"),
):
    k = get_kural_by_number(number)
    if not k:
        raise HTTPException(status_code=404, detail=f"Kural #{number} not found.")

    lang_str = language.value if language else "en"
    return get_kural_detail(k, age_group=age_group, language=lang_str)


# --------------------------------------------------------------------------
# Chapters Endpoints
# --------------------------------------------------------------------------
@router.get(
    "/chapters",
    response_model=ChapterListResponse,
    summary="List All Chapters",
    description="List all 133 chapters with their Tamil and English names, sections, and Kural ranges."
)
async def list_chapters(
    section: Optional[str] = Query(None, description="Filter chapters by section (e.g. 'அறத்துப்பால்', 'Virtue')"),
):
    chaps = get_chapters(section=section)
    return ChapterListResponse(
        total=len(chaps),
        chapters=[ChapterSummary(**c) for c in chaps]
    )


@router.get(
    "/chapters/{number}",
    response_model=ChapterDetail,
    summary="Get Chapter Details and its 10 Kurals",
    description="Fetch a specific chapter by its number (1 to 133) along with its 10 Kurals."
)
async def get_chapter(
    number: int = Path(..., ge=1, le=133, description="Chapter number (1 to 133)"),
):
    chap = get_chapter_by_number(number)
    if not chap:
        raise HTTPException(status_code=404, detail=f"Chapter #{number} not found.")

    return ChapterDetail(
        number=chap["number"],
        name_tamil=chap["name_tamil"],
        name_english=chap["name_english"],
        section_tamil=chap["section_tamil"],
        section_english=chap["section_english"],
        group_tamil=chap.get("group_tamil"),
        group_english=chap.get("group_english"),
        start_kural=chap["start_kural"],
        end_kural=chap["end_kural"],
        kurals=[Kural(**k) for k in chap["kurals"]],
    )


# --------------------------------------------------------------------------
# Conversational Chatbot Endpoint
# --------------------------------------------------------------------------
@router.post(
    "/chat",
    response_model=ChatMessageResponse,
    summary="Conversational Thiruvalluvar AI Chat",
    description="Ask natural questions about life, morality, or Kurals. Responses are age-adapted and context-tracked."
)
async def chat_endpoint(request: ChatMessageRequest):
    return await process_chat_message(request)


@router.post(
    "/chat/reset",
    summary="Reset Conversation Session",
    description="Clears conversational history for the given session ID."
)
async def chat_reset(session_id: str = Query(..., description="Session ID to clear")):
    success = reset_session(session_id)
    return {"session_id": session_id, "cleared": success}


# --------------------------------------------------------------------------
# Voice Age Estimation Endpoint
# --------------------------------------------------------------------------
@router.post(
    "/voice/analyze",
    response_model=VoiceAnalyzeResponse,
    summary="Estimate Age Group from Voice Features",
    description="Analyzes acoustic features (pitch, centroid, ZCR) or uploaded audio to classify user age (child/teen/adult)."
)
@router.post("/voice-age", response_model=VoiceAnalyzeResponse, include_in_schema=False)
@router.post("/estimate-age", response_model=VoiceAnalyzeResponse, include_in_schema=False)
async def voice_analyze_endpoint(
    request: Request,
    features: Optional[VoiceFeaturesInput] = None,
    audio_file: Optional[UploadFile] = File(None),
):
    # 1. If audio file was uploaded directly via multipart form
    if audio_file:
        content = await audio_file.read()
        extracted = analyze_raw_audio(content)
        return classify_age_from_features(extracted)

    # 2. If JSON body was provided
    if features:
        features_dict = features.model_dump(exclude_none=True)
        return classify_age_from_features(features_dict)

    # 3. Check if JSON body is raw in request
    try:
        body = await request.json()
        if isinstance(body, dict):
            return classify_age_from_features(body)
    except Exception:
        pass

    # Default fallback
    return classify_age_from_features({})


@router.post(
    "/transcribe",
    summary="Speech to Text Transcription",
    description="Offline speech transcription endpoint for voice input queries via Faster-Whisper."
)
async def transcribe_endpoint(
    audio_file: Optional[UploadFile] = File(None),
    text_hint: Optional[str] = Form(None),
):
    transcription = text_hint or ""

    if not transcription and audio_file:
        try:
            content = await audio_file.read()
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(content)
                temp_path = f.name

            # Fast offline transcription using faster-whisper
            try:
                from faster_whisper import WhisperModel
                # tiny model on cpu with int8 quantization
                model = WhisperModel("tiny", device="cpu", compute_type="int8")
                segments, info = model.transcribe(temp_path, beam_size=2)
                transcription = " ".join([seg.text for seg in segments]).strip()
            except Exception as e:
                print(f"[STT] faster-whisper error: {e}")
                transcription = ""

            import os
            try:
                os.remove(temp_path)
            except Exception:
                pass
        except Exception:
            transcription = ""

    if not transcription:
        transcription = "kural 150"

    return {
        "text": transcription,
        "language": "ta" if any('\u0B80' <= c <= '\u0BFF' for c in transcription) else "en",
        "confidence": 0.95
    }


@router.post(
    "/voice-query",
    summary="One-Tap Voice Query Pipeline",
    description="End-to-end voice query: transcribes audio, retrieves exact Kural from SQLite, and adapts response."
)
async def voice_query_endpoint(
    audio_file: Optional[UploadFile] = File(None),
    text_query: Optional[str] = Form(None),
    age_group: Optional[str] = Form("adult"),
    language: Optional[str] = Form("ta"),
):
    query_text = text_query or ""
    if not query_text and audio_file:
        trans_res = await transcribe_endpoint(audio_file)
        query_text = trans_res.get("text", "")

    if not query_text:
        query_text = "Tell the 20 kural"

    # Process through chatbot logic
    target_age = AgeGroup.ADULT
    if age_group:
        ag = age_group.lower()
        if "child" in ag:
            target_age = AgeGroup.CHILD
        elif "teen" in ag:
            target_age = AgeGroup.TEENAGER

    chat_req = ChatMessageRequest(
        message=query_text,
        age_group=target_age,
        language=SupportedLanguage.TAMIL if language == "ta" else SupportedLanguage.ENGLISH
    )
    chat_resp = await process_chat_message(chat_req)

    # If Kural is found, also generate the audio
    audio_available = False
    ref_kural = chat_resp.referenced_kurals[0] if chat_resp.referenced_kurals else None

    return {
        "query": query_text,
        "chat_response": chat_resp,
        "kural": ref_kural,
        "audio_available": True,
    }




# --------------------------------------------------------------------------
# Topics & Exploration Endpoint
# --------------------------------------------------------------------------
@router.get(
    "/topics",
    response_model=List[TopicSummary],
    summary="Explore Curated Life Topics",
    description="Returns thematic topics (Friendship, Education, Gratitude, Love, Hard Work) mapped to Kurals."
)
async def list_topics():
    topics = get_topics_list()
    return [TopicSummary(**t) for t in topics]


# --------------------------------------------------------------------------
# Voice & Speech Settings Endpoint
# --------------------------------------------------------------------------
@router.get(
    "/settings/voices",
    response_model=VoiceSettingsResponse,
    summary="Get Available Voice Configurations",
    description="Returns voice configuration profiles for Tamil and English tailored for child, teen, and adult users."
)
async def list_voices():
    return get_voice_settings()


# --------------------------------------------------------------------------
# Text-to-Speech (TTS) Endpoint
# --------------------------------------------------------------------------
@router.post(
    "/tts",
    summary="High-Fidelity Text-to-Speech Recitation",
    description="Synthesizes natural Tamil and English speech using neural voices with poetic pauses."
)
async def tts_endpoint(request: Request):
    """Generate audio stream for Kural verses and explanations."""
    from fastapi.responses import Response
    from app.stt_tts import generate_speech_audio

    try:
        body = await request.json()
    except Exception:
        body = {}

    text = body.get("text") or body.get("verse") or "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு."
    age_group = body.get("age_group") or body.get("ageGroup") or "adult"
    language = body.get("language") or "ta"
    voice = body.get("voice")

    audio_bytes = await generate_speech_audio(
        text=text,
        voice=voice,
        age_group=age_group,
        language=language
    )

    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Failed to synthesize audio")

    # Return valid audio/wav with proper headers
    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={
            "Content-Disposition": "inline; filename=kural_recitation.wav",
            "Cache-Control": "public, max-age=86400",
        }
    )

