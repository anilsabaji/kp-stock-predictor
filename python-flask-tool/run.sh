#!/usr/bin/env bash
# =============================================================================
# One-click launcher (macOS / Linux)
# KP + Mundane Astrology NSE Stock Prediction Tool
#
# Usage:  double-click this file, or run  ./run.sh  in a terminal.
# It creates a virtual environment, installs dependencies (first run only),
# starts the web server, and opens the tool in your browser.
# =============================================================================
set -e

# Move to the folder this script lives in (so it works when double-clicked).
cd "$(dirname "$0")"

URL="http://127.0.0.1:5000"

echo "============================================================"
echo "  KP + Mundane Astrology :: NSE Stock Prediction Tool"
echo "============================================================"

# --- 1. Pick a Python interpreter (prefer 3.11, accept 3.10-3.13) ----------
# Prefer 3.13..3.10 (the astronomy library pysweph has ready-made packages for
# all of these, so no compiler is needed).
PY=""
for c in python3.13 python3.12 python3.11 python3.10 python3 python; do
  if command -v "$c" >/dev/null 2>&1 && "$c" -c "import sys; sys.exit(0 if (3,10)<=sys.version_info[:2]<=(3,13) else 1)" >/dev/null 2>&1; then
    PY="$c"; break
  fi
done
if [ -z "$PY" ]; then
  echo "ERROR: Python 3 was not found. Please install Python 3.10+ from python.org"
  read -r -p "Press Enter to exit..." _; exit 1
fi
echo "Using interpreter: $($PY --version 2>&1)"

# --- 2. Create the virtual environment on first run ------------------------
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment (.venv) ..."
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

# --- 3. Install dependencies (skip if already installed) -------------------
if ! python -c "import flask, swisseph, yfinance, pandas" >/dev/null 2>&1; then
  echo "Installing dependencies (first run only, this may take a minute) ..."
  python -m pip install --upgrade pip >/dev/null
  python -m pip install -r requirements.txt
else
  echo "Dependencies already installed."
fi

# --- 4. Open the browser shortly after the server starts -------------------
( sleep 3
  if command -v open       >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  fi
) >/dev/null 2>&1 &

# --- 5. Run the server (Ctrl+C to stop) ------------------------------------
echo "Launching server -> $URL   (press Ctrl+C to stop)"
python app.py
