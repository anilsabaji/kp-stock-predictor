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

See **TECHNICAL_MANUAL.md** (or the `/manual` page) for every parameter and rule.
