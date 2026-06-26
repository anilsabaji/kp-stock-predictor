@echo off
REM ==========================================================================
REM  One-click launcher (Windows)
REM  KP + Mundane Astrology NSE Stock Prediction Tool
REM
REM  Works with Python 3.10, 3.11, 3.12 or 3.13. The astronomy library
REM  (pysweph) ships ready-made packages for all of these, so NO C++ compiler
REM  is needed. (Python 3.14 has no package yet - use 3.13 or earlier.)
REM ==========================================================================
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set "URL=http://127.0.0.1:5000"

echo ============================================================
echo   KP + Mundane Astrology :: NSE Stock Prediction Tool
echo ============================================================

REM --- 1. Find a SUPPORTED Python (3.13 -> 3.10) ---------------------------
set "PY="
for %%V in (3.13 3.12 3.11 3.10) do (
  if not defined PY (
    py -%%V -c "import sys" >nul 2>&1 && set "PY=py -%%V"
  )
)
REM Fall back to a plain 'python' if it is in the 3.10-3.13 range
if not defined PY (
  for /f "delims=" %%P in ('where python 2^>nul') do (
    if not defined PY (
      "%%P" -c "import sys;sys.exit(0 if (3,10)<=sys.version_info[:2]<=(3,13) else 1)" >nul 2>&1 && set "PY=%%P"
    )
  )
)

if not defined PY (
  echo.
  echo  -------------------------------------------------------------------
  echo   Could not find a compatible Python ^(need 3.10, 3.11, 3.12 or 3.13^).
  echo.
  echo   Please install Python 3.13 from:
  echo       https://www.python.org/downloads/
  echo   During install, TICK "Add python.exe to PATH".
  echo   Then double-click run.bat again.
  echo  -------------------------------------------------------------------
  echo.
  pause
  exit /b 1
)
echo Using interpreter: %PY%

REM --- 2. Rebuild venv if it was created with an unsupported Python ---------
if exist ".venv\Scripts\python.exe" (
  .venv\Scripts\python.exe -c "import sys;sys.exit(0 if (3,10)<=sys.version_info[:2]<=(3,13) else 1)" >nul 2>&1
  if errorlevel 1 (
    echo Existing .venv uses an unsupported Python - rebuilding it...
    rmdir /s /q .venv
  )
)

REM --- 3. Create the virtual environment if needed -------------------------
if not exist ".venv\Scripts\python.exe" (
  echo Creating virtual environment ^(.venv^) ...
  %PY% -m venv .venv
)
call .venv\Scripts\activate.bat

REM --- 4. Install dependencies (skip if already present) -------------------
python -c "import flask, swisseph, yfinance, pandas" >nul 2>&1
if errorlevel 1 (
  echo Installing dependencies ^(first run only, may take a minute^) ...
  python -m pip install --upgrade pip >nul
  python -m pip install -r requirements.txt
  if errorlevel 1 (
    echo.
    echo  ERROR: dependency installation failed. See messages above.
    pause
    exit /b 1
  )
) else (
  echo Dependencies already installed.
)

REM --- 5. Open the browser after a short delay ------------------------------
start "" cmd /c "timeout /t 3 >nul & start %URL%"

REM --- 6. Run the server ----------------------------------------------------
echo Launching server -> %URL%   (press Ctrl+C to stop)
python app.py

pause
