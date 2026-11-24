#!/bin/bash
# Thiruvalluvar AI - One-click Launcher (Linux/macOS)

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           THIRUVALLUVAR AI                               ║"
echo "║     Ancient Wisdom. Intelligent Future.                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    exit 1
fi

# Setup Backend
echo "[1/4] Setting up backend..."
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    echo "       Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt --quiet 2>/dev/null

if [ ! -f "database/kurals.db" ]; then
    echo "       Building Thirukkural database..."
    python database/import_kurals.py
    python database/validate_database.py
fi

# Setup Frontend
echo "[2/4] Setting up frontend..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "       Installing frontend dependencies..."
    npm install --silent 2>/dev/null
fi

# Start Backend
echo "[3/4] Starting backend server..."
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

# Start Frontend
echo "[4/4] Starting frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

sleep 3

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Thiruvalluvar AI is running!                            ║"
echo "║  Frontend:  http://localhost:5173                        ║"
echo "║  Backend:   http://localhost:8000                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
elif command -v open &> /dev/null; then
    open http://localhost:5173
fi

# Trap Ctrl+C
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

wait
