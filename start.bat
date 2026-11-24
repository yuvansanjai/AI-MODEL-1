@echo off
title THIRUVALLUVAR AI Launcher
echo ========================================================
echo           THIRUVALLUVAR AI
echo     Ancient Wisdom. Intelligent Future.
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Backend Server (FastAPI on Port 8000)...
start "Thiruvalluvar AI - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

ping 127.0.0.1 -n 3 >nul

echo [2/3] Starting Frontend Server (Vite on Port 5173)...
start "Thiruvalluvar AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Opening Web Browser...
start http://localhost:5173

echo.
echo ========================================================
echo   Servers are running!
echo   Frontend: http://localhost:5173
echo   Backend API Docs: http://localhost:8000/docs
echo ========================================================
echo.
pause
