"""
core/backtest.py
================
Back-testing (requirement #6): compare the astrological prediction against the
ACTUAL historical price movement so the user can judge whether prices follow
the astrological projection.

Two levels:
  * Daily directional test  - for each trading day in a range, compare the
    sign of the day's average astro score with the sign of the day's actual
    return (close vs previous close). Reports a directional "hit rate".
  * Intraday correlation     - for days where 1-minute data is available,
    Pearson correlation between the projected price-path returns and the real
    1-minute returns.

A hit rate near 50% (and correlation near 0) is the statistically expected
result for any non-predictive signal; the back-tester makes that visible.
"""
from __future__ import annotations

import datetime as dt

from config import MARKET_OPEN
from core.prediction import predict_day
from data import market_data


def _avg_astro_score(birth: dt.datetime, day: dt.date, step: int = 15) -> float:
    pred = predict_day(birth, day, step=step)
    return pred["summary"]["avg_score"]


def _pearson(xs, ys) -> float:
    n = len(xs)
    if n < 3:
        return 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    vx = sum((x - mx) ** 2 for x in xs) ** 0.5
    vy = sum((y - my) ** 2 for y in ys) ** 0.5
    if vx == 0 or vy == 0:
        return 0.0
    return cov / (vx * vy)


def daily_backtest(symbol_row: dict, birth: dt.datetime,
                   start: dt.date, end: dt.date) -> dict:
    """Directional hit-rate over a date range using daily closes."""
    hist = market_data.daily_history(symbol_row["yahoo"], start, end)
    rows = []
    hits = 0
    counted = 0
    prev_close = None
    for bar in hist:
        d = dt.date.fromisoformat(bar["date"])
        astro = _avg_astro_score(birth, d, step=15)
        actual_ret = None
        if prev_close is not None and prev_close != 0:
            actual_ret = (bar["close"] - prev_close) / prev_close * 100.0
        astro_dir = "Up" if astro > 0 else "Down" if astro < 0 else "Flat"
        actual_dir = (None if actual_ret is None else
                      "Up" if actual_ret > 0 else "Down" if actual_ret < 0 else "Flat")
        hit = None
        if actual_ret is not None and actual_dir != "Flat" and astro_dir != "Flat":
            hit = (astro_dir == actual_dir)
            counted += 1
            hits += 1 if hit else 0
        rows.append({
            "date": bar["date"],
            "astro_score": round(astro, 2),
            "astro_dir": astro_dir,
            "close": round(bar["close"], 2),
            "actual_return_pct": None if actual_ret is None else round(actual_ret, 3),
            "actual_dir": actual_dir,
            "hit": hit,
        })
        prev_close = bar["close"]

    astro_series = [r["astro_score"] for r in rows[1:]]
    ret_series = [r["actual_return_pct"] for r in rows[1:]]
    pairs = [(a, b) for a, b in zip(astro_series, ret_series) if b is not None]
    corr = _pearson([p[0] for p in pairs], [p[1] for p in pairs]) if pairs else 0.0

    return {
        "mode": "daily",
        "symbol": symbol_row["symbol"],
        "start": start.isoformat(),
        "end": end.isoformat(),
        "rows": rows,
        "summary": {
            "trading_days": len(rows),
            "evaluated": counted,
            "hits": hits,
            "hit_rate_pct": round(100.0 * hits / counted, 2) if counted else None,
            "score_return_correlation": round(corr, 4),
            "note": ("Hit rate ~50% and correlation ~0 indicate no predictive "
                     "edge, the statistically expected outcome."),
        },
    }


def intraday_backtest(symbol_row: dict, birth: dt.datetime,
                      day: dt.date, step: int = 5) -> dict:
    """Overlay + correlation for a single intraday session."""
    bars = market_data.intraday(symbol_row["yahoo"], day)
    if not bars:
        return {"mode": "intraday", "error": "No intraday data for that day "
                "(Yahoo provides only ~7 recent sessions)."}
    anchor = bars[0]["price"]
    pred = predict_day(birth, day, step=step, anchor_price=anchor)

    # Align projection (step-min grid) to actual 1-min bars by timestamp.
    proj_by_time = {pt["time"]: pv
                    for pt, pv in zip(pred["series"], pred["projection"])}
    aligned = []
    for b in bars:
        # nearest earlier projection point
        t = b["time"]
        if t in proj_by_time:
            aligned.append((t, proj_by_time[t], b["price"]))
    # returns
    proj_ret, real_ret = [], []
    for i in range(1, len(aligned)):
        proj_ret.append(aligned[i][1] - aligned[i - 1][1])
        real_ret.append(aligned[i][2] - aligned[i - 1][2])
    corr = _pearson(proj_ret, real_ret)
    # directional hit
    counted = sum(1 for a, b in zip(proj_ret, real_ret) if a != 0 and b != 0)
    hits = sum(1 for a, b in zip(proj_ret, real_ret)
               if a != 0 and b != 0 and (a > 0) == (b > 0))

    return {
        "mode": "intraday",
        "symbol": symbol_row["symbol"],
        "day": day.isoformat(),
        "summary": {
            "points": len(aligned),
            "correlation": round(corr, 4),
            "directional_hits": hits,
            "evaluated": counted,
            "hit_rate_pct": round(100.0 * hits / counted, 2) if counted else None,
        },
    }
