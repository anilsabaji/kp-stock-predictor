@echo off
REM ==========================================================================
REM  One-click launcher (Windows)
REM  KP + Mundane Astrology NSE Stock Prediction Tool
REM
REM  Usage: double-click run.bat
REM  Creates a virtual environment, installs dependencies (first run only),
REM  starts the web server, and opens the tool in your browser.
REM ==========================================================================
setlocal
cd /d "%~dp0"
set "URL=http://127.0.0.1:5000"

echo ============================================================
echo   KP + Mundane Astrology :: NSE Stock Prediction Tool
echo ============================================================

REM --- 1. Find a Python launcher / interpreter ------------------------------
set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY (
  where python >nul 2>&1 && set "PY=python"
)
if not defined PY (
  echo ERROR: Python 3 was not found. Install Python 3.10+ from python.org
  echo        and tick "Add Python to PATH" during installation.
  pause
  exit /b 1
)
echo Using interpreter: %PY%

REM --- 2. Create the virtual environment on first run -----------------------
if not exist ".venv" (
  echo Creating virtual environment ^(.venv^) ...
  %PY% -m venv .venv
)
call .venv\Scripts\activate.bat

REM --- 3. Install dependencies (skip if already installed) ------------------
python -c "import flask, swisseph, yfinance, pandas" >nul 2>&1
if errorlevel 1 (
  echo Installing dependencies ^(first run only, may take a minute^) ...
  python -m pip install --upgrade pip >nul
  python -m pip install -r requirements.txt
) else (
  echo Dependencies already installed.
)

REM --- 4. Open the browser after a short delay ------------------------------
start "" cmd /c "timeout /t 3 >nul & start %URL%"

REM --- 5. Run the server ----------------------------------------------------
echo Launching server -> %URL%   (press Ctrl+C to stop)
python app.py

pause
