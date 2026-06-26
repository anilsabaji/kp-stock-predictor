"""
app.py
======
Flask web server for the KP + Mundane Astrology NSE Stock Prediction tool.

Run:
    python app.py
Then open the printed HTML link (default http://127.0.0.1:5000).

DISCLAIMER: Astrology-based market forecasting has no scientific validity.
This is an educational / astrological-research tool, NOT financial advice.
"""
from __future__ import annotations

import datetime as dt

from flask import Flask, jsonify, render_template, request

from config import (DEFAULT_BIRTH_TIME, DEFAULT_PLACE, MUMBAI_LAT, MUMBAI_LON,
                    PLANET_POLARITY)
from core import backtest as bt
from core import dasha as dasha_mod
from core import dignity as dignity_mod
from core import panchanga as panchanga_mod
from core import prediction
from core.ephemeris import (all_planets, ascendant_and_cusps,
                            house_of_longitude)
from core.kp import deg_to_dms, resolve
from data import market_data, symbols

app = Flask(__name__)


def _birth_dt(row: dict) -> dt.datetime:
    """Construct the chart birth datetime: listing date @ 09:15 IST, Mumbai."""
    ld = row.get("listing_date")
    if not ld:
        ld = "2000-01-01"  # fallback if NSE master lacks a date
    h, m = map(int, DEFAULT_BIRTH_TIME.split(":"))
    return dt.datetime.strptime(ld, "%Y-%m-%d").replace(hour=h, minute=m)


def _require_symbol(sym: str):
    row = symbols.lookup(sym)
    if not row:
        # also allow matching an index display name
        for r in symbols.all_symbols():
            if r["symbol"].lower() == (sym or "").lower():
                row = r
                break
    return row


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/manual")
def manual():
    import os
    path = os.path.join(os.path.dirname(__file__), "TECHNICAL_MANUAL.md")
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except FileNotFoundError:
        text = "# Technical Manual\nNot generated yet."
    return render_template("manual.html", content=text)


# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------
@app.route("/api/search")
def api_search():
    q = request.args.get("q", "")
    return jsonify(symbols.search(q, limit=int(request.args.get("limit", 15))))


@app.route("/api/symbol")
def api_symbol():
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    return jsonify(row)


@app.route("/api/chart_info")
def api_chart_info():
    """Natal chart of the company/index at its NSE birth moment."""
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    birth = _birth_dt(row)
    asc, cusps = ascendant_and_cusps(birth)
    planets = all_planets(birth)
    sun_lon = planets["Sun"]["longitude"]

    planet_rows = []
    for name, st in planets.items():
        dig = dignity_mod.dignity(name, st["longitude"], sun_lon,
                                  st["retrograde"], st["declination"])
        kp = resolve(st["longitude"])
        planet_rows.append({
            "planet": name,
            "position": deg_to_dms(st["longitude"]),
            "longitude": round(st["longitude"], 4),
            "sign": kp["sign"],
            "nakshatra": kp["nakshatra"],
            "star_lord": kp["star_lord"],
            "sub_lord": kp["sub_lord"],
            "house": house_of_longitude(st["longitude"], cusps),
            "retrograde": st["retrograde"],
            "speed": round(st["speed"], 4),
            "declination": round(st["declination"], 3),
            "declination_dir": st["declination_dir"],
            "direction": dig["direction"],
            "dignity": dig["state"],
            "combust": dig["combust"],
            "strength": dig["strength"],
            "polarity": PLANET_POLARITY.get(name, 0.0),
            "flags": dig["flags"],
        })

    asc_kp = resolve(asc)
    now = dt.datetime.now()
    return jsonify({
        "symbol": row["symbol"],
        "name": row["name"],
        "type": row["type"],
        "birth": {
            "date": row.get("listing_date"),
            "time": DEFAULT_BIRTH_TIME,
            "place": DEFAULT_PLACE,
            "lat": MUMBAI_LAT, "lon": MUMBAI_LON,
        },
        "ascendant": {
            "position": deg_to_dms(asc),
            "sign": asc_kp["sign"],
            "nakshatra": asc_kp["nakshatra"],
            "star_lord": asc_kp["star_lord"],
            "sub_lord": asc_kp["sub_lord"],
        },
        "cusps": [round(c, 3) for c in cusps],
        "planets": planet_rows,
        "panchanga_at_birth": panchanga_mod.compute(birth),
        "dasha_now": dasha_mod.current(birth, now),
    })


@app.route("/api/predict")
def api_predict():
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    step = int(request.args.get("step", 5))
    date_str = request.args.get("date")
    day = (dt.date.fromisoformat(date_str) if date_str else dt.date.today())
    birth = _birth_dt(row)

    # current-day live transit panchanga & dasha for the info panel
    ref = dt.datetime.combine(day, dt.time(9, 15))
    pred = prediction.predict_day(birth, day, step=step, anchor_price=100.0)
    pred["panchanga"] = panchanga_mod.compute(ref)
    pred["dasha"] = dasha_mod.current(birth, ref)
    pred["symbol"] = row["symbol"]
    pred["name"] = row["name"]
    return jsonify(pred)


@app.route("/api/prices")
def api_prices():
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    date_str = request.args.get("date")
    day = dt.date.fromisoformat(date_str) if date_str else None
    bars = market_data.intraday(row["yahoo"], day)
    return jsonify({"symbol": row["symbol"], "bars": bars,
                    "available_days": market_data.available_intraday_days(row["yahoo"])})


@app.route("/api/days")
def api_days():
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    return jsonify({"days": market_data.available_intraday_days(row["yahoo"])})


@app.route("/api/quote")
def api_quote():
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    return jsonify(market_data.latest_quote(row))


@app.route("/api/backtest")
def api_backtest():
    row = _require_symbol(request.args.get("symbol", ""))
    if not row:
        return jsonify({"error": "symbol not found"}), 404
    birth = _birth_dt(row)
    mode = request.args.get("mode", "daily")
    if mode == "intraday":
        day = dt.date.fromisoformat(request.args["day"])
        return jsonify(bt.intraday_backtest(row, birth, day,
                                            step=int(request.args.get("step", 5))))
    end = (dt.date.fromisoformat(request.args["end"]) if request.args.get("end")
           else dt.date.today())
    start = (dt.date.fromisoformat(request.args["start"])
             if request.args.get("start") else end - dt.timedelta(days=60))
    return jsonify(bt.daily_backtest(row, birth, start, end))


@app.route("/api/refresh_symbols", methods=["POST"])
def api_refresh():
    ok = symbols.refresh_csv()
    return jsonify({"ok": ok, "count": len(symbols.all_symbols())})


if __name__ == "__main__":
    print("\n" + "=" * 64)
    print("  KP + Mundane Astrology  ::  NSE Stock Prediction Tool")
    print("  Open this link in your browser:")
    print("      http://127.0.0.1:5000")
    print("  Technical manual:  http://127.0.0.1:5000/manual")
    print("  (Educational / astrological tool - NOT financial advice)")
    print("=" * 64 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
