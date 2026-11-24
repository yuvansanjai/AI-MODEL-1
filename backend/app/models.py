"""Pydantic models and schemas for Thiruvalluvar AI API."""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AgeGroup(str, Enum):
    CHILD = "child"
    CHILDREN = "children"
    TEENAGER = "teenager"
    TEENAGERS = "teenagers"
    ADULT = "adult"
    ADULTS = "adults"


class SupportedLanguage(str, Enum):
    TAMIL = "ta"
    ENGLISH = "en"


class Kural(BaseModel):
    number: int = Field(..., description="Kural number between 1 and 1330", ge=1, le=1330)
    line1: str = Field(..., description="First line of the Kural (4 metrical feet)")
    line2: str = Field(..., description="Second line of the Kural (3 metrical feet)")
    translation: str = Field(..., description="English translation")
    explanation_tam: Optional[str] = Field(None, description="Traditional Tamil explanation")
    explanation_eng: Optional[str] = Field(None, description="English explanation")
    chapter_number: int = Field(..., description="Chapter number (1 to 133)", ge=1, le=133)
    chapter_tamil: str = Field(..., description="Chapter name in Tamil")
    chapter_english: str = Field(..., description="Chapter name in English")
    section_tamil: str = Field(..., description="Paal in Tamil (அறத்துப்பால் / பொருட்பால் / காமத்துப்பால்)")
    section_english: str = Field(..., description="Paal in English (Virtue / Wealth / Love)")
    group_tamil: Optional[str] = Field(None, description="Iyal in Tamil")
    group_english: Optional[str] = Field(None, description="Iyal in English")
    couplet: Optional[str] = Field(None, description="Full two-line couplet")
    transliteration: Optional[str] = Field(None, description="Romanized Tamil transliteration")
    mv_explanation: Optional[str] = Field(None, description="Dr. M. Varadarajan explanation")
    sp_explanation: Optional[str] = Field(None, description="Solomon Pappaiah explanation")
    mk_explanation: Optional[str] = Field(None, description="M. Karunanidhi explanation")


class AgeAdaptedExplanation(BaseModel):
    age_group: AgeGroup
    explanation: str
    real_world_example: str
    moral_takeaway: str
    vocabulary_notes: Optional[Dict[str, str]] = Field(default_factory=dict)
    tone: str


class KuralDetail(Kural):
    adapted_explanation: Optional[AgeAdaptedExplanation] = None


class KuralListResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    kurals: List[Kural]


class ChapterSummary(BaseModel):
    number: int
    name_tamil: str
    name_english: str
    section_tamil: str
    section_english: str
    group_tamil: Optional[str] = None
    group_english: Optional[str] = None
    start_kural: int
    end_kural: int


class ChapterDetail(ChapterSummary):
    kurals: List[Kural]


class ChapterListResponse(BaseModel):
    total: int
    chapters: List[ChapterSummary]


class TopicSummary(BaseModel):
    id: str
    title_english: str
    title_tamil: str
    description_english: str
    description_tamil: str
    icon: str
    sample_kural_numbers: List[int]
    total_kurals: int


class SearchResultItem(BaseModel):
    kural: Kural
    score: float
    matched_field: str


class SearchResponse(BaseModel):
    query: str
    total_matches: int
    results: List[SearchResultItem]


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User's query or message")
    age_group: Optional[AgeGroup] = Field(AgeGroup.ADULT, description="Target age group")
    language: Optional[SupportedLanguage] = Field(None, description="Language override ('ta' or 'en')")
    session_id: Optional[str] = Field(None, description="Conversation session ID for continuity")


class ChatMessageResponse(BaseModel):
    session_id: str
    reply: str
    detected_language: str
    age_group: AgeGroup
    referenced_kurals: List[Kural] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    engine_used: str = Field("deterministic", description="'ollama' or 'deterministic'")


class VoiceFeaturesInput(BaseModel):
    pitch: Optional[float] = Field(None, description="Fundamental frequency / pitch in Hz")
    fundamental_frequency: Optional[float] = Field(None, description="Alternative name for pitch in Hz")
    spectral_centroid: Optional[float] = Field(None, description="Spectral centroid in Hz")
    zero_crossing_rate: Optional[float] = Field(None, description="Zero crossing rate")
    speaking_rate: Optional[float] = Field(None, description="Speaking rate in syllables/sec")
    energy: Optional[float] = Field(None, description="RMS energy")


class VoiceAnalyzeResponse(BaseModel):
    estimated_age_group: AgeGroup
    confidence: float
    pitch_hz: Optional[float] = None
    features_analyzed: Dict[str, Any]
    recommended_profile: Dict[str, str]
    explanation: str


class VoiceConfig(BaseModel):
    voice_id: str
    name: str
    language: str
    age_group: AgeGroup
    gender: str
    pitch: float
    rate: float
    description: str


class VoiceSettingsResponse(BaseModel):
    default_language: str
    voices: List[VoiceConfig]


class HealthResponse(BaseModel):
    status: str
    version: str
    database_connected: bool
    total_kurals_indexed: int
    ollama_available: bool
    active_sessions: int
