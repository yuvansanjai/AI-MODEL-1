"""Text-to-Speech (TTS) configuration and synthesis helper for Thiruvalluvar AI.

Provides tailored acoustic settings (pitch, rate, timbre) for different age groups
(child, teenager, adult) and languages (Tamil and English) compatible with Web Speech API
and local offline speech engines.
"""

from typing import Dict, Any, List
from app.models import AgeGroup, VoiceConfig, VoiceSettingsResponse


# Preset voice catalog designed for Web Speech API & offline engines
VOICE_CATALOG: List[VoiceConfig] = [
    # Tamil Voices
    VoiceConfig(
        voice_id="ta_child_valluvar",
        name="Valluvar Little Friend (தமிழ் சிறுவர் குரல்)",
        language="ta-IN",
        age_group=AgeGroup.CHILD,
        gender="female",
        pitch=1.25,
        rate=0.95,
        description="Cheerful, warm, and slow-paced Tamil voice ideal for children aged 6-12."
    ),
    VoiceConfig(
        voice_id="ta_teen_mentor",
        name="Valluvar Youth Mentor (தமிழ் இளையோர் குரல்)",
        language="ta-IN",
        age_group=AgeGroup.TEENAGER,
        gender="male",
        pitch=1.05,
        rate=1.0,
        description="Clear, dynamic, and engaging Tamil voice suited for teenagers aged 13-17."
    ),
    VoiceConfig(
        voice_id="ta_adult_sage",
        name="Valluvar Periyavar (அய்யன் திருவள்ளுவர் குரல்)",
        language="ta-IN",
        age_group=AgeGroup.ADULT,
        gender="male",
        pitch=0.90,
        rate=0.90,
        description="Deep, dignified, meditative Tamil voice embodying ancient wisdom."
    ),
    VoiceConfig(
        voice_id="ta_female_general",
        name="Senthamizh Vani (செந்தமிழ் வாணி)",
        language="ta-IN",
        age_group=AgeGroup.ADULT,
        gender="female",
        pitch=1.0,
        rate=0.95,
        description="Standard pure Tamil narration with clear enunciation."
    ),

    # English Voices
    VoiceConfig(
        voice_id="en_child_buddy",
        name="Valluvar Story Buddy (English Child)",
        language="en-IN",
        age_group=AgeGroup.CHILD,
        gender="female",
        pitch=1.20,
        rate=0.92,
        description="Friendly, expressive English voice for story-telling and moral lessons."
    ),
    VoiceConfig(
        voice_id="en_teen_guide",
        name="Valluvar Companion (English Teen)",
        language="en-IN",
        age_group=AgeGroup.TEENAGER,
        gender="male",
        pitch=1.0,
        rate=1.0,
        description="Modern, approachable Indian English accent for youth and students."
    ),
    VoiceConfig(
        voice_id="en_adult_philosopher",
        name="Valluvar Sage (English Adult)",
        language="en-IN",
        age_group=AgeGroup.ADULT,
        gender="male",
        pitch=0.88,
        rate=0.90,
        description="Resonant, steady, reflective Indian English voice for philosophical depth."
    ),
]


def get_voice_settings() -> VoiceSettingsResponse:
    """Return all available voice configurations for the settings endpoint."""
    return VoiceSettingsResponse(
        default_language="ta-IN",
        voices=VOICE_CATALOG
    )


def get_speech_config_for_user(age_group: AgeGroup, language: str = "ta") -> Dict[str, Any]:
    """Get the optimal speech configuration (pitch, rate, voice ID) for a user segment."""
    lang_prefix = "ta" if (language and language.startswith("ta")) else "en"
    
    # Filter voices matching language and age group
    matching_voices = [
        v for v in VOICE_CATALOG
        if v.language.startswith(lang_prefix) and v.age_group == age_group
    ]
    
    if not matching_voices:
        # Fallback to language match
        matching_voices = [v for v in VOICE_CATALOG if v.language.startswith(lang_prefix)]

    selected_voice = matching_voices[0] if matching_voices else VOICE_CATALOG[0]

    return {
        "voice_id": selected_voice.voice_id,
        "language": selected_voice.language,
        "pitch": selected_voice.pitch,
        "rate": selected_voice.rate,
        "web_speech_lang": selected_voice.language,
    }


def format_ssml_kural(line1: str, line2: str, explanation: str, language: str = "ta") -> str:
    """Generate SSML markup with rhythmic pauses between Kural lines."""
    lang_code = "ta-IN" if language.startswith("ta") else "en-IN"
    return f"""<speak version="1.0" xml:lang="{lang_code}">
  <prosody rate="90%">
    <s>{line1}</s>
    <break time="650ms"/>
    <s>{line2}</s>
  </prosody>
  <break time="1000ms"/>
  <prosody rate="95%">
    <p>{explanation}</p>
  </prosody>
</speak>"""
