"""Conversational chatbot engine for Thiruvalluvar AI.

Features:
- Smart 3-stage search pipeline (Number lookup, Prefix lookup, Topic/Keyword search).
- Dual-engine generation: Uses local Ollama LLM if available, strictly grounded on retrieved
  database verses, with instantaneous offline fallback to verified SQLite Tamil verses & commentaries.
- Zero fabrication guarantee: All Kural verses are directly loaded from authentic SQLite database.
"""

import os
import re
import time
import uuid
from typing import Dict, Any, List, Optional, Tuple
import httpx

from app.models import (
    AgeGroup,
    Kural,
    ChatMessageRequest,
    ChatMessageResponse,
)
from app.database import (
    get_kural_by_number,
    get_random_kural,
    get_daily_kural,
    TOPICS_CATALOG,
)
from app.kural_search import (
    search_kurals,
    extract_kural_number,
    extract_starting_word,
    search_kurals_by_prefix
)
from app.language_detector import detect_language
from app.age_adapter import adapt_kural_for_age

# In-memory session store: session_id -> session dict
_SESSIONS: Dict[str, Dict[str, Any]] = {}
SESSION_TTL_SECONDS = 7200  # 2 hours

# Ollama environment settings
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "8.0"))


def _clean_expired_sessions():
    """Remove sessions that have been idle longer than the TTL."""
    now = time.time()
    expired = [
        sid for sid, data in _SESSIONS.items()
        if now - data.get("last_activity", now) > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        _SESSIONS.pop(sid, None)


def get_or_create_session(session_id: Optional[str] = None, age_group: AgeGroup = AgeGroup.ADULT) -> Dict[str, Any]:
    """Retrieve an existing session or initialize a fresh one."""
    _clean_expired_sessions()

    if session_id and session_id in _SESSIONS:
        session = _SESSIONS[session_id]
        session["last_activity"] = time.time()
        return session

    new_id = session_id or str(uuid.uuid4())
    session = {
        "id": new_id,
        "created_at": time.time(),
        "last_activity": time.time(),
        "age_group": age_group,
        "language": "en",
        "last_kural_number": None,
        "last_topic": None,
        "history": [],
    }
    _SESSIONS[new_id] = session
    return session


def classify_intent(message: str) -> Tuple[str, Dict[str, Any]]:
    """Determine the intent of the user message and extract relevant parameters."""
    clean = message.strip().lower()
    words = set(re.findall(r"\b[\w\u0B80-\u0BFF]+\b", clean))

    # STAGE 1: Check for specific Kural number
    kural_num = extract_kural_number(clean)
    if kural_num is not None:
        return "SPECIFIC_KURAL", {"number": kural_num}

    # STAGE 2: Starting word / prefix trigger
    start_word = extract_starting_word(message)
    if start_word:
        return "PREFIX_SEARCH", {"prefix": start_word}

    # Greetings
    greeting_words = {"hello", "hi", "hey", "vanakkam", "வணக்கம்", "வாழ்க", "namaste"}
    if (words.intersection(greeting_words) and len(words) <= 3) or clean in [
        "who are you", "who are you?", "யார் நீங்கள்", "யாரு நீங்க", "good morning", "good evening"
    ]:
        return "GREETING", {}

    # Daily / Random triggers
    if any(w in words for w in ["daily", "today"]) or "இன்றைய" in clean or "நாள் குறள்" in clean:
        return "DAILY_KURAL", {}
    if "random" in words or "ஏதாவது" in clean or "ஒரு குறள்" in clean:
        return "RANDOM_KURAL", {}

    # Topic search detection
    for t in TOPICS_CATALOG:
        for kw in t.get("keywords", []):
            if kw in words or (len(kw) > 4 and kw in clean):
                return "TOPIC_QUERY", {"topic_id": t["id"], "topic_title": t["title_english"]}

    # Followup / Explanation triggers
    explanation_triggers = {
        "explain", "meaning", "example", "why", "detail", "child", "kid", "teen",
        "விளக்கம்", "பொருள்", "உதாரணம்", "எடுத்துக்காட்டு", "ஏன்", "குழந்தை", "சிறுவர்"
    }
    if words.intersection(explanation_triggers):
        return "EXPLANATION_FOLLOWUP", {}

    # Default to general search
    return "SEARCH_QUERY", {"query": message}


async def query_ollama(
    prompt: str,
    system_instruction: str,
    model: str = OLLAMA_MODEL,
    timeout: float = OLLAMA_TIMEOUT
) -> Optional[str]:
    """Query local Ollama instance with short timeout. Returns None if unavailable or times out."""
    try:
        url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "system": system_instruction,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "top_p": 0.9,
                "max_tokens": 400,
            }
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
    except Exception:
        return None
    return None


def format_deterministic_kural_response(
    kural_dict: Dict[str, Any],
    age_group: AgeGroup,
    language: str,
    custom_intro: Optional[str] = None
) -> Tuple[str, List[str]]:
    """Format an authentic, rich response centered on a specific Kural from verified SQLite."""
    adapted = adapt_kural_for_age(kural_dict, age_group, language)
    num = kural_dict["number"]
    line1 = kural_dict["line1"]
    line2 = kural_dict["line2"]
    chap_tam = kural_dict.get("chapter_tamil", "")
    chap_eng = kural_dict.get("chapter_english", "")
    trans = kural_dict.get("translation", "")
    mv_exp = kural_dict.get("meaning_ta") or kural_dict.get("explanation_tam") or ""

    is_tam = language.startswith("ta")

    if is_tam:
        intro = custom_intro or f"திருக்குறள் #{num} ({chap_tam}):"
        reply = (
            f"{intro}\n\n"
            f"📜 **குறள் {num}:**\n"
            f"> *{line1}*\n"
            f"> *{line2}*\n\n"
            f"💡 **விளக்கம் ({adapted.age_group.value}):**\n{adapted.explanation}\n\n"
            f"🌱 **நடைமுறை உதாரணம்:**\n{adapted.real_world_example}\n\n"
            f"✨ **வாழ்வியல் பாடம்:**\n{adapted.moral_takeaway}"
        )
        if mv_exp:
            reply += f"\n\n📖 **மு. வரதராசனார் உரை:**\n{mv_exp}"

        followups = [
            f"குறள் {num}-க்கான ஆங்கில விளக்கம் என்ன?",
            "நட்பு பற்றி வேறு ஒரு குறள் கூறுங்கள்",
            "இதை குழந்தைகளுக்கு எப்படி விளக்குவீர்கள்?",
        ]
    else:
        intro = custom_intro or f"Thirukkural #{num} from the chapter '{chap_eng}':"
        reply = (
            f"{intro}\n\n"
            f"📜 **Kural {num}:**\n"
            f"> *\"{line1}*  \n"
            f"> *{line2}\"*\n\n"
            f"📖 **Translation:**  \n"
            f"*{trans}*\n\n"
            f"💡 **Explanation ({adapted.age_group.value.title()}):**  \n"
            f"{adapted.explanation}\n\n"
            f"🌱 **Real-World Example:**  \n"
            f"{adapted.real_world_example}\n\n"
            f"✨ **Takeaway:**  \n"
            f"{adapted.moral_takeaway}"
        )
        followups = [
            f"Give me an example of Kural {num}",
            "What does Valluvar say about education?",
            "Explain this for a child",
        ]

    return reply, followups


async def process_chat_message(request: ChatMessageRequest) -> ChatMessageResponse:
    """Main conversational entry point."""
    user_msg = request.message.strip()

    # Language resolution
    if request.language:
        lang_code = request.language.value
    else:
        lang_info = detect_language(user_msg)
        lang_code = lang_info["language"]

    target_age = request.age_group or AgeGroup.ADULT

    # Session management
    session = get_or_create_session(request.session_id, target_age)
    session_id = session["id"]
    session["age_group"] = target_age
    session["language"] = lang_code

    intent, params = classify_intent(user_msg)
    referenced_kurals: List[Kural] = []
    reply_text = ""
    followups: List[str] = []
    engine_used = "deterministic"

    # 1. Greeting
    if intent == "GREETING":
        if lang_code.startswith("ta"):
            reply_text = (
                "வணக்கம்! நான் உங்கள் திருவள்ளுவர் AI.\n\n"
                "நான் 1330 திருக்குறள்களின் காலத்தால் அழியாத வாழ்வியல் நெறிகளை உங்கள் வயதுக்கு ஏற்ப எளிய முறையில் விளக்கக் காத்திருக்கிறேன்.\n\n"
                "நீங்கள் ஏதேனும் குறள் எண்ணையோ (எ.கா: 'குறள் 150', '150வது குறள்'), தொடங்கும் சொல்லையோ (எ.கா: 'அகர என தொடங்கும் குறள்'), அல்லது கல்வி, நட்பு, அன்பு போன்ற தலைப்புகளையோ கேட்கலாம்!"
            )
            followups = ["குறள் 1 சொல்லுங்கள்", "அகர என தொடங்கும் குறள்", "கல்வி பற்றி குறள்"]
        else:
            reply_text = (
                "Vanakkam! I am Thiruvalluvar AI, your companion to the wisdom of the 1,330 Thirukkurals.\n\n"
                "I adapt each timeless couplet for your age—whether you want simple moral stories for children, "
                "relatable perspectives for youth, or profound philosophical discourse for adults.\n\n"
                "You can ask me for a specific Kural number (e.g., 'What is the 150 kural?'), a starting word (e.g., 'kural starting with கற்க'), or explore topics like friendship or education."
            )
            followups = ["What is the 150 kural?", "kural starting with அகர", "Show me Kural of the Day"]

    # 2. STAGE 1: Exact Kural Number
    elif intent == "SPECIFIC_KURAL":
        num = params["number"]
        k = get_kural_by_number(num)
        if k:
            session["last_kural_number"] = num
            referenced_kurals.append(Kural(**k))
            reply_text, followups = format_deterministic_kural_response(k, target_age, lang_code)
        else:
            if lang_code.startswith("ta"):
                reply_text = f"மன்னிக்கவும், குறள் எண் {num} கண்டறியப்படவில்லை. தயவுசெய்து 1 முதல் 1330 வரை ஒரு எண்ணைக் குறிப்பிடவும்."
            else:
                reply_text = f"I could not locate Kural #{num}. Please specify a valid number between 1 and 1330."

    # 3. STAGE 2: Starting Word / Prefix Lookup
    elif intent == "PREFIX_SEARCH":
        prefix = params["prefix"]
        prefix_matches = search_kurals_by_prefix(prefix, limit=3)
        if prefix_matches:
            top_k = prefix_matches[0]
            session["last_kural_number"] = top_k["number"]
            for m in prefix_matches:
                referenced_kurals.append(Kural(**m))

            intro = (
                f"'{prefix}' என்ற சொல்லில் தொடங்கும் திருக்குறள் (குறள் #{top_k['number']}):"
                if lang_code.startswith("ta")
                else f"Here is the Kural starting with '{prefix}' (Kural #{top_k['number']}):"
            )
            reply_text, followups = format_deterministic_kural_response(top_k, target_age, lang_code, intro)

            if len(prefix_matches) > 1:
                other_lines = "\n".join([f"- குறள் #{m['number']}: {m['line1']}" for m in prefix_matches[1:]])
                if lang_code.startswith("ta"):
                    reply_text += f"\n\n🔗 இதே சொல்லில் தொடங்கும் பிற குறள்கள்:\n{other_lines}"
                else:
                    reply_text += f"\n\n🔗 Other Kurals starting with '{prefix}':\n{other_lines}"
        else:
            if lang_code.startswith("ta"):
                reply_text = f"மன்னிக்கவும், '{prefix}' என்ற சொல்லில் தொடங்கும் திருக்குறள் எதுவும் கண்டறியப்படவில்லை. சரியான தொடக்கச் சொல்லைக் குறிப்பிடவும்."
            else:
                reply_text = f"I could not find any Kural starting with the word '{prefix}'. Please check the spelling or try another word like 'அகர' or 'கற்க'."

    # 4. Daily Kural
    elif intent == "DAILY_KURAL":
        k = get_daily_kural()
        if k:
            session["last_kural_number"] = k["number"]
            referenced_kurals.append(Kural(**k))
            intro = "இன்றைய திருக்குறள் (Kural of the Day):" if lang_code.startswith("ta") else "Here is today's Kural of the Day:"
            reply_text, followups = format_deterministic_kural_response(k, target_age, lang_code, intro)

    # 5. Random Kural
    elif intent == "RANDOM_KURAL":
        k = get_random_kural()
        if k:
            session["last_kural_number"] = k["number"]
            referenced_kurals.append(Kural(**k))
            intro = "இதோ உங்களுக்கான ஒரு திருக்குறள்:" if lang_code.startswith("ta") else "Here is an inspiring Kural for you:"
            reply_text, followups = format_deterministic_kural_response(k, target_age, lang_code, intro)

    # 6. Followup / Explanation on last Kural
    elif intent == "EXPLANATION_FOLLOWUP" and session.get("last_kural_number"):
        last_num = session["last_kural_number"]
        k = get_kural_by_number(last_num)
        if k:
            if "child" in user_msg.lower() or "குழந்தை" in user_msg or "சிறுவர்" in user_msg:
                target_age = AgeGroup.CHILD
            elif "teen" in user_msg.lower() or "இளைஞர்" in user_msg:
                target_age = AgeGroup.TEENAGER
            elif "adult" in user_msg.lower() or "பெரியோர்" in user_msg:
                target_age = AgeGroup.ADULT

            session["age_group"] = target_age
            referenced_kurals.append(Kural(**k))
            intro = (
                f"குறள் {last_num}-க்கான விரிவான விளக்கம் ({target_age.value}):"
                if lang_code.startswith("ta")
                else f"Deeper perspective on Kural {last_num} ({target_age.value.title()}):"
            )
            reply_text, followups = format_deterministic_kural_response(k, target_age, lang_code, intro)

    # 7. STAGE 3: Topic & Keyword Search
    else:
        topic_id = params.get("topic_id")
        search_res = search_kurals(user_msg, topic=topic_id, limit=3)
        if search_res.results:
            top_result = search_res.results[0]
            k_obj = top_result.kural
            k_dict = k_obj.model_dump()
            session["last_kural_number"] = k_obj.number
            referenced_kurals.append(k_obj)

            intro = (
                f"உங்கள் வினாவிற்குரிய பொருத்தமான திருக்குறள் (பொருத்தம்: {top_result.score}%):"
                if lang_code.startswith("ta")
                else f"The most fitting Kural for your inquiry (relevance: {top_result.score}%):"
            )
            reply_text, followups = format_deterministic_kural_response(k_dict, target_age, lang_code, intro)

            if len(search_res.results) > 1:
                other_nums = [str(r.kural.number) for r in search_res.results[1:3]]
                if lang_code.startswith("ta"):
                    reply_text += f"\n\n🔗 மேலும் தொடர்புடைய குறள்கள்: {', '.join(other_nums)}"
                else:
                    reply_text += f"\n\n🔗 Other related Kurals: #{', #'.join(other_nums)}"
        else:
            if lang_code.startswith("ta"):
                reply_text = "மன்னிக்கவும், உங்கள் கேள்விக்குரிய குறளைக் கண்டறிய முடியவில்லை. தயவுசெய்து வேறு தலைப்பை அல்லது சொற்களைப் பயன்படுத்தி தேடவும்."
                followups = ["கல்வி பற்றி குறள்", "நட்பு பற்றி குறள்", "குறள் 1 சொல்லுங்கள்"]
            else:
                reply_text = "I couldn't find a direct Kural match for your query. Try asking by topic (e.g., 'friendship', 'education') or by Kural number (e.g., 'What is the 150 kural?')."
                followups = ["What is the 150 kural?", "Kurals on friendship", "Kural of the day"]

    # 8. Ollama enhancement if available
    if referenced_kurals:
        ref_k = referenced_kurals[0]
        sys_prompt = (
            "You are Thiruvalluvar AI, a venerable scholar of Thirukkural. "
            "You MUST ground your response strictly on this authentic Kural verse. "
            "NEVER invent or alter the original couplet. Keep tone respectful, warm, and concise."
        )
        user_prompt = (
            f"Kural #{ref_k.number}:\nLine 1: {ref_k.line1}\nLine 2: {ref_k.line2}\n"
            f"Translation: {ref_k.translation}\n"
            f"User asked: '{user_msg}'\n"
            f"Target Age Group: {target_age.value}\n"
            f"Language: {'Tamil' if lang_code.startswith('ta') else 'English'}\n\n"
            f"Provide an engaging, conversational, age-appropriate reflection on this Kural for the user."
        )
        ollama_resp = await query_ollama(user_prompt, sys_prompt)
        if ollama_resp:
            verse_header = (
                f"📜 **குறள் {ref_k.number}:**\n> *{ref_k.line1}*\n> *{ref_k.line2}*\n\n"
                if lang_code.startswith("ta")
                else f"📜 **Kural {ref_k.number}:**\n> *\"{ref_k.line1}*\n> *{ref_k.line2}\"*\n\n"
            )
            reply_text = f"{verse_header}{ollama_resp}"
            engine_used = "ollama"

    session["history"].append({"role": "user", "message": user_msg, "time": time.time()})
    session["history"].append({"role": "assistant", "message": reply_text, "time": time.time()})

    return ChatMessageResponse(
        session_id=session_id,
        reply=reply_text,
        detected_language=lang_code,
        age_group=target_age,
        referenced_kurals=referenced_kurals,
        suggested_followups=followups,
        engine_used=engine_used,
    )


def reset_session(session_id: str) -> bool:
    """Clear conversation history for a given session."""
    if session_id in _SESSIONS:
        _SESSIONS[session_id]["history"] = []
        _SESSIONS[session_id]["last_kural_number"] = None
        _SESSIONS[session_id]["last_topic"] = None
        return True
    return False


def get_active_sessions_count() -> int:
    """Return count of active sessions in memory."""
    _clean_expired_sessions()
    return len(_SESSIONS)
