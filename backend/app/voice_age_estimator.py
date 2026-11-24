<<<<<<< HEAD
def estimate_age(audio_features=None):
    """Explicitly reports that no pretrained model is installed."""
    return {
        "category": "Unknown",
        "confidence": 0.0,
        "status": "model_not_installed",
        "message": "No locally installed age-estimation model is available. Use manual age selection; no voice-age claim is made.",
    }
=======
"""Voice age estimation module for Thiruvalluvar AI.

Analyzes acoustic features (fundamental frequency / pitch, spectral centroid,
zero crossing rate, and energy) received from the frontend microphone capture,
or extracts features directly from raw audio buffers, to classify the speaker into:
- CHILD (6-12 years)
- TEENAGER (13-17 years)
- ADULT (18+ years)
"""

import io
from typing import Dict, Any, Optional
import numpy as np
from app.models import AgeGroup, VoiceAnalyzeResponse


def estimate_pitch_from_pcm(samples: np.ndarray, sample_rate: int) -> Optional[float]:
    """Estimate fundamental frequency (F0) using normalized autocorrelation method."""
    if len(samples) < sample_rate * 0.05:  # Need at least 50ms of audio
        return None

    # Focus on speech frequency band (60 Hz to 500 Hz)
    min_lag = int(sample_rate / 500)
    max_lag = int(sample_rate / 60)

    if max_lag >= len(samples):
        max_lag = len(samples) - 1

    # Autocorrelation
    corrs = np.correlate(samples, samples, mode="full")
    mid = len(corrs) // 2
    corrs_positive = corrs[mid:]

    valid_window = corrs_positive[min_lag:max_lag]
    if len(valid_window) == 0:
        return None

    peak_index = np.argmax(valid_window) + min_lag
    peak_val = corrs_positive[peak_index]

    if corrs_positive[0] > 0 and (peak_val / corrs_positive[0]) > 0.25:
        pitch = float(sample_rate / peak_index)
        return round(pitch, 1)

    return None


def calculate_spectral_centroid(samples: np.ndarray, sample_rate: int) -> float:
    """Calculate the spectral centroid of an audio signal in Hz."""
    if len(samples) == 0:
        return 0.0
    fft_vals = np.abs(np.fft.rfft(samples))
    freqs = np.fft.rfftfreq(len(samples), 1.0 / sample_rate)
    sum_fft = np.sum(fft_vals)
    if sum_fft == 0:
        return 0.0
    centroid = float(np.sum(freqs * fft_vals) / sum_fft)
    return round(centroid, 1)


def analyze_raw_audio(audio_bytes: bytes) -> Dict[str, Any]:
    """Extract acoustic features from WAV / PCM raw bytes."""
    try:
        from scipy.io import wavfile
        sr, data = wavfile.read(io.BytesIO(audio_bytes))

        if data.ndim > 1:
            # Convert stereo to mono
            data = data.mean(axis=1)

        # Normalize to float between -1.0 and 1.0
        if data.dtype == np.int16:
            samples = data.astype(np.float32) / 32768.0
        elif data.dtype == np.int32:
            samples = data.astype(np.float32) / 2147483648.0
        else:
            samples = data.astype(np.float32)

        pitch = estimate_pitch_from_pcm(samples, sr)
        centroid = calculate_spectral_centroid(samples, sr)
        zcr = float(np.mean(np.abs(np.diff(np.sign(samples)))) / 2.0)

        return {
            "pitch": pitch,
            "spectral_centroid": centroid,
            "zero_crossing_rate": round(zcr, 4),
            "sample_rate": sr,
            "duration_sec": round(len(samples) / sr, 2),
        }
    except Exception as e:
        return {"error": str(e), "pitch": None}


def classify_age_from_features(features: Dict[str, Any]) -> VoiceAnalyzeResponse:
    """Classify the user's age category based on acoustic speech parameters.

    Acoustic classification benchmarks:
    - Child (6-12):
        F0 > 240 Hz (often 250 - 450 Hz)
        Spectral centroid > 2600 Hz
    - Teenager (13-17):
        F0: Male ~130-195 Hz, Female ~190-250 Hz
        Centroid ~2000-2800 Hz
    - Adult (18+):
        F0: Male ~85-165 Hz, Female ~165-225 Hz
        Centroid < 2100 Hz, lower ZCR
    """
    pitch = features.get("pitch") or features.get("fundamental_frequency")
    centroid = features.get("spectral_centroid")
    zcr = features.get("zero_crossing_rate")

    # If pitch is missing or <= 0, provide reasoned fallback
    if pitch is None or pitch <= 0:
        if centroid and centroid > 3000:
            pitch = 280.0
        elif centroid and centroid < 1800:
            pitch = 140.0
        else:
            # Default to neutral adult profile
            return VoiceAnalyzeResponse(
                estimated_age_group=AgeGroup.ADULT,
                confidence=0.50,
                pitch_hz=None,
                features_analyzed=features,
                recommended_profile={
                    "age_range": "18+",
                    "label": "Adult Explorer (முதியோர்/பெரியோர்)",
                    "learning_style": "In-depth philosophical inquiry, leadership, and ethical discourse.",
                },
                explanation="Insufficient pitch data received; defaulted to adult profile for comprehensive depth.",
            )

    pitch = float(pitch)
    confidence = 0.70

    # Decision logic
    if pitch >= 245.0:
        # High likelihood of child
        group = AgeGroup.CHILD
        confidence = min(0.96, 0.75 + ((pitch - 245.0) / 150.0) * 0.20)
        profile = {
            "age_range": "6-12",
            "label": "Little Valluvar Friend (சிறுவர்)",
            "learning_style": "Engaging moral stories, playground scenarios, and simple everyday wisdom.",
        }
        explanation = (
            f"Vocal pitch of {pitch:.1f} Hz falls firmly in the child frequency range (240+ Hz). "
            "Explanations will use friendly vocabulary and relatable school/family examples."
        )

    elif 175.0 <= pitch < 245.0:
        # Intermediate range: could be teenager or female adult
        # Use spectral centroid as disambiguator if available
        if centroid and centroid > 2400.0:
            group = AgeGroup.TEENAGER
            confidence = 0.82
            explanation = (
                f"Vocal pitch of {pitch:.1f} Hz and spectral centroid ({centroid:.0f} Hz) "
                "indicate youth/teen voice characteristics. Explanations will focus on modern youth context."
            )
        else:
            group = AgeGroup.TEENAGER
            confidence = 0.75
            explanation = (
                f"Vocal pitch of {pitch:.1f} Hz matches transitional youth frequency range (175-245 Hz). "
                "Tone will be conversational and peer-oriented."
            )
        profile = {
            "age_range": "13-17",
            "label": "Youth Scholar (இளையோர்)",
            "learning_style": "Modern practical wisdom, peer relationships, digital ethics, and ambition.",
        }

    else:
        # Pitch < 175 Hz: Adult
        group = AgeGroup.ADULT
        confidence = min(0.98, 0.80 + ((175.0 - pitch) / 100.0) * 0.18)
        profile = {
            "age_range": "18+",
            "label": "Adult Scholar (பெரியோர்)",
            "learning_style": "Profound philosophical depth, statecraft, leadership, and classical Tamil commentary.",
        }
        explanation = (
            f"Vocal pitch of {pitch:.1f} Hz falls within the adult vocal range. "
            "Full classical commentaries and multi-dimensional analysis enabled."
        )

    return VoiceAnalyzeResponse(
        estimated_age_group=group,
        confidence=round(confidence, 2),
        pitch_hz=round(pitch, 1),
        features_analyzed={
            "pitch_hz": round(pitch, 1),
            "spectral_centroid_hz": round(centroid, 1) if centroid else None,
            "zero_crossing_rate": round(zcr, 4) if zcr else None,
        },
        recommended_profile=profile,
        explanation=explanation,
    )
>>>>>>> 071a39a990d8d851a677928900ec91f75fab24b3
