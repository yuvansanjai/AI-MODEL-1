# Local AI Models & Offline Speech Setup Guide
## Thiruvalluvar AI (Zero-Cloud Operation)

Thiruvalluvar AI contains built-in deterministic pedagogical explanation engines and local acoustic estimators that function without downloading external LLM weights. However, users wishing to enhance natural language chat capabilities and local speech processing can integrate local models as outlined below.

---

### 1. Local Language Model Integration (Ollama / Llama.cpp)

The backend (`backend/app/chatbot.py`) automatically discovers and communicates with a local **Ollama** daemon running on `http://localhost:11434`.

#### Supported Small Quantized Models for Edge Hardware:
- **Llama 3.2 1B / 3B** (`ollama run llama3.2:1b` or `ollama run llama3.2:3b`) - Fast, low RAM (~1.3 GB)
- **Qwen 2.5 1.5B / 7B** (`ollama run qwen2.5:1.5b`) - Multilingual capabilities with Tamil token support
- **Gemma 2 2B** (`ollama run gemma2:2b`) - Clean structured output

#### Installation:
1. Download Ollama from https://ollama.ai
2. Pull your chosen model:
   ```bash
   ollama pull qwen2.5:1.5b
   ```
3. Set your environment variable in `backend/.env` (optional, defaults to `llama3` / `llama3.2:1b`):
   ```env
   OLLAMA_MODEL=qwen2.5:1.5b
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_TIMEOUT_SECONDS=8.0
   ```
4. If Ollama is running, the backend routes contextual explanations through it while anchoring strictly to authentic Kural database records.
5. If Ollama is stopped, times out (> 8s), or is unavailable, the backend gracefully falls back to its internal deterministic engine with zero downtime.

---

### 2. Offline Speech Recognition (STT)

#### Local Faster-Whisper (`faster-whisper`)
The primary speech recognition engine utilizes CTranslate2-accelerated Whisper models on CPU:
- **Model**: `tiny` with `int8` quantization (approx. 75 MB download, cached locally in `~/.cache/huggingface/hub`).
- **Inference**: High-speed offline transcription (< 400ms on modern desktop CPUs).
- **Languages**: Both Tamil (`ta`) and Indian English (`en`).
- **Endpoint**: Integrated into `POST /api/transcribe` and `POST /api/voice-query`.

```bash
cd backend
pip install faster-whisper
```

#### Browser Web Speech API Fallback
Modern browsers (Google Chrome, Microsoft Edge) provide built-in SpeechRecognition interfaces:
- Tamil: `ta-IN`
- English: `en-IN` / `en-US`

---

### 3. Studio-Grade Text-to-Speech (TTS) Setup

#### Dual-Engine Architecture (`backend/app/stt_tts.py`)
1. **Piper TTS (Fast Local ONNX Neural Engine):**
   - Direct local offline inference using VITS ONNX model.
   - Model Path: `backend/models/piper/ta_IN-ValluvarNeural-medium.onnx`.
   - Produces raw audio without internet connection.
2. **Neural Voice Engine (`edge-tts` + PyAV):**
   - High-fidelity natural Tamil speech personas:
     - `ta-IN-ValluvarNeural` (Sage/Adult/Teenager): Measured, dignified, deep tone.
     - `ta-IN-PallaviNeural` (Children): Gentle, warm, melodic tone.
     - `en-IN-PrabhatNeural` & `en-IN-NeerjaNeural` (Indian English).
   - Couplet Cadence Formatting: Inserts a poetic pause (`... ...`) between Line 1 (4 feet) and Line 2 (3 feet) for authentic recitation.
   - Transcoding: Converted via `PyAV` to standard 16-bit PCM `.wav` streams returned with `Content-Type: audio/wav`.

---

### 4. Acoustic Voice Age Estimation Pipeline

The voice age estimator operates locally via dual pipelines:

1. **Client-Side Spectral Feature Extractor (`audioAnalyzer.ts`)**:
   - Computes Fundamental Frequency ($F_0$) via normalized time-domain autocorrelation.
   - Computes Spectral Centroid via Fast Fourier Transform (FFT) frequency distribution.
   - Measures Zero-Crossing Rate (ZCR) and Root-Mean-Square (RMS) energy.
2. **Server-Side Classifier (`voice_age_estimator.py`)**:
   - Multi-feature heuristic and Gaussian prior classification:
     - **Child-like voice**: $F_0 > 245\text{ Hz}$, high spectral centroid (> 2200 Hz)
     - **Teenager-like voice**: $175\text{ Hz} \le F_0 \le 245\text{ Hz}$, intermediate spectral balance
     - **Adult-like voice**: $F_0 < 175\text{ Hz}$, low centroid (< 1800 Hz)
   - Outputs a normalized confidence score $[0.0, 1.0]$.
   - When confidence is below threshold ($< 0.65$), flag as `unknown` and gracefully prompt for manual UI selection.
