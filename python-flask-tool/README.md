# KP + Mundane Astrology — NSE Stock Prediction Tool

A browser-based tool that builds a **Krishnamurti Paddhati (KP) + Mundane
astrology** model for any **NSE-listed stock or index**, computes a
**minute-by-minute** astrological signal, and overlays it on **real NSE prices**
with a **back-tester** to check how the signal tracks actual movements.

> ⚠️ **Astrology-based market forecasting has no scientific validity.** This is
> an educational / astrological-research tool, **not financial advice**. The
> back-tester typically shows ~50% directional accuracy and ~0 correlation —
> i.e. no predictive edge.

## Features
- All ~2,370 NSE equities + major indices (Nifty 50, Bank Nifty, Nifty 100, …)
- Search by **stock code or company name** with autocomplete
- Charts use each company's **NSE listing date** as birth (09:15, Mumbai)
- Full **Panchanga**, planetary **speed / retrograde / declination / direction /
  exaltation / debilitation / combustion**, **Vimshottari Dasha**, KP **sub-lords**
- **Plotly** dual-axis overlay: astro score, projected price, and real NSE price
- **Daily & intraday back-tests** with hit-rate and correlation
- Full **Technical Manual** at `/manual`

## Quick start

### One-click launcher (easiest)
- **Windows:** double-click **`run.bat`**
- **macOS / Linux:** run **`./run.sh`** (or `bash run.sh`)

The launcher creates a virtual environment, installs dependencies on first run,
starts the server, and opens **http://127.0.0.1:5000** in your browser
automatically. Press `Ctrl+C` in the window to stop it.

### Manual start
```bash
cd python-flask-tool
python3.11 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Open **http://127.0.0.1:5000** in your browser.

## Requirements
- **Python 3.10, 3.11, 3.12 or 3.13.** The astronomy library `pysweph` ships
  ready-made packages (wheels) for all of these, so **no C/C++ compiler is
  needed** on Windows, macOS or Linux.
- Python **3.14** has no prebuilt package yet — if that is all you have,
  install 3.13 from https://www.python.org/downloads/

## Troubleshooting

**`error: Microsoft Visual C++ 14.0 or greater is required` / `Failed building
wheel`:**
This means pip could not find a ready-made package for your Python version and
tried to compile from source. Fix:
1. Make sure you are on **Python 3.10–3.13** (3.14 is too new). Check with
   `py -0` (Windows) or `python3 --version`.
2. If needed, install **Python 3.13**: https://www.python.org/downloads/
   (tick *Add python.exe to PATH*).
3. Delete the `.venv` folder inside `python-flask-tool` (the launcher also
   rebuilds it automatically) and double-click **`run.bat`** again.

**`'python' is not recognized`:** Python was not added to PATH. Re-run the
Python installer, choose *Modify*, and enable *Add Python to environment
variables*.

See **TECHNICAL_MANUAL.md** (or the `/manual` page) for every parameter and rule.
