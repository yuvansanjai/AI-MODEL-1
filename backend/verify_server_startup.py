"""Verify that uvicorn can serve the FastAPI application via HTTP."""

import subprocess
import sys
import time
import urllib.request
import json
from pathlib import Path

def test_live_server():
    print("Starting uvicorn server process...")
    backend_path = Path(__file__).resolve().parent
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8008"],
        cwd=str(backend_path),
        text=True
    )

    try:
        url = "http://127.0.0.1:8008/api/health"
        started = False
        import requests
        for i in range(20):
            time.sleep(0.5)
            try:
                resp = requests.get(url, timeout=1.0)
                if resp.status_code == 200:
                    data = resp.json()
                    print("Server responded successfully!")
                    print("Response from /api/health:", data)
                    assert data["status"] == "healthy"
                    assert data["total_kurals_indexed"] == 1330
                    started = True
                    break
            except Exception as e:
                print("Connection attempt failed:", type(e).__name__, e)

        if not started:
            print("Server did not respond in time.")
            sys.exit(1)

        print("Live server test PASSED!")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()
        print("Server process cleanly stopped.")

if __name__ == "__main__":
    test_live_server()
