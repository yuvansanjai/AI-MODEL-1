# Windows Deployment & Operation Guide
## Thiruvalluvar AI (100% Offline Educational Platform)

This guide provides step-by-step instructions for deploying and running Thiruvalluvar AI on Windows 10/11 systems without active internet connection after setup.

---

### 1. System Requirements

- **Operating System**: Windows 10 (64-bit) or Windows 11
- **CPU**: Intel Core i3 / AMD Ryzen 3 or higher
- **RAM**: 4 GB minimum (8 GB recommended for running local LLMs)
- **Disk Space**: 1 GB for base application + database; 4–8 GB if using local Ollama model
- **Audio**: Microphone (built-in or USB headset) and Speakers / Headset

---

### 2. Software Prerequisites

Before going offline, install the following software packages once:

1. **Python 3.10+** (64-bit)
   - Download from: https://www.python.org/downloads/
   - **Important**: Check the box **"Add Python to PATH"** during installation.

2. **Node.js 18+ LTS**
   - Download from: https://nodejs.org/
   - Standard installer with npm included.

3. *(Optional)* **Ollama for Windows** (For local LLM explanation generation)
   - Download installer: https://ollama.ai/download/windows
   - Run in PowerShell: `ollama run llama3.2:1b` or `ollama run qwen2.5:1.5b`

---

### 3. One-Click Quick Launch

A pre-configured Windows launcher script is located in the root directory:

```batch
# Navigate to the project folder and double-click or run:
start.bat
```

The script will automatically:
1. Verify Python and Node.js in the environment.
2. Initialize the Python virtual environment (`backend/venv`).
3. Install or verify required Python dependencies.
4. Verify the integrity of `backend/database/kurals.db` (1,330 Kurals).
5. Start the FastAPI backend server on `http://localhost:8000`.
6. Start the React development frontend on `http://localhost:5173`.
7. Launch your default browser to `http://localhost:5173`.

---

### 4. Manual Step-by-Step Launch

If you prefer to run services in separate terminal windows:

#### Terminal 1: Backend Server
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

#### Terminal 2: Frontend Client
```powershell
cd frontend
npm install
npm run dev
```
- Frontend Web App: `http://localhost:5173`

---

### 5. Running as a Static Production Build

To run with maximum performance without the Vite development server:

```powershell
cd frontend
npm run build
```

You can serve the static build directly using Python from the root or frontend folder:
```powershell
cd frontend/dist
python -m http.server 5173
```
Or configure FastAPI to mount the `frontend/dist` directory as static assets.

---

### 6. Microphone & Audio Setup on Windows

1. Open **Windows Settings** -> **Privacy & Security** -> **Microphone**.
2. Ensure **"Microphone access"** is enabled.
3. Ensure **"Let desktop apps access your microphone"** is turned ON.
4. When prompted by Chrome / Edge on `http://localhost:5173`, click **"Allow"** to enable the Web Audio API and Speech Recognition features.

---

### 7. Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `python is not recognized` | Reinstall Python and ensure "Add Python to PATH" is ticked. |
| Port 8000 already in use | Run `netstat -ano \| findstr :8000` and terminate the PID with `taskkill /PID <PID> /F`. |
| Port 5173 already in use | Vite will automatically switch to 5174, or specify `--port 5173` explicitly. |
| TTS Voice not speaking Tamil | In Windows Settings -> Time & Language -> Speech, install the Tamil (India) language pack. |
